/**
 * Cron Job: Refund Expired Unconfirmed Bookings
 * 
 * Production-ready cron job that:
 * - Finds bookings that are PENDING and past their scheduled time
 * - Processes refunds for these bookings with idempotency
 * - Updates booking status to REFUNDED
 * - Sends cancellation emails to students
 * - Provides comprehensive logging and error handling
 * 
 * Security:
 * - Verifies Vercel Cron header or CRON_SECRET token
 * - Rate limited by Vercel Cron schedule
 * - Comprehensive audit logging
 * 
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/refund-expired-bookings",
 *     "schedule": "0 * * * *"  // Every hour
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { BookingStatus } from "@prisma/client";
import { processRefundWithBookingUpdate } from "@/lib/stripe/refunds";
import { logger } from "@/lib/logger";
import { sendBookingCancellationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for cron job

/**
 * Verify cron job authorization
 * Vercel Cron Jobs include a special header
 * For manual testing, you can use a secret token
 */
function verifyCronRequest(request: NextRequest): boolean {
  // In production, Vercel adds this header automatically
  const authHeader = request.headers.get("authorization");
  
  // For manual testing or other cron services, use a secret token
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  
  // Vercel Cron automatically adds this header
  if (request.headers.get("x-vercel-cron")) {
    return true;
  }
  
  // Allow in development for testing (with warning)
  if (process.env.NODE_ENV === "development") {
    logger.warn("Cron job accessed in development mode without proper auth", {
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return true;
  }
  
  return false;
}

/**
 * POST /api/cron/refund-expired-bookings
 * 
 * Refunds bookings that are PENDING and past their scheduled time
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify request is from authorized cron service
    if (!verifyCronRequest(request)) {
      logger.warn("Unauthorized cron job request", {
        ip: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent"),
        path: request.url,
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    
    // Find all PENDING bookings that are past their scheduled time
    // Only process bookings that:
    // 1. Are in PENDING status (waiting for tutor confirmation)
    // 2. Have passed their scheduled time
    // 3. Have a payment ID (were paid)
    // 4. Are not already refunded
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
      // Limit to prevent timeout (process in batches if needed)
      take: 100,
      orderBy: {
        scheduledAt: "asc", // Process oldest first
      },
    });

    logger.info("Processing expired unconfirmed bookings", {
      count: expiredBookings.length,
      timestamp: now.toISOString(),
    });

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      alreadyRefunded: 0,
      skipped: 0,
      errors: [] as Array<{ bookingId: string; error: string }>,
    };

    // Process each expired booking with proper error handling
    for (const booking of expiredBookings) {
      try {
        results.processed++;

        // Validate booking data before processing
        if (!booking.paymentId) {
          results.skipped++;
          logger.warn("Skipping booking without payment ID", {
            bookingId: booking.id,
          });
          continue;
        }

        // Process refund with idempotency
        const refundResult = await processRefundWithBookingUpdate(
          booking.id,
          "tutor_did_not_confirm_in_time"
        );

        if (refundResult.success) {
          // Check if it was already refunded (idempotency)
          if (refundResult.alreadyRefunded) {
            results.alreadyRefunded++;
            logger.info("Booking already refunded (skipped)", {
              bookingId: booking.id,
            });
            continue;
          }

          results.succeeded++;

          // Send cancellation email to student (non-blocking)
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
                studentEmail: booking.student.email,
                error: error instanceof Error ? error.message : String(error),
              });
            });
          }

          logger.info("Refunded expired unconfirmed booking", {
            bookingId: booking.id,
            scheduledAt: booking.scheduledAt.toISOString(),
            refundId: refundResult.refund?.id,
            amount: refundResult.refund?.amount ? refundResult.refund.amount / 100 : booking.price,
            studentId: booking.studentId,
            tutorId: booking.tutorId,
          });
        } else {
          results.failed++;
          const errorMsg = refundResult.error || "Unknown error";
          results.errors.push({
            bookingId: booking.id,
            error: errorMsg,
          });
          
          logger.error("Failed to refund expired booking", {
            bookingId: booking.id,
            error: errorMsg,
            bookingNotFound: refundResult.bookingNotFound,
            noPayment: refundResult.noPayment,
            scheduledAt: booking.scheduledAt.toISOString(),
          });
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push({
          bookingId: booking.id,
          error: errorMessage,
        });
        
        logger.error("Error processing expired booking", {
          bookingId: booking.id,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    const duration = Date.now() - startTime;
    
    logger.info("Expired bookings refund cron job completed", {
      duration: `${duration}ms`,
      results: {
        processed: results.processed,
        succeeded: results.succeeded,
        failed: results.failed,
        alreadyRefunded: results.alreadyRefunded,
        skipped: results.skipped,
      },
      totalFound: expiredBookings.length,
    });

    return NextResponse.json({
      success: true,
      message: "Expired bookings processed",
      results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error("Error in refund-expired-bookings cron job", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process expired bookings",
        message: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}
