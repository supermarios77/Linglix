import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { createErrorResponse, Errors } from "@/lib/errors";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

/**
 * API Route: Reject Tutor
 * 
 * POST /api/admin/tutors/[tutorId]/reject
 * 
 * Security:
 * - Requires ADMIN role
 * - Validates tutor exists
 * - Updates approval status and deactivates tutor
 * - Optional rejection reason
 * 
 * Production considerations:
 * - Proper error handling with Sentry
 * - Input validation with Zod
 * - Transaction safety
 */
const rejectSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    // Require admin role
    await requireRole(Role.ADMIN);

    const { tutorId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = rejectSchema.safeParse(body);

    if (!validatedData.success) {
      throw Errors.BadRequest("Invalid request data");
    }

    const { reason } = validatedData.data;

    // Validate tutor exists and has a profile
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
      include: { tutorProfile: true },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: "Tutor not found" },
        { status: 404 }
      );
    }

    if (!tutor.tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    if (tutor.role !== Role.TUTOR) {
      return NextResponse.json(
        { error: "User is not a tutor" },
        { status: 400 }
      );
    }

    // Update tutor profile: reject and deactivate
    await prisma.tutorProfile.update({
      where: { userId: tutorId },
      data: {
        approvalStatus: "REJECTED",
        isActive: false,
        rejectionReason: reason || null,
      },
    });

    return NextResponse.json(
      { message: "Tutor rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Log to Sentry in production
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }

    return createErrorResponse(error, "Failed to reject tutor");
  }
}

