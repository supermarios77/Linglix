/**
 * Appeals API Route
 * 
 * Handles cancellation penalty appeals:
 * - POST: Submit an appeal
 * - GET: List appeals (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Role, AppealStatus } from "@prisma/client";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";

const createAppealSchema = z.object({
  bookingId: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(1000, "Reason must be less than 1000 characters"),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/appeals
 * 
 * Submit a cancellation penalty appeal
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(Role.STUDENT);
    const body = await request.json();
    const validatedData = createAppealSchema.parse(body);

    // Check if user has an active penalty
    const userWithPenalty = await prisma.user.findUnique({
      where: { id: user.id },
      select: { penaltyUntil: true },
    });

    if (!userWithPenalty || !userWithPenalty.penaltyUntil) {
      return createErrorResponse(
        Errors.BadRequest("You don't have an active penalty to appeal")
      );
    }

    // Check if penalty has already expired
    if (new Date() >= new Date(userWithPenalty.penaltyUntil)) {
      return createErrorResponse(
        Errors.BadRequest("Your penalty has already expired")
      );
    }

    // Check if there's already a pending appeal
    const existingAppeal = await prisma.cancellationAppeal.findFirst({
      where: {
        userId: user.id,
        status: AppealStatus.PENDING,
      },
    });

    if (existingAppeal) {
      return createErrorResponse(
        Errors.BadRequest("You already have a pending appeal. Please wait for admin review.")
      );
    }

    // Validate booking if provided
    if (validatedData.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: validatedData.bookingId },
      });

      if (!booking || booking.studentId !== user.id) {
        return createErrorResponse(
          Errors.NotFound("Booking not found or doesn't belong to you")
        );
      }
    }

    // Create appeal
    const appeal = await prisma.cancellationAppeal.create({
      data: {
        userId: user.id,
        bookingId: validatedData.bookingId,
        reason: validatedData.reason,
        status: AppealStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info("Appeal submitted", {
      appealId: appeal.id,
      userId: user.id,
    });

    return NextResponse.json(
      {
        message: "Appeal submitted successfully. An admin will review it shortly.",
        appeal,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.issues[0]?.message || "Invalid request")
      );
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to submit appeal", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to submit appeal. Please try again."
    );
  }
}

/**
 * GET /api/appeals
 * 
 * List appeals (admin only) or get user's own appeals
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as AppealStatus | null;

    let where: any = {};

    // Admins can see all appeals, students see only their own
    if (user.role !== Role.ADMIN) {
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const appeals = await prisma.cancellationAppeal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ appeals });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to fetch appeals", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to fetch appeals. Please try again."
    );
  }
}

