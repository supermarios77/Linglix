import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { z } from "zod";
import { NextResponse } from "next/server";

const updateTutorProfileSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000, "Bio is too long").optional().nullable(),
  specialties: z.array(z.string().min(1)).min(1, "At least one specialty is required").optional(),
  hourlyRate: z.number().min(5, "Hourly rate must be at least $5").max(1000, "Hourly rate is too high").optional(),
});

/**
 * Update Tutor Profile API Route
 * 
 * PATCH /api/user/tutor-profile
 * 
 * Updates the tutor's profile information
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Verify user is a tutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "TUTOR") {
      return createErrorResponse(Errors.Forbidden("Only tutors can update tutor profiles"));
    }

    const body = await request.json();
    const validated = updateTutorProfileSchema.parse(body);

    // Check if tutor profile exists
    const existingProfile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return createErrorResponse(
        Errors.NotFound("Tutor profile not found. Please complete onboarding first.")
      );
    }

    // Update tutor profile
    const tutorProfile = await prisma.tutorProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.specialties !== undefined && { specialties: validated.specialties }),
        ...(validated.hourlyRate !== undefined && { hourlyRate: validated.hourlyRate }),
      },
    });

    return NextResponse.json(
      {
        message: "Tutor profile updated successfully",
        profile: tutorProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(Errors.BadRequest(error.errors[0]?.message || "Invalid input"));
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      error,
      "Failed to update tutor profile. Please try again."
    );
  }
}
