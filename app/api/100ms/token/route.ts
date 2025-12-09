/**
 * 100ms Token API Endpoint
 * 
 * Generates secure authentication tokens for 100ms video calls.
 * This endpoint requires authentication and validates that the user
 * has access to the requested booking.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  generateHMS100Token,
  generateRoomId,
  generateUserId,
} from "@/lib/100ms/token";
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
          error:
            "Booking is not confirmed. Video calls are only available for confirmed bookings.",
        },
        { status: 400 }
      );
    }

    // Get 100ms credentials
    const appId = process.env.HMS100_APP_ID;
    const appSecret = process.env.HMS100_APP_SECRET;
    const roomId = process.env.HMS100_ROOM_ID || generateRoomId(bookingId);

    if (!appId || !appSecret) {
      logger.error("100ms credentials not configured", {
        userId: user.id,
        bookingId,
      });
      return NextResponse.json(
        { error: "Video service not configured" },
        { status: 500 }
      );
    }

    // Generate room ID and user ID
    const hmsRoomId = roomId.startsWith("booking-")
      ? roomId
      : generateRoomId(bookingId);
    const hmsUserId = generateUserId(user.id, bookingId);

    // Determine role: tutors are "teacher", students are "student"
    const hmsRole = isTutor ? "teacher" : "student";

    // Generate token
    const token = generateHMS100Token({
      roomId: hmsRoomId,
      userId: hmsUserId,
      role: hmsRole,
      appId,
      appSecret,
    });

    logger.info("100ms token generated", {
      userId: user.id,
      bookingId,
      roomId: hmsRoomId,
      role: hmsRole,
    });

    return NextResponse.json({
      token,
      roomId: hmsRoomId,
      userId: hmsUserId,
      role: hmsRole,
      appId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("Failed to generate 100ms token", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

