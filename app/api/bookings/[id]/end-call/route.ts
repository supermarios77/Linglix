/**
 * End Call API Route
 * 
 * POST /api/bookings/[id]/end-call
 * 
 * Marks a call as ended by setting callEndedAt timestamp
 * Only tutors can end calls
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/[id]/end-call
 * 
 * End a call (tutor only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return createErrorResponse(Errors.NotFound("Booking not found"));
    }

    // Only tutors can end calls
    if (booking.tutor.userId !== user.id) {
      return createErrorResponse(
        Errors.Forbidden("Only tutors can end calls")
      );
    }

    // Check if call has already ended
    if (booking.callEndedAt) {
      return NextResponse.json({
        message: "Call has already ended",
        booking,
      });
    }

    // Update booking with call end time
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        callEndedAt: new Date(),
        // Optionally mark as completed if not already
        status: booking.status === BookingStatus.CONFIRMED 
          ? BookingStatus.COMPLETED 
          : booking.status,
      },
    });

    logger.info("Call ended by tutor", {
      bookingId: id,
      tutorId: user.id,
      endedAt: updatedBooking.callEndedAt,
    });

    return NextResponse.json({
      message: "Call ended successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    logger.error("Failed to end call", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to end call. Please try again."
    );
  }
}
