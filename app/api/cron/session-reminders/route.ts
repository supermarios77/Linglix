/**
 * Session Reminders Cron Job
 * 
 * Sends email reminders for upcoming sessions:
 * - 24 hours before session
 * - 1 hour before session
 * 
 * This route should be called by Vercel Cron Jobs or similar scheduler.
 * 
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/session-reminders",
 *     "schedule": "0 * * * *"  // Every hour
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { sendSessionReminderEmail } from "@/lib/email";
import { getBaseUrl, getSessionUrl } from "@/lib/utils/url";
import { BookingStatus } from "@prisma/client";

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
  
  // Allow in development for testing
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  
  return false;
}

/**
 * GET /api/cron/session-reminders
 * 
 * Sends session reminder emails
 */
export async function GET(request: NextRequest) {
  try {
    // Verify request is from authorized cron service
    if (!verifyCronRequest(request)) {
      logger.warn("Unauthorized cron job request", {
        ip: request.headers.get("x-forwarded-for"),
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    
    // Find bookings that need 24-hour reminders
    // Scheduled between 23.5 and 24.5 hours from now
    const twentyFourHourStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const twentyFourHourEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);
    
    // Find bookings that need 1-hour reminders
    // Scheduled between 0.5 and 1.5 hours from now
    const oneHourStart = new Date(now.getTime() + 0.5 * 60 * 60 * 1000);
    const oneHourEnd = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);

    // Fetch bookings needing 24-hour reminders
    const bookings24h = await prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED],
        },
        scheduledAt: {
          gte: twentyFourHourStart,
          lte: twentyFourHourEnd,
        },
        // Only send if payment is confirmed (has paymentId)
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
        status: {
          in: [BookingStatus.CONFIRMED],
        },
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
        // Send to student
        if (booking.student.email) {
          await sendSessionReminderEmail({
            email: booking.student.email,
            name: booking.student.name || undefined,
            tutorName: booking.tutor.user.name || "Tutor",
            scheduledAt: booking.scheduledAt,
            duration: booking.duration,
            sessionUrl: getSessionUrl(booking.id, "en", baseUrl),
            hoursUntil: 24,
            locale: "en", // Default to English - can be enhanced with user preferences later
          });
        }

        // Send to tutor
        if (booking.tutor.user.email) {
          await sendSessionReminderEmail({
            email: booking.tutor.user.email,
            name: booking.tutor.user.name || undefined,
            tutorName: booking.tutor.user.name || "You",
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

    // Send 1-hour reminders
    for (const booking of bookings1h) {
      try {
        // Send to student
        if (booking.student.email) {
          await sendSessionReminderEmail({
            email: booking.student.email,
            name: booking.student.name || undefined,
            tutorName: booking.tutor.user.name || "Tutor",
            scheduledAt: booking.scheduledAt,
            duration: booking.duration,
            sessionUrl: getSessionUrl(booking.id, "en", baseUrl),
            hoursUntil: 1,
            locale: "en",
          });
        }

        // Send to tutor
        if (booking.tutor.user.email) {
          await sendSessionReminderEmail({
            email: booking.tutor.user.email,
            name: booking.tutor.user.name || undefined,
            tutorName: booking.tutor.user.name || "You",
            scheduledAt: booking.scheduledAt,
            duration: booking.duration,
            sessionUrl: getSessionUrl(booking.id, "en", baseUrl),
            hoursUntil: 1,
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

    logger.info("Session reminders cron job completed", {
      sent24h,
      sent1h,
      errors,
      totalBookings24h: bookings24h.length,
      totalBookings1h: bookings1h.length,
    });

    return NextResponse.json({
      success: true,
      sent24h,
      sent1h,
      errors,
      totalBookings24h: bookings24h.length,
      totalBookings1h: bookings1h.length,
    });
  } catch (error) {
    logger.error("Session reminders cron job failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Cron job failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
