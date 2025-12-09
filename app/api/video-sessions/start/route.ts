/**
 * Start Video Session API
 * 
 * Creates or updates a video session record when a call starts.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { generateChannelName, generateUid } from "@/lib/agora/token";

const startSessionSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { bookingId } = startSessionSchema.parse(body);

    // Verify booking exists and user has access
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
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const isStudent = booking.studentId === user.id;
    const isTutor = booking.tutor.userId === user.id;

    if (!isStudent && !isTutor) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify booking is confirmed
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Booking must be confirmed to start a video session" },
        { status: 400 }
      );
    }

    // Generate Agora channel and UID
    const channelName = generateChannelName(bookingId);
    const uid = generateUid(user.id);

    // Create or update video session
    const videoSession = await prisma.videoSession.upsert({
      where: { bookingId },
      create: {
        bookingId,
        studentId: booking.studentId,
        startedAt: new Date(),
        agoraChannel: channelName,
        agoraUid: uid,
      },
      update: {
        startedAt: new Date(),
        agoraChannel: channelName,
        agoraUid: uid,
      },
    });

    logger.info("Video session started", {
      userId: user.id,
      bookingId,
      videoSessionId: videoSession.id,
      channelName,
      uid,
    });

    return NextResponse.json({
      success: true,
      videoSession: {
        id: videoSession.id,
        channelName,
        uid,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    logger.error("Failed to start video session", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to start video session" },
      { status: 500 }
    );
  }
}

