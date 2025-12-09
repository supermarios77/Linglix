/**
 * End Video Session API
 * 
 * Updates a video session record when a call ends, calculating duration.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const endSessionSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { bookingId } = endSessionSchema.parse(body);

    // Find video session
    const videoSession = await prisma.videoSession.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            student: true,
            tutor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!videoSession) {
      return NextResponse.json(
        { error: "Video session not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    const isStudent = videoSession.booking.studentId === user.id;
    const isTutor = videoSession.booking.tutor.userId === user.id;

    if (!isStudent && !isTutor) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Calculate duration if session was started
    let duration: number | null = null;
    if (videoSession.startedAt) {
      const endedAt = new Date();
      const durationMs = endedAt.getTime() - videoSession.startedAt.getTime();
      duration = Math.floor(durationMs / 1000 / 60); // Duration in minutes
    }

    // Update video session
    const updatedSession = await prisma.videoSession.update({
      where: { id: videoSession.id },
      data: {
        endedAt: new Date(),
        duration,
      },
    });

    // Update booking status to COMPLETED if it was CONFIRMED
    if (videoSession.booking.status === "CONFIRMED") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "COMPLETED",
        },
      });
    }

    logger.info("Video session ended", {
      userId: user.id,
      bookingId,
      videoSessionId: videoSession.id,
      duration,
    });

    return NextResponse.json({
      success: true,
      videoSession: {
        id: updatedSession.id,
        duration,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    logger.error("Failed to end video session", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to end video session" },
      { status: 500 }
    );
  }
}

