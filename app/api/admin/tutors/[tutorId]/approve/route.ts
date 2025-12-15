import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { createErrorResponse } from "@/lib/errors";
import * as Sentry from "@sentry/nextjs";
import { sendTutorApprovalEmail } from "@/lib/email";
import { invalidateCache } from "@/lib/cache";

/**
 * API Route: Approve Tutor
 * 
 * POST /api/admin/tutors/[tutorId]/approve
 * 
 * Security:
 * - Requires ADMIN role
 * - Validates tutor exists
 * - Updates approval status and activates tutor
 * 
 * Production considerations:
 * - Proper error handling with Sentry
 * - Input validation
 * - Transaction safety
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    // Require admin role
    await requireRole(Role.ADMIN);

    const { tutorId } = await params;

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

    // Update tutor profile: approve and activate
    await prisma.tutorProfile.update({
      where: { userId: tutorId },
      data: {
        approvalStatus: "APPROVED",
        isActive: true,
        rejectionReason: null, // Clear any previous rejection reason
      },
    });

    // Invalidate cache for tutors (non-blocking)
    invalidateCache("FEATURED_TUTORS").catch(() => {
      // Ignore cache invalidation errors
    });
    invalidateCache("TUTOR_SPECIALTIES").catch(() => {
      // Ignore cache invalidation errors
    });

    // Send approval email (non-blocking)
    sendTutorApprovalEmail({
      email: tutor.email,
      name: tutor.name || undefined,
      approved: true,
    }).catch(async (error) => {
      const { logger } = await import("@/lib/logger");
      await logger.error("Failed to send approval email", error, {
        tutorId,
        email: tutor.email,
      });
      // Don't fail the request if email fails
    });

    return NextResponse.json(
      { message: "Tutor approved successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Log to Sentry in production
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }

    return createErrorResponse(error, "Failed to approve tutor");
  }
}

