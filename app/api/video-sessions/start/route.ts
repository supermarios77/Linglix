/**
 * Video Session Start API Endpoint
 * 
 * Creates or updates a video session when a call starts.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateRoomId } from "@/lib/100ms/token";
import { logger } from "@/lib/logger";
import { createErrorResponse, Errors } from "@/lib/errors";

const startSessionSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const { bookingId } = startSessionSchema.parse(body);

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: true,
        tutor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) {
      return createErrorResponse(Errors.NotFound("Booking not found"));
    }

    // Check if user is either the student or tutor for this booking
    const isStudent = booking.studentId === user.id;
    const isTutor = booking.tutor.userId === user.id;

    if (!isStudent && !isTutor) {
      return createErrorResponse(
        Errors.Forbidden("You don't have access to this booking")
      );
    }

    // Verify booking is in a valid state for video call
    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
      return createErrorResponse(
        Errors.BadRequest(
          "Booking is not confirmed. Video calls are only available for confirmed bookings."
        )
      );
    }

    // Generate room ID
    const roomId = generateRoomId(bookingId);

    // Upsert video session
    const videoSession = await prisma.videoSession.upsert({
      where: { bookingId },
      update: {
        startedAt: new Date(),
        hmsRoomId: roomId,
      },
      create: {
        bookingId,
        studentId: booking.studentId,
        startedAt: new Date(),
        hmsRoomId: roomId,
      },
    });

    logger.info("Video session started", {
      userId: user.id,
      bookingId,
      sessionId: videoSession.id,
      roomId,
    });

    return NextResponse.json({
      sessionId: videoSession.id,
      roomId,
      startedAt: videoSession.startedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(Errors.BadRequest("Invalid request"));
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to start video session", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to start video session. Please try again."
    );
  }
}

