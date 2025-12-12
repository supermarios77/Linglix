/**
 * Cron Job: Refund Expired Unconfirmed Bookings
 * 
 * This endpoint should be called periodically (e.g., every hour) to:
 * - Find bookings that are PENDING and past their scheduled time
 * - Process refunds for these bookings
 * - Update booking status to REFUNDED
 * 
 * Security: Should be protected with a secret token or Vercel Cron
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { BookingStatus } from "@prisma/client";
import { processRefundWithBookingUpdate } from "@/lib/stripe/refunds";
import { logger } from "@/lib/logger";
import { sendBookingCancellationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/refund-expired-bookings
 * 
 * Refunds bookings that are PENDING and past their scheduled time
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    
    // Find all PENDING bookings that are past their scheduled time
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        scheduledAt: {
          lt: now, // Scheduled time has passed
        },
        paymentId: {
          not: null, // Only refund paid bookings
        },
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

    logger.info("Processing expired unconfirmed bookings", {
      count: expiredBookings.length,
    });

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each expired booking
    for (const booking of expiredBookings) {
      try {
        results.processed++;

        // Process refund
        const refundResult = await processRefundWithBookingUpdate(
          booking.id,
          "tutor_did_not_confirm_in_time"
        );

        if (refundResult.success) {
          results.succeeded++;

          // Send cancellation email to student
          if (booking.student.email) {
            sendBookingCancellationEmail({
              email: booking.student.email,
              name: booking.student.name || undefined,
              tutorName: booking.tutor.user.name || undefined,
              scheduledAt: booking.scheduledAt,
              refundAmount: booking.price,
              isTutor: false,
              locale: "en",
            }).catch((error) => {
              logger.error("Failed to send refund email", {
                bookingId: booking.id,
                error: error instanceof Error ? error.message : String(error),
              });
            });
          }

          logger.info("Refunded expired unconfirmed booking", {
            bookingId: booking.id,
            scheduledAt: booking.scheduledAt.toISOString(),
            refundId: refundResult.refund?.id,
          });
        } else {
          results.failed++;
          results.errors.push(
            `Booking ${booking.id}: ${refundResult.error || "Unknown error"}`
          );
          logger.error("Failed to refund expired booking", {
            bookingId: booking.id,
            error: refundResult.error,
          });
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Booking ${booking.id}: ${errorMessage}`);
        logger.error("Error processing expired booking", {
          bookingId: booking.id,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      message: "Expired bookings processed",
      results,
    });
  } catch (error) {
    logger.error("Error in refund-expired-bookings cron job", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to process expired bookings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
