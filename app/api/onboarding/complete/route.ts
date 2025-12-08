import { NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { Role } from "@prisma/client";
import { z } from "zod";

const studentOnboardingSchema = z.object({
  role: z.literal("STUDENT"),
  data: z.object({
    learningGoal: z.string(),
    currentLevel: z.string(),
    preferredSchedule: z.string(),
    motivation: z.string().optional(),
  }),
});

const tutorOnboardingSchema = z.object({
  role: z.literal("TUTOR"),
  data: z.object({
    bio: z.string().min(50, "Bio must be at least 50 characters"),
    specialties: z.array(z.string()).min(1, "At least one specialty is required"),
    hourlyRate: z.string().refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 5;
      },
      { message: "Hourly rate must be at least $5" }
    ),
    experience: z.string().optional(),
    teachingStyle: z.string().optional(),
    availability: z.string().optional(),
  }),
});

const onboardingSchema = z.discriminatedUnion("role", [
  studentOnboardingSchema,
  tutorOnboardingSchema,
]);

/**
 * Complete Onboarding API Route
 * 
 * POST /api/onboarding/complete
 * 
 * Completes the onboarding process for a user
 * - For students: saves preferences
 * - For tutors: creates tutor profile
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return createErrorResponse(Errors.Unauthorized());
    }

    const body = await request.json();
    const validated = onboardingSchema.parse(body);

    if (validated.role === "STUDENT") {
      // For students, we can store preferences in a separate table or user metadata
      // For now, we'll just ensure the role is set correctly
      // In the future, you might want to create a StudentProfile table
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: Role.STUDENT,
          // Store onboarding data as JSON in a metadata field if needed
        },
      });

      return NextResponse.json(
        {
          message: "Onboarding completed successfully",
        },
        { status: 200 }
      );
    } else {
      // For tutors, create tutor profile
      const hourlyRate = parseFloat(validated.data.hourlyRate);

      // Check if tutor profile already exists
      const existingProfile = await prisma.tutorProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (existingProfile) {
        // Update existing profile
        await prisma.tutorProfile.update({
          where: { userId: session.user.id },
          data: {
            bio: validated.data.bio,
            specialties: validated.data.specialties,
            hourlyRate,
            // Store additional data in bio or create metadata field
          },
        });
      } else {
        // Create new tutor profile
        await prisma.tutorProfile.create({
          data: {
            userId: session.user.id,
            bio: validated.data.bio,
            specialties: validated.data.specialties,
            hourlyRate,
            approvalStatus: "PENDING", // Tutors need admin approval
          },
        });
      }

      // Update user role
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: Role.TUTOR },
      });

      return NextResponse.json(
        {
          message: "Onboarding completed successfully. Your tutor profile is pending approval.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.errors[0]?.message || "Invalid input")
      );
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    // Log error to Sentry in production
    if (process.env.NODE_ENV === "production") {
      const { captureException } = await import("@sentry/nextjs");
      captureException(error, {
        tags: {
          route: "/api/onboarding/complete",
          method: "POST",
        },
      });
    } else {
      console.error("Onboarding error:", error);
    }

    return createErrorResponse(
      error,
      "Failed to complete onboarding. Please try again."
    );
  }
}

