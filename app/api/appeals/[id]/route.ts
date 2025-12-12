/**
 * Appeal Detail API Route
 * 
 * Handles individual appeal operations:
 * - GET: Get appeal details
 * - PATCH: Update appeal (admin approval/rejection)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Role, AppealStatus } from "@prisma/client";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";

const updateAppealSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/appeals/[id]
 * 
 * Get appeal details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const appeal = await prisma.cancellationAppeal.findUnique({
      where: { id },
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

    if (!appeal) {
      return createErrorResponse(Errors.NotFound("Appeal not found"));
    }

    // Students can only see their own appeals
    if (user.role !== Role.ADMIN && appeal.userId !== user.id) {
      return createErrorResponse(
        Errors.Forbidden("You don't have access to this appeal")
      );
    }

    return NextResponse.json({ appeal });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to fetch appeal", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to fetch appeal. Please try again."
    );
  }
}

/**
 * PATCH /api/appeals/[id]
 * 
 * Update appeal status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(Role.ADMIN);
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateAppealSchema.parse(body);

    const appeal = await prisma.cancellationAppeal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            penaltyUntil: true,
          },
        },
      },
    });

    if (!appeal) {
      return createErrorResponse(Errors.NotFound("Appeal not found"));
    }

    if (appeal.status !== AppealStatus.PENDING) {
      return createErrorResponse(
        Errors.BadRequest("Appeal has already been reviewed")
      );
    }

    // Update appeal and handle penalty removal if approved
    const updatedAppeal = await prisma.$transaction(async (tx) => {
      const appeal = await tx.cancellationAppeal.update({
        where: { id },
        data: {
          status: validatedData.status,
          adminNotes: validatedData.adminNotes,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
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

      // If approved, remove the penalty
      if (validatedData.status === AppealStatus.APPROVED) {
        await tx.user.update({
          where: { id: appeal.userId },
          data: { penaltyUntil: null },
        });

        logger.info("Appeal approved and penalty removed", {
          appealId: id,
          userId: appeal.userId,
          adminId: admin.id,
        });
      } else {
        logger.info("Appeal rejected", {
          appealId: id,
          userId: appeal.userId,
          adminId: admin.id,
        });
      }

      return appeal;
    });

    return NextResponse.json({
      message: `Appeal ${validatedData.status.toLowerCase()} successfully`,
      appeal: updatedAppeal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.issues[0]?.message || "Invalid request")
      );
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to update appeal", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to update appeal. Please try again."
    );
  }
}

