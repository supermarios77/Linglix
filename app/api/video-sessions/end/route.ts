/**
 * Video Session End API Endpoint
 * 
 * Ends a video session and calculates duration.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { createErrorResponse, Errors } from "@/lib/errors";

const endSessionSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const { bookingId } = endSessionSchema.parse(body);

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
        videoSession: true,
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

    // Check if video session exists
    if (!booking.videoSession) {
      return createErrorResponse(
        Errors.NotFound("Video session not found")
      );
    }

    // Calculate duration if session was started
    let duration: number | null = null;
    if (booking.videoSession.startedAt) {
      const endedAt = new Date();
      const durationMs =
        endedAt.getTime() - booking.videoSession.startedAt.getTime();
      duration = Math.floor(durationMs / 1000 / 60); // Duration in minutes
    }

    // Update video session
    const videoSession = await prisma.videoSession.update({
      where: { bookingId },
      data: {
        endedAt: new Date(),
        duration,
      },
    });

    logger.info("Video session ended", {
      userId: user.id,
      bookingId,
      sessionId: videoSession.id,
      duration,
    });

    return NextResponse.json({
      sessionId: videoSession.id,
      endedAt: videoSession.endedAt,
      duration,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(Errors.BadRequest("Invalid request"));
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to end video session", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to end video session. Please try again."
    );
  }
}

