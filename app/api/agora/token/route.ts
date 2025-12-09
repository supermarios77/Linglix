/**
 * Agora Token API Endpoint
 * 
 * Generates secure RTC tokens for Agora video calls.
 * This endpoint requires authentication and validates that the user
 * has access to the requested booking.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAgoraToken, generateChannelName, generateUid } from "@/lib/agora/token";
import { logger } from "@/lib/logger";
import { Role } from "@prisma/client";

const tokenRequestSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const { bookingId } = tokenRequestSchema.parse(body);

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
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user is either the student or tutor for this booking
    const isStudent = booking.studentId === user.id;
    const isTutor = booking.tutor.userId === user.id;

    if (!isStudent && !isTutor) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this booking" },
        { status: 403 }
      );
    }

    // Verify booking is in a valid state for video call
    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "Booking is not confirmed. Video calls are only available for confirmed bookings.",
        },
        { status: 400 }
      );
    }

    // Generate channel name and UID
    const channelName = generateChannelName(bookingId);
    const uid = generateUid(user.id);

    // Determine role: tutors are publishers (can publish video/audio),
    // students are also publishers (can publish video/audio)
    // In a tutoring scenario, both should be able to publish
    const role = "publisher";

    // Generate token (valid for 1 hour)
    const token = generateAgoraToken({
      channelName,
      uid,
      role,
      expirationTimeInSeconds: 3600,
    });

    logger.info("Agora token generated", {
      userId: user.id,
      bookingId,
      channelName,
      uid,
      role,
    });

    return NextResponse.json({
      token,
      channelName,
      uid,
      appId: process.env.AGORA_APP_ID,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    logger.error("Failed to generate Agora token", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

