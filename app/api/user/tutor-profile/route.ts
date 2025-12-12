import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { z } from "zod";
import { NextResponse } from "next/server";

// Language proficiency enum
const LanguageProficiencyEnum = z.enum(["NATIVE", "FLUENT", "ADVANCED", "INTERMEDIATE", "BASIC"]);

// Language known schema
const LanguageKnownSchema = z.object({
  language: z.string().min(1, "Language is required"),
  proficiency: LanguageProficiencyEnum,
});

const updateTutorProfileSchema = z.object({
  introduction: z.string().max(500, "Introduction is too long").optional().nullable(),
  aboutMe: z.string().max(2000, "About me is too long").optional().nullable(),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000, "Bio is too long").optional().nullable(),
  languagesKnown: z.array(LanguageKnownSchema).optional().nullable(),
  languagesTaught: z.array(z.string().min(1)).optional(),
  specialties: z.array(z.string().min(1)).min(1, "At least one specialty is required").optional(),
  teachingStyle: z.string().max(1000, "Teaching style is too long").optional().nullable(),
  preferredLevels: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  industryFamiliarity: z.array(z.string()).optional(),
  experience: z.string().max(2000, "Experience is too long").optional().nullable(),
  workExperience: z.string().max(2000, "Work experience is too long").optional().nullable(),
  degrees: z.string().max(1000, "Degrees is too long").optional().nullable(),
  // hourlyRate is removed - it's fixed at $30
});

/**
 * Update Tutor Profile API Route
 * 
 * PATCH /api/user/tutor-profile
 * 
 * Updates the tutor's profile information
 * Note: hourlyRate is fixed at $30/hour (tutors receive $15/hour after commission)
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

    // Update tutor profile - hourlyRate is always set to 30 (fixed rate)
    const tutorProfile = await prisma.tutorProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(validated.introduction !== undefined && { introduction: validated.introduction }),
        ...(validated.aboutMe !== undefined && { aboutMe: validated.aboutMe }),
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.languagesKnown !== undefined && { languagesKnown: validated.languagesKnown as any }),
        ...(validated.languagesTaught !== undefined && { languagesTaught: validated.languagesTaught }),
        ...(validated.specialties !== undefined && { specialties: validated.specialties }),
        ...(validated.teachingStyle !== undefined && { teachingStyle: validated.teachingStyle }),
        ...(validated.preferredLevels !== undefined && { preferredLevels: validated.preferredLevels }),
        ...(validated.interests !== undefined && { interests: validated.interests }),
        ...(validated.industryFamiliarity !== undefined && { industryFamiliarity: validated.industryFamiliarity }),
        ...(validated.experience !== undefined && { experience: validated.experience }),
        ...(validated.workExperience !== undefined && { workExperience: validated.workExperience }),
        ...(validated.degrees !== undefined && { degrees: validated.degrees }),
        hourlyRate: 30, // Always set to fixed rate of $30/hour
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
