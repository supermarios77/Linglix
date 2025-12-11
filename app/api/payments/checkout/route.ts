/**
 * Stripe Checkout Session API Route
 * 
 * Creates a Stripe Checkout Session for booking payment.
 * Payment is triggered when tutor confirms the booking.
 * 
 * Security:
 * - Server-side only (keeps secret key secure)
 * - Validates user authentication
 * - Validates booking ownership
 * - Validates booking status
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe/client";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/checkout
 * 
 * Creates a Stripe Checkout Session for a booking
 * 
 * Request body:
 * {
 *   bookingId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return createErrorResponse(
        Errors.InternalServerError("Payment service is not configured")
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return createErrorResponse(
        Errors.InternalServerError("Payment service is not available")
      );
    }

    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId || typeof bookingId !== "string") {
      return createErrorResponse(
        Errors.BadRequest("bookingId is required")
      );
    }

    // Fetch booking with relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    if (!booking) {
      return createErrorResponse(Errors.NotFound("Booking not found"));
    }

    // Verify user is the student who made the booking
    if (booking.studentId !== user.id) {
      return createErrorResponse(
        Errors.Forbidden("You can only pay for your own bookings")
      );
    }

    // Verify booking is confirmed (tutor has confirmed)
    if (booking.status !== BookingStatus.CONFIRMED) {
      return createErrorResponse(
        Errors.BadRequest("Booking must be confirmed by tutor before payment")
      );
    }

    // Check if booking already has a payment
    if (booking.paymentId) {
      // Check if payment was successful
      try {
        const session = await stripe.checkout.sessions.retrieve(booking.paymentId);
        if (session.payment_status === "paid") {
          return createErrorResponse(
            Errors.BadRequest("This booking has already been paid")
          );
        }
      } catch (error) {
        // If session doesn't exist or error, allow creating a new one
        logger.warn("Error checking existing payment session", {
          bookingId,
          paymentId: booking.paymentId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Get base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.NEXTAUTH_URL || 
                   request.headers.get("origin") || 
                   "http://localhost:3000";

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
      success_url: `${baseUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payments/cancel?booking_id=${bookingId}`,
      expires_at: Math.floor(new Date(booking.scheduledAt).getTime() / 1000), // Expire before session time
    });

    // Update booking with checkout session ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentId: session.id },
    });

    logger.info("Checkout session created", {
      bookingId,
      sessionId: session.id,
      studentId: user.id,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    // Handle Stripe errors
    if (error instanceof Error && error.message.includes("Stripe")) {
      logger.error("Stripe API error", {
        error: error.message,
        stack: error.stack,
      });
      return createErrorResponse(
        Errors.InternalServerError("Payment service error. Please try again.")
      );
    }

    logger.error("Failed to create checkout session", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return createErrorResponse(
      error,
      "Failed to create checkout session. Please try again."
    );
  }
}
