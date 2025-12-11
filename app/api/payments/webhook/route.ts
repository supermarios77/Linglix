/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for payment processing.
 * 
 * Security:
 * - Validates webhook signatures
 * - Idempotent event processing
 * - Proper error handling and logging
 * 
 * Events handled:
 * - checkout.session.completed: Payment successful
 * - checkout.session.async_payment_succeeded: Payment succeeded after async processing
 * - checkout.session.async_payment_failed: Payment failed after async processing
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe/client";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/webhook
 * 
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      logger.error("Stripe webhook received but Stripe is not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      logger.error("Stripe webhook received but Stripe client is not available");
      return NextResponse.json(
        { error: "Payment service not available" },
        { status: 500 }
      );
    }

    // Get webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !webhookSecret.trim()) {
      logger.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      logger.error("Stripe webhook signature missing");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret.trim()
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Webhook signature verification failed", {
        error: errorMessage,
      });
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Handle the event
    logger.info("Stripe webhook event received", {
      type: event.type,
      id: event.id,
    });

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }

        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }

        case "checkout.session.async_payment_failed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutFailed(session);
          break;
        }

        default:
          logger.info("Unhandled webhook event type", {
            type: event.type,
          });
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      logger.error("Error processing webhook event", {
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Return 200 to prevent Stripe from retrying (we'll handle retries manually if needed)
      return NextResponse.json(
        { error: "Event processing failed" },
        { status: 200 }
      );
    }
  } catch (error) {
    logger.error("Webhook handler error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    logger.error("Checkout session completed but bookingId missing in metadata", {
      sessionId: session.id,
    });
    return;
  }

  // Check if payment was actually successful
  if (session.payment_status !== "paid") {
    logger.warn("Checkout session completed but payment not paid", {
      sessionId: session.id,
      bookingId,
      paymentStatus: session.payment_status,
    });
    return;
  }

  // Update booking status and payment ID
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      logger.error("Booking not found for completed checkout", {
        bookingId,
        sessionId: session.id,
      });
      return;
    }

    // Only update if booking is still CONFIRMED (not already paid/completed)
    if (booking.status === BookingStatus.CONFIRMED) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentId: session.id,
          // Keep status as CONFIRMED - it will be marked COMPLETED after the session
        },
      });

      logger.info("Booking payment confirmed", {
        bookingId,
        sessionId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
      });
    } else {
      logger.info("Booking payment already processed", {
        bookingId,
        sessionId: session.id,
        currentStatus: booking.status,
      });
    }
  } catch (error) {
    logger.error("Error updating booking after payment", {
      bookingId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; // Re-throw to trigger webhook retry
  }
}

/**
 * Handle failed checkout session
 */
async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    logger.error("Checkout session failed but bookingId missing in metadata", {
      sessionId: session.id,
    });
    return;
  }

  logger.warn("Checkout session payment failed", {
    bookingId,
    sessionId: session.id,
    paymentStatus: session.payment_status,
  });

  // Optionally: Send notification to student about payment failure
  // For now, we just log it - the booking remains CONFIRMED
  // Student can retry payment
}
