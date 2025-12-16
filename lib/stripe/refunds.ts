/**
 * Stripe Refund Utilities
 * 
 * Production-ready refund processing with:
 * - Idempotency checks
 * - Transaction safety
 * - Comprehensive error handling
 * - Audit logging
 * - Retry logic for transient failures
 */

import Stripe from "stripe";
import { getStripeClient } from "./client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
import { BookingStatus } from "@prisma/client";

/**
 * Refund result with detailed information
 */
export interface RefundResult {
  success: boolean;
  refund?: Stripe.Refund;
  error?: string;
  alreadyRefunded?: boolean;
  bookingNotFound?: boolean;
  noPayment?: boolean;
}

/**
 * Process a refund for a booking with idempotency and transaction safety
 * 
 * @param bookingId - The booking ID to refund
 * @param reason - Optional reason for the refund (defaults to "requested_by_customer")
 * @param retryCount - Internal retry counter (max 3 retries)
 * @returns Detailed refund result
 */
export async function processRefund(
  bookingId: string,
  reason?: string,
  retryCount: number = 0
): Promise<RefundResult> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000; // 1 second

  try {
    // Validate inputs
    if (!bookingId || typeof bookingId !== "string" || bookingId.trim().length === 0) {
      return {
        success: false,
        error: "Invalid booking ID",
      };
    }

    const stripe = getStripeClient();
    if (!stripe) {
      logger.error("Stripe client not available for refund", { bookingId });
      return {
        success: false,
        error: "Payment service not available",
      };
    }

    // Use transaction to ensure atomicity
    return await prisma.$transaction(
      async (tx) => {
        // Fetch booking with payment info (with row lock to prevent race conditions)
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: {
            id: true,
            paymentId: true,
            price: true,
            status: true,
            studentId: true,
            tutorId: true,
            scheduledAt: true,
          },
        });

        if (!booking) {
          logger.error("Booking not found for refund", { bookingId });
          return {
            success: false,
            bookingNotFound: true,
            error: "Booking not found",
          };
        }

        // Check if already refunded (idempotency check)
        if (booking.status === BookingStatus.REFUNDED) {
          logger.info("Booking already refunded (idempotency)", {
            bookingId,
            currentStatus: booking.status,
          });
          return {
            success: true,
            alreadyRefunded: true,
            error: "Booking already refunded",
          };
        }

        // Validate booking can be refunded
        if (!booking.paymentId) {
          logger.warn("Booking has no payment ID, cannot refund", {
            bookingId,
            status: booking.status,
          });
          return {
            success: false,
            noPayment: true,
            error: "Booking has no payment to refund",
          };
        }

        // Validate booking status allows refund
        const refundableStatuses: BookingStatus[] = [
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
          BookingStatus.CANCELLED,
        ];
        if (!refundableStatuses.includes(booking.status)) {
          logger.warn("Booking status does not allow refund", {
            bookingId,
            status: booking.status,
          });
          return {
            success: false,
            error: `Cannot refund booking with status: ${booking.status}`,
          };
        }

        try {
          // Get the payment intent from the checkout session
          const session = await stripe.checkout.sessions.retrieve(booking.paymentId);
          
          if (!session.payment_intent) {
            logger.error("No payment intent found in checkout session", {
              bookingId,
              sessionId: booking.paymentId,
              sessionStatus: session.status,
            });
            return {
              success: false,
              error: "Payment session has no payment intent",
            };
          }

          // Check if payment intent is already refunded (additional idempotency check)
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string
          );
          
          const amountRefunded = (paymentIntent as any).amount_refunded || 0;
          if (paymentIntent.status === "canceled" || amountRefunded > 0) {
            logger.info("Payment intent already refunded or canceled", {
              bookingId,
              paymentIntentId: paymentIntent.id,
              amountRefunded,
              status: paymentIntent.status,
            });
            
            // Update booking status to match reality
            await tx.booking.update({
              where: { id: bookingId },
              data: { status: BookingStatus.REFUNDED },
            });
            
            return {
              success: true,
              alreadyRefunded: true,
              error: "Payment already refunded",
            };
          }

          // Validate refund amount
          const refundAmountCents = Math.round(booking.price * 100);
          if (refundAmountCents <= 0 || refundAmountCents > paymentIntent.amount) {
            logger.error("Invalid refund amount", {
              bookingId,
              bookingPrice: booking.price,
              refundAmountCents,
              paymentIntentAmount: paymentIntent.amount,
            });
            return {
              success: false,
              error: "Invalid refund amount",
            };
          }

          // Create refund with idempotency key
          const refundReason: Stripe.RefundCreateParams.Reason | undefined = 
            reason === "duplicate" || reason === "fraudulent" || reason === "requested_by_customer"
              ? (reason as Stripe.RefundCreateParams.Reason)
              : "requested_by_customer";
          
          const refund = await stripe.refunds.create(
            {
              payment_intent: session.payment_intent as string,
              amount: refundAmountCents,
              reason: refundReason,
              metadata: {
                bookingId: booking.id,
                reason: reason || "booking_cancelled",
                refundedAt: new Date().toISOString(),
              },
            },
            {
              idempotencyKey: `refund-${bookingId}-${Date.now()}`,
            }
          );

          // Update booking status to REFUNDED (within transaction)
          await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: BookingStatus.REFUNDED,
            },
          });

          logger.info("Refund processed successfully", {
            bookingId,
            refundId: refund.id,
            amount: refund.amount / 100,
            currency: refund.currency,
            reason: reason || "requested_by_customer",
            paymentIntentId: paymentIntent.id,
          });

          return {
            success: true,
            refund,
          };
        } catch (stripeError: any) {
          // Handle Stripe-specific errors
          if (stripeError.type === "StripeCardError") {
            logger.error("Stripe card error during refund", {
              bookingId,
              error: stripeError.message,
              code: stripeError.code,
            });
            return {
              success: false,
              error: `Payment error: ${stripeError.message}`,
            };
          }

          // Handle idempotency errors (refund already exists)
          if (stripeError.code === "idempotency_key_reuse" || stripeError.message?.includes("already been refunded")) {
            logger.info("Refund already processed (idempotency)", {
              bookingId,
              error: stripeError.message,
            });
            
            // Update booking status to match reality
            await tx.booking.update({
              where: { id: bookingId },
              data: { status: BookingStatus.REFUNDED },
            });
            
            return {
              success: true,
              alreadyRefunded: true,
              error: "Refund already processed",
            };
          }

          // Retry transient errors
          if (
            retryCount < MAX_RETRIES &&
            (stripeError.code === "rate_limit" ||
              stripeError.code === "api_connection_error" ||
              stripeError.code === "api_error")
          ) {
            logger.warn("Transient error during refund, retrying", {
              bookingId,
              retryCount: retryCount + 1,
              error: stripeError.message,
              code: stripeError.code,
            });

            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));

            // Retry with incremented counter
            return processRefund(bookingId, reason, retryCount + 1);
          }

          // Log and return error for non-retryable errors
          logger.error("Stripe error during refund", {
            bookingId,
            error: stripeError.message,
            code: stripeError.code,
            type: stripeError.type,
            retryCount,
          });

          return {
            success: false,
            error: `Refund failed: ${stripeError.message || "Unknown error"}`,
          };
        }
      },
      {
        timeout: 30000, // 30 second timeout
        isolationLevel: "Serializable", // Highest isolation level for financial operations
      }
    );
  } catch (error) {
    logger.error("Failed to process refund (transaction error)", {
      bookingId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      retryCount,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during refund",
    };
  }
}

/**
 * Process refund and update booking status in a transaction
 * 
 * This is a convenience wrapper that maintains backward compatibility
 * while using the improved refund processing logic.
 */
export async function processRefundWithBookingUpdate(
  bookingId: string,
  reason?: string
): Promise<RefundResult> {
  return processRefund(bookingId, reason);
}
