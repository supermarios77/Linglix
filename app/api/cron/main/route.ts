/**
 * Main Cron Job - Consolidated
 * 
 * Handles all scheduled tasks in a single cron job to stay within Vercel Hobby plan limits.
 * Hobby plan allows only 1 cron job that runs once per day.
 * 
 * Tasks:
 * 1. Session Reminders - Sends email reminders for upcoming sessions (24h and 1h before)
 * 2. Refund Expired Bookings - Refunds bookings that are PENDING and past their scheduled time
 * 
 * Note: Since this runs once per day, 1-hour reminders are sent for bookings in the next 2 hours
 * to maximize coverage. 24-hour reminders work as normal.
 * 
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/main",
 *     "schedule": "0 9 * * *"  // Daily at 9 AM UTC
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { BookingStatus } from "@prisma/client";
import { processRefundWithBookingUpdate } from "@/lib/stripe/refunds";
import { logger } from "@/lib/logger";
import { sendSessionReminderEmail, sendBookingCancellationEmail } from "@/lib/email";
import { getBaseUrl, getSessionUrl } from "@/lib/utils/url";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for cron job

/**
 * Verify cron job authorization
 * Vercel Cron Jobs include a special header
 * For manual testing, you can use a secret token
 */
function verifyCronRequest(request: NextRequest): boolean {
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
  
  // In development, still require secret token for security
  // This prevents accidental exposure in staging environments
  if (process.env.NODE_ENV === "development" && cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  
  return false;
}

/**
 * Task 1: Send Session Reminders
 * Sends email reminders for upcoming sessions (24h and 1h before)
 * 
 * Note: Since this runs once per day, we use a wider window for 1-hour reminders
 * to maximize coverage (0.5-2.5 hours) since we can't run hourly.
 */
async function handleSessionReminders(now: Date) {
  const startTime = Date.now();
  
  try {
    // Calculate time windows for reminders
    // 24-hour reminders: bookings scheduled 23.5-24.5 hours from now
    const twentyFourHourStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const twentyFourHourEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);
    // 1-hour reminders: wider window (0.5-2.5 hours) since we only run once per day
    const oneHourStart = new Date(now.getTime() + 0.5 * 60 * 60 * 1000);
    const oneHourEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

    // Fetch bookings needing 24-hour reminders
    const bookings24h = await prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        scheduledAt: {
          gte: twentyFourHourStart,
          lte: twentyFourHourEnd,
        },
        paymentId: {
          not: null,
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

    // Fetch bookings needing 1-hour reminders
    const bookings1h = await prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        scheduledAt: {
          gte: oneHourStart,
          lte: oneHourEnd,
        },
        paymentId: {
          not: null,
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

    const baseUrl = getBaseUrl();
    let sent24h = 0;
    let sent1h = 0;
    let errors = 0;

    // Send 24-hour reminders
    for (const booking of bookings24h) {
      try {
        if (booking.student.email) {
          await sendSessionReminderEmail({
            email: booking.student.email,
            name: booking.student.name || undefined,
            tutorName: booking.tutor.user.name || "Tutor",
            scheduledAt: booking.scheduledAt,
            duration: booking.duration,
            sessionUrl: getSessionUrl(booking.id, "en", baseUrl),
            hoursUntil: 24,
            locale: "en",
          });
        }

        if (booking.tutor.user.email) {
          await sendSessionReminderEmail({
            email: booking.tutor.user.email,
            name: booking.tutor.user.name || undefined,
            tutorName: booking.student.name || "Student",
            scheduledAt: booking.scheduledAt,
            duration: booking.duration,
            sessionUrl: getSessionUrl(booking.id, "en", baseUrl),
            hoursUntil: 24,
            locale: "en",
          });
        }

        sent24h++;
      } catch (error) {
        errors++;
        logger.error("Failed to send 24-hour reminder", {
          bookingId: booking.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Send 1-hour reminders (actually 0.5-2.5 hours due to daily cron limitation)
    for (const booking of bookings1h) {
      try {
        // Calculate actual hours until session (rounded to nearest hour)
        const hoursUntil = Math.round(
          (booking.scheduledAt.getTime() - now.getTime()) / (60 * 60 * 1000)
        );

        if (booking.student.email) {
          await sendSessionReminderEmail({
            email: booking.student.email,
            name: booking.student.name || undefined,
            tutorName: booking.tutor.user.name || "Tutor",
            scheduledAt: booking.scheduledAt,
            duration: booking.duration,
            sessionUrl: getSessionUrl(booking.id, "en", baseUrl),
            hoursUntil: hoursUntil || 1, // Default to 1 if calculation fails
            locale: "en",
          });
        }

        if (booking.tutor.user.email) {
          await sendSessionReminderEmail({
            email: booking.tutor.user.email,
            name: booking.tutor.user.name || undefined,
            tutorName: booking.student.name || "Student",
            scheduledAt: booking.scheduledAt,
            duration: booking.duration,
            sessionUrl: getSessionUrl(booking.id, "en", baseUrl),
            hoursUntil: hoursUntil || 1, // Default to 1 if calculation fails
            locale: "en",
          });
        }

        sent1h++;
      } catch (error) {
        errors++;
        logger.error("Failed to send 1-hour reminder", {
          bookingId: booking.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const duration = Date.now() - startTime;
    logger.info("Session reminders task completed", {
      sent24h,
      sent1h,
      errors,
      totalBookings24h: bookings24h.length,
      totalBookings1h: bookings1h.length,
      duration: `${duration}ms`,
    });

    return {
      success: true,
      sent24h,
      sent1h,
      errors,
      totalBookings24h: bookings24h.length,
      totalBookings1h: bookings1h.length,
      duration: `${duration}ms`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Session reminders task failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
    };
  }
}

/**
 * Task 2: Refund Expired Bookings
 * Refunds bookings that are PENDING and past their scheduled time
 */
async function handleRefundExpiredBookings(now: Date) {
  const startTime = Date.now();
  
  try {
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        scheduledAt: {
          lt: now,
        },
        paymentId: {
          not: null,
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
      take: 100,
      orderBy: {
        scheduledAt: "asc",
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

    for (const booking of expiredBookings) {
      try {
        results.processed++;

        if (!booking.paymentId) {
          results.skipped++;
          logger.warn("Skipping booking without payment ID", {
            bookingId: booking.id,
          });
          continue;
        }

        const refundResult = await processRefundWithBookingUpdate(
          booking.id,
          "tutor_did_not_confirm_in_time"
        );

        if (refundResult.success) {
          if (refundResult.alreadyRefunded) {
            results.alreadyRefunded++;
            continue;
          }

          results.succeeded++;

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
        });
      }
    }

    const duration = Date.now() - startTime;
    
    logger.info("Refund expired bookings task completed", {
      duration: `${duration}ms`,
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      alreadyRefunded: results.alreadyRefunded,
      skipped: results.skipped,
      totalFound: expiredBookings.length,
    });

    return {
      success: true,
      results,
      duration: `${duration}ms`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error("Refund expired bookings task failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
    };
  }
}

/**
 * POST /api/cron/main
 * 
 * Main cron job that handles all scheduled tasks
 */
export async function POST(request: NextRequest) {
  const overallStartTime = Date.now();
  
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
    
    // Execute all tasks in parallel for better performance
    const [sessionRemindersResult, refundResult] = await Promise.all([
      handleSessionReminders(now),
      handleRefundExpiredBookings(now),
    ]);

    const overallDuration = Date.now() - overallStartTime;
    
    logger.info("Main cron job completed", {
      overallDuration: `${overallDuration}ms`,
      sessionRemindersSuccess: sessionRemindersResult.success,
      sessionRemindersSent24h: sessionRemindersResult.sent24h ?? 0,
      sessionRemindersSent1h: sessionRemindersResult.sent1h ?? 0,
      sessionRemindersErrors: sessionRemindersResult.errors ?? 0,
      refundSuccess: refundResult.success,
      refundProcessed: refundResult.results?.processed ?? 0,
      refundSucceeded: refundResult.results?.succeeded ?? 0,
      refundFailed: refundResult.results?.failed ?? 0,
    });

    return NextResponse.json({
      success: true,
      message: "All cron tasks completed",
      tasks: {
        sessionReminders: sessionRemindersResult,
        refundExpiredBookings: refundResult,
      },
      overallDuration: `${overallDuration}ms`,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    const overallDuration = Date.now() - overallStartTime;
    
    logger.error("Main cron job failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      overallDuration: `${overallDuration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute cron tasks",
        message: error instanceof Error ? error.message : "Unknown error",
        overallDuration: `${overallDuration}ms`,
      },
      { status: 500 }
    );
  }
}
