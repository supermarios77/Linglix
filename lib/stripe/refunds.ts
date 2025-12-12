/**
 * Stripe Refund Utilities
 * 
 * Handles refund processing for bookings
 */

import Stripe from "stripe";
import { getStripeClient } from "./client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
import { BookingStatus } from "@prisma/client";

/**
 * Process a refund for a booking
 * 
 * @param bookingId - The booking ID to refund
 * @param reason - Optional reason for the refund
 * @returns The refund object or null if refund failed
 */
export async function processRefund(
  bookingId: string,
  reason?: string
): Promise<Stripe.Refund | null> {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      logger.error("Stripe client not available for refund", { bookingId });
      return null;
    }

    // Fetch booking with payment info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        paymentId: true,
        price: true,
        status: true,
      },
    });

    if (!booking) {
      logger.error("Booking not found for refund", { bookingId });
      return null;
    }

    if (!booking.paymentId) {
      logger.warn("Booking has no payment ID, cannot refund", { bookingId });
      return null;
    }

    // Check if already refunded
    if (booking.status === BookingStatus.REFUNDED) {
      logger.warn("Booking already refunded", { bookingId });
      return null;
    }

    // Get the payment intent from the checkout session
    const session = await stripe.checkout.sessions.retrieve(booking.paymentId);
    if (!session.payment_intent) {
      logger.error("No payment intent found in checkout session", {
        bookingId,
        sessionId: booking.paymentId,
      });
      return null;
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent as string,
      amount: Math.round(booking.price * 100), // Convert to cents
      reason: reason || "requested_by_customer",
      metadata: {
        bookingId: booking.id,
        reason: reason || "booking_cancelled",
      },
    });

    logger.info("Refund processed successfully", {
      bookingId,
      refundId: refund.id,
      amount: refund.amount / 100,
    });

    // Update booking status to REFUNDED
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REFUNDED,
      },
    });

    return refund;
  } catch (error) {
    logger.error("Failed to process refund", {
      bookingId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Process refund and update booking status in a transaction
 */
export async function processRefundWithBookingUpdate(
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; refund?: Stripe.Refund; error?: string }> {
  try {
    const refund = await processRefund(bookingId, reason);
    
    if (!refund) {
      return {
        success: false,
        error: "Failed to process refund",
      };
    }

    return {
      success: true,
      refund,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
