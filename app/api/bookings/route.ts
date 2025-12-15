/**
 * Bookings API Route
 * 
 * Handles booking creation, listing, and management.
 * Production-ready with proper validation, error handling, and security.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Role, BookingStatus } from "@prisma/client";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";
import { captureBookingError } from "@/lib/monitoring/sentry-alerts";
import {
  createBookingSchema,
  calculatePrice,
  validateBookingTime,
  validateAvailability,
  checkConflicts,
  isUserPenalized,
} from "@/lib/booking/validation";
import { checkTimeSlotAvailability } from "@/lib/booking/availability";

/**
 * GET /api/bookings
 * 
 * List bookings for the authenticated user
 * - Students see their own bookings
 * - Tutors see bookings for their profile
 * - Admins see all bookings
 * Rate limited: 30 requests per minute
 */
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimit = await checkRateLimit(request, "GENERAL");
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
  }

  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as BookingStatus | null;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let where: any = {};

    if (user.role === Role.STUDENT) {
      where.studentId = user.id;
    } else if (user.role === Role.TUTOR) {
      const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!tutorProfile) {
        return createErrorResponse(
          Errors.NotFound("Tutor profile not found")
        );
      }

      where.tutorId = tutorProfile.id;
    }
    // Admins can see all bookings (no filter)

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
      take: Math.min(limit, 100), // Max 100 per request
      skip: offset,
    });

    const total = await prisma.booking.count({ where });

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + bookings.length < total,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to fetch bookings", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to fetch bookings. Please try again."
    );
  }
}

/**
 * POST /api/bookings
 * 
 * Create a new booking
 * - Only students can create bookings
 * - Validates availability, conflicts, and business rules
 * - Calculates price automatically
 * Rate limited: 10 requests per minute
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimit = await checkRateLimit(request, "BOOKING");
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
  }

  try {
    // Only students can create bookings
    const user = await requireRole(Role.STUDENT);

    // Check if user is penalized
    const penalized = await isUserPenalized(user.id, prisma);
    if (penalized) {
      return createErrorResponse(
        Errors.BadRequest(
          "You are currently penalized and cannot create new bookings. Please submit an appeal if you believe this is an error."
        )
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const tutorId = validatedData.tutorId;
    const scheduledAt = new Date(validatedData.scheduledAt);
    const duration = parseInt(validatedData.duration);

    // Fetch tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        availability: {
          where: { isActive: true },
        },
      },
    });

    if (!tutorProfile) {
      return createErrorResponse(Errors.NotFound("Tutor not found"));
    }

    if (!tutorProfile.isActive) {
      return createErrorResponse(
        Errors.BadRequest("Tutor profile is not active")
      );
    }

    if (tutorProfile.approvalStatus !== "APPROVED") {
      return createErrorResponse(
        Errors.BadRequest("Tutor profile is not approved")
      );
    }

    // Validate booking time
    const timeValidation = validateBookingTime(scheduledAt);
    if (!timeValidation.valid) {
      return createErrorResponse(
        Errors.BadRequest(timeValidation.error || "Invalid booking time")
      );
    }

    // Validate availability
    const availabilityValidation = validateAvailability(
      scheduledAt,
      duration,
      tutorProfile.availability
    );
    if (!availabilityValidation.valid) {
      return createErrorResponse(
        Errors.BadRequest(
          availabilityValidation.error || "Time slot not available"
        )
      );
    }

    // Check for conflicts with existing bookings
    // Only fetch necessary fields to reduce data transfer
    const existingBookings = await prisma.booking.findMany({
      where: {
        tutorId,
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        tutorId: true,
        status: true,
      },
    });

    const conflictCheck = checkConflicts(
      scheduledAt,
      duration,
      tutorId,
      existingBookings
    );

    if (conflictCheck.hasConflict) {
      return createErrorResponse(
        Errors.Conflict(
          "This time slot is already booked. Please choose another time."
        )
      );
    }

    // Calculate price
    const price = calculatePrice(duration, tutorProfile.hourlyRate);

    // Create booking in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check for conflicts (race condition prevention)
      const lastMinuteCheck = await tx.booking.findFirst({
        where: {
          tutorId,
          scheduledAt: {
            gte: scheduledAt,
            lt: new Date(scheduledAt.getTime() + duration * 60 * 1000),
          },
          status: {
            notIn: ["CANCELLED", "REFUNDED"],
          },
        },
      });

      if (lastMinuteCheck) {
        throw Errors.Conflict(
          "This time slot was just booked by another student. Please choose another time."
        );
      }

      // Create the booking
      return await tx.booking.create({
        data: {
          studentId: user.id,
          tutorId,
          scheduledAt,
          duration,
          status: BookingStatus.PENDING,
          price,
          notes: validatedData.notes,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tutor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    logger.info("Booking created", {
      bookingId: booking.id,
      studentId: user.id,
      tutorId,
      scheduledAt: booking.scheduledAt.toISOString(),
    });

    // Create Stripe checkout session immediately for payment
    try {
      const { getStripeClient, isStripeConfigured } = await import("@/lib/stripe/client");
      
      if (isStripeConfigured()) {
        const stripe = getStripeClient();
        if (stripe) {
          // Get base URL for redirects
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                         process.env.NEXTAUTH_URL || 
                         request.headers.get("origin") || 
                         (process.env.NODE_ENV === "production" 
                           ? "https://linglix.com"
                           : "http://localhost:3000");

          // Extract locale from request if available (from headers or body)
          const locale = request.headers.get("x-locale") || "en";
          const tutorSlug = tutorProfile.user.name?.toLowerCase().replace(/\s+/g, "-") || "tutor";

          // Create Stripe Checkout Session
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: `Tutoring Session with ${booking.tutor.user.name || "Tutor"}`,
                    description: `${booking.duration}-minute session scheduled for ${new Date(booking.scheduledAt).toLocaleDateString()}`,
                  },
                  unit_amount: Math.round(booking.price * 100), // Convert to cents
                },
                quantity: 1,
              },
            ],
            customer_email: booking.student.email,
            metadata: {
              bookingId: booking.id,
              studentId: booking.studentId,
              tutorId: booking.tutorId,
              duration: booking.duration.toString(),
              scheduledAt: booking.scheduledAt.toISOString(),
            },
            success_url: `${baseUrl}/${locale}/dashboard?payment=success`,
            cancel_url: `${baseUrl}/${locale}/tutors/${tutorSlug}/book?canceled=true`,
            expires_at: (() => {
              // Stripe requires expires_at to be within 24 hours
              // Set to 24 hours from now, or booking time if sooner
              const now = Math.floor(Date.now() / 1000);
              const maxExpiry = now + (24 * 60 * 60); // 24 hours from now
              const bookingTime = Math.floor(booking.scheduledAt.getTime() / 1000);
              return Math.min(maxExpiry, bookingTime);
            })(),
            payment_intent_data: {
              metadata: {
                bookingId: booking.id,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
              },
            },
          });

          // Update booking with checkout session ID
          await prisma.booking.update({
            where: { id: booking.id },
            data: { paymentId: session.id },
          });

          logger.info("Checkout session created for booking", {
            bookingId: booking.id,
            sessionId: session.id,
          });

          return NextResponse.json(
            {
              message: "Booking created successfully. Please complete payment.",
              booking,
              checkoutUrl: session.url,
              sessionId: session.id,
            },
            { status: 201 }
          );
        }
      }
    } catch (paymentError) {
      logger.error("Failed to create checkout session for booking", {
        bookingId: booking.id,
        error: paymentError instanceof Error ? paymentError.message : String(paymentError),
      });
      
      // If payment setup fails, delete the booking and return an error
      // This ensures we don't have unpaid bookings
      await prisma.booking.delete({
        where: { id: booking.id },
      });
      
      return createErrorResponse(
        Errors.InternalServerError(
          paymentError instanceof Error 
            ? `Failed to create payment session: ${paymentError.message}`
            : "Failed to create payment session. Please try again."
        )
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.issues[0]?.message || "Invalid request")
      );
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to create booking", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to create booking. Please try again."
    );
  }
}

