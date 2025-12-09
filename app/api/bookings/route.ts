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
import {
  createBookingSchema,
  calculatePrice,
  validateBookingTime,
  validateAvailability,
  checkConflicts,
} from "@/lib/booking/validation";
import { checkTimeSlotAvailability } from "@/lib/booking/availability";

/**
 * GET /api/bookings
 * 
 * List bookings for the authenticated user
 * - Students see their own bookings
 * - Tutors see bookings for their profile
 * - Admins see all bookings
 */
export async function GET(request: NextRequest) {
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
 */
export async function POST(request: NextRequest) {
  try {
    // Only students can create bookings
    const user = await requireRole(Role.STUDENT);

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
    const existingBookings = await prisma.booking.findMany({
      where: {
        tutorId,
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
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

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking,
      },
      { status: 201 }
    );
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

