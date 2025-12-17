import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { createValidationErrorResponse } from "@/lib/errors/validation";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const updateStudentProfileSchema = z.object({
  learningGoal: z.string().optional().nullable(),
  currentLevel: z.string().optional().nullable(),
  preferredSchedule: z.string().optional().nullable(),
  motivation: z.string().max(1000, "Motivation is too long").optional().nullable(),
});

/**
 * Update Student Profile API Route
 * 
 * PATCH /api/user/student-profile
 * 
 * Updates the student's profile information
 */
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, "GENERAL");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Verify user is a student
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "STUDENT") {
      return createErrorResponse(Errors.Forbidden("Only students can update student profiles"));
    }

    const body = await request.json();
    const validated = updateStudentProfileSchema.parse(body);

    // Update or create student profile
    const studentProfile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        learningGoal: validated.learningGoal ?? undefined,
        currentLevel: validated.currentLevel ?? undefined,
        preferredSchedule: validated.preferredSchedule ?? undefined,
        motivation: validated.motivation ?? undefined,
      },
      create: {
        userId: session.user.id,
        learningGoal: validated.learningGoal ?? null,
        currentLevel: validated.currentLevel ?? null,
        preferredSchedule: validated.preferredSchedule ?? null,
        motivation: validated.motivation ?? null,
      },
    });

    return NextResponse.json(
      {
        message: "Student profile updated successfully",
        profile: studentProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(createValidationErrorResponse(error));
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      error,
      "Failed to update student profile. Please try again."
    );
  }
}
