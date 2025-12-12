import { NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { Role } from "@prisma/client";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";

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
    // hourlyRate is fixed at $30/hour, tutors receive $15/hour after commission
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

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true },
    });

    if (!existingUser) {
      return createErrorResponse(
        Errors.NotFound("User not found. Please sign in again.")
      );
    }

    const body = await request.json();
    const validated = onboardingSchema.parse(body);

    if (validated.role === "STUDENT") {
      // Update user role
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: Role.STUDENT,
        },
      });

      // Create or update student profile
      await prisma.studentProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          learningGoal: validated.data.learningGoal,
          currentLevel: validated.data.currentLevel,
          preferredSchedule: validated.data.preferredSchedule,
          motivation: validated.data.motivation || null,
        },
        update: {
          learningGoal: validated.data.learningGoal,
          currentLevel: validated.data.currentLevel,
          preferredSchedule: validated.data.preferredSchedule,
          motivation: validated.data.motivation || null,
        },
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail({
        email: existingUser.email,
        name: existingUser.name || undefined,
        role: "STUDENT",
      }).catch(async (error) => {
        const { logger } = await import("@/lib/logger");
        await logger.error("Failed to send welcome email", error, {
          userId: session.user.id,
          role: "STUDENT",
        });
        // Don't fail the request if email fails
      });

      return NextResponse.json(
        {
          message: "Onboarding completed successfully",
        },
        { status: 200 }
      );
    } else {
      // For tutors, create tutor profile
      // Hourly rate is fixed at $30/hour (tutors receive $15/hour after commission)

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
            hourlyRate: 30, // Fixed rate - tutors receive $15/hour after commission
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
            hourlyRate: 30, // Fixed rate - tutors receive $15/hour after commission
            approvalStatus: "PENDING", // Tutors need admin approval
          },
        });
      }

      // Update user role
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: Role.TUTOR },
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail({
        email: existingUser.email,
        name: existingUser.name || undefined,
        role: "TUTOR",
      }).catch(async (error) => {
        const { logger } = await import("@/lib/logger");
        await logger.error("Failed to send welcome email", error, {
          userId: session.user.id,
          role: "TUTOR",
        });
        // Don't fail the request if email fails
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
        Errors.BadRequest(error.issues[0]?.message || "Invalid input")
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
      const { logger } = await import("@/lib/logger");
      await logger.error("Onboarding error", error);
    }

    return createErrorResponse(
      error,
      "Failed to complete onboarding. Please try again."
    );
  }
}

