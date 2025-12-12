/**
 * User Penalty Status API Route
 * 
 * Returns the current penalty status for the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/penalty-status
 * 
 * Get current penalty status for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const userWithPenalty = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        penaltyUntil: true,
      },
    });

    if (!userWithPenalty) {
      return createErrorResponse(Errors.NotFound("User not found"));
    }

    return NextResponse.json({
      penaltyUntil: userWithPenalty.penaltyUntil,
      isPenalized: userWithPenalty.penaltyUntil
        ? new Date() < new Date(userWithPenalty.penaltyUntil)
        : false,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      error,
      "Failed to fetch penalty status. Please try again."
    );
  }
}
