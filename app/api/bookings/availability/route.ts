/**
 * Booking Availability API Route
 * 
 * Get available time slots for a tutor
 * Used by booking UI to show available times
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getAvailableTimeSlots, getAvailableDates } from "@/lib/booking/availability";

const availabilityQuerySchema = z.object({
  tutorId: z.string().min(1, "Tutor ID is required"),
  date: z.string().optional(), // ISO date string
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  duration: z.enum(["30", "60", "90"]).optional().default("60"),
});

/**
 * GET /api/bookings/availability
 * 
 * Get available time slots for a tutor
 * Query params:
 * - tutorId: Required
 * - date: Optional, specific date to check
 * - startDate/endDate: Optional, date range
 * - duration: Optional, booking duration (30, 60, 90)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      tutorId: searchParams.get("tutorId") || "",
      date: searchParams.get("date") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      duration: (searchParams.get("duration") || "60") as "30" | "60" | "90",
    };

    const validatedQuery = availabilityQuerySchema.parse(query);

    // Fetch tutor profile with availability
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { id: validatedQuery.tutorId },
      include: {
        availability: {
          where: { isActive: true },
        },
      },
    });

    if (!tutorProfile) {
      return createErrorResponse(Errors.NotFound("Tutor not found"));
    }

    if (!tutorProfile.isActive || tutorProfile.approvalStatus !== "APPROVED") {
      return NextResponse.json({
        available: false,
        reason: "Tutor is not available for bookings",
        slots: [],
        dates: [],
      });
    }

    // Fetch existing bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        tutorId: validatedQuery.tutorId,
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
    });

    const duration = parseInt(validatedQuery.duration);

    // If specific date provided, return time slots for that date
    if (validatedQuery.date) {
      const date = new Date(validatedQuery.date);
      const slots = getAvailableTimeSlots(
        date,
        duration,
        tutorProfile.availability,
        existingBookings,
        validatedQuery.tutorId
      );

      return NextResponse.json({
        tutorId: validatedQuery.tutorId,
        date: validatedQuery.date,
        duration,
        slots: slots.map((slot) => ({
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          available: slot.available,
          reason: slot.reason,
        })),
      });
    }

    // If date range provided, return available dates
    if (validatedQuery.startDate && validatedQuery.endDate) {
      const startDate = new Date(validatedQuery.startDate);
      const endDate = new Date(validatedQuery.endDate);

      if (startDate > endDate) {
        return createErrorResponse(
          Errors.BadRequest("Start date must be before end date")
        );
      }

      // Limit date range to 30 days
      const daysDiff =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 30) {
        return createErrorResponse(
          Errors.BadRequest("Date range cannot exceed 30 days")
        );
      }

      const availableDates = getAvailableDates(
        startDate,
        endDate,
        tutorProfile.availability,
        existingBookings,
        validatedQuery.tutorId,
        duration
      );

      return NextResponse.json({
        tutorId: validatedQuery.tutorId,
        duration,
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        availableDates: availableDates.map((date) => date.toISOString().split("T")[0]),
      });
    }

    // Default: return next 7 days of available dates
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 7);

    const availableDates = getAvailableDates(
      startDate,
      endDate,
      tutorProfile.availability,
      existingBookings,
      validatedQuery.tutorId,
      duration
    );

    return NextResponse.json({
      tutorId: validatedQuery.tutorId,
      duration,
      availableDates: availableDates.map((date) => date.toISOString().split("T")[0]),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.issues[0]?.message || "Invalid request")
      );
    }

    logger.error("Failed to fetch availability", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to fetch availability. Please try again."
    );
  }
}

