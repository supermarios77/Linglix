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
import { sendPaymentReceiptEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils/url";

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

    // Handle the event with idempotency check
    // Check if we've already processed this event by checking the booking's paymentId
    logger.info("Stripe webhook event received", {
      type: event.type,
      id: event.id,
    });

    try {
      // Process event based on type
      let alreadyProcessed = false;
      
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          alreadyProcessed = await checkIfEventProcessed(session.id, session.metadata?.bookingId);
          if (!alreadyProcessed) {
            await handleCheckoutCompleted(session);
          }
          break;
        }

        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as Stripe.Checkout.Session;
          alreadyProcessed = await checkIfEventProcessed(session.id, session.metadata?.bookingId);
          if (!alreadyProcessed) {
            await handleCheckoutCompleted(session);
          }
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

      if (alreadyProcessed) {
        logger.info("Webhook event already processed, skipping", {
          eventId: event.id,
          eventType: event.type,
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

      // Return 500 to allow Stripe to retry the webhook
      // Stripe will retry failed webhooks with exponential backoff
      return NextResponse.json(
        { error: "Event processing failed" },
        { status: 500 }
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
 * Check if webhook event has already been processed
 * This provides idempotency to prevent duplicate processing
 */
async function checkIfEventProcessed(
  sessionId: string,
  bookingId?: string
): Promise<boolean> {
  if (!bookingId) {
    return false;
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { paymentId: true, status: true },
    });

    // If booking already has this paymentId and is not in PENDING status,
    // the event has likely been processed
    if (booking?.paymentId === sessionId && booking.status !== BookingStatus.PENDING) {
      return true;
    }

    return false;
  } catch (error) {
    logger.warn("Error checking if event was processed", {
      sessionId,
      bookingId,
      error: error instanceof Error ? error.message : String(error),
    });
    // If check fails, proceed with processing (safer than skipping)
    return false;
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
    // This provides idempotency - if already processed, skip update
    if (booking.status === BookingStatus.CONFIRMED) {
      // Fetch full booking data for email
      const bookingWithRelations = await prisma.booking.findUnique({
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
        currency: session.currency || "usd",
      });

      // Send payment receipt email
      if (bookingWithRelations?.student.email) {
        const amount = session.amount_total ? session.amount_total / 100 : bookingWithRelations.price;
        const currency = session.currency || "usd";
        
        sendPaymentReceiptEmail({
          email: bookingWithRelations.student.email,
          name: bookingWithRelations.student.name || undefined,
          amount,
          currency,
          bookingId,
          tutorName: bookingWithRelations.tutor.user.name || "Tutor",
          scheduledAt: bookingWithRelations.scheduledAt,
          locale: "en", // TODO: Get from user preferences
        }).catch((error) => {
          logger.error("Failed to send payment receipt email", {
            bookingId,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
    } else if (booking.paymentId === session.id) {
      // Payment already processed for this session - idempotent success
      logger.info("Booking payment already processed (idempotent)", {
        bookingId,
        sessionId: session.id,
        currentStatus: booking.status,
      });
    } else {
      // Booking status changed but paymentId doesn't match - log warning
      logger.warn("Booking status changed but paymentId mismatch", {
        bookingId,
        sessionId: session.id,
        currentStatus: booking.status,
        currentPaymentId: booking.paymentId,
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
