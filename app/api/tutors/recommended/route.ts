import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/tutors/recommended
 * 
 * Returns tutors recommended based on student's onboarding preferences.
 * If no relevant tutors found, returns top-rated tutors.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get student profile with preferences
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: {
        learningGoal: true,
        currentLevel: true,
        preferredSchedule: true,
      },
    });

    if (!studentProfile) {
      return createErrorResponse(
        Errors.NotFound("Student profile not found. Please complete onboarding first.")
      );
    }

    // Map learning goals to potential tutor specialties
    const getSpecialtyMatches = (learningGoal: string | null): string[] => {
      if (!learningGoal) return [];
      
      const goalMap: Record<string, string[]> = {
        conversation: ["Conversation Practice", "Conversational English", "Speaking"],
        business: ["Business English", "Business", "Professional English"],
        academic: ["Academic English", "Academic", "Writing"],
        travel: ["Travel & Tourism", "Travel English", "Tourism"],
        exam: ["IELTS Prep", "TOEFL Prep", "Exam Preparation", "IELTS", "TOEFL"],
        other: [],
      };

      return goalMap[learningGoal.toLowerCase()] || [];
    };

    const specialtyMatches = getSpecialtyMatches(studentProfile.learningGoal);

    // Build query for relevant tutors
    const tutorProfileConditions: Prisma.TutorProfileWhereInput = {
      isActive: true,
      approvalStatus: "APPROVED",
    };

    // If we have specialty matches, filter by them
    if (specialtyMatches.length > 0) {
      tutorProfileConditions.specialties = {
        hasSome: specialtyMatches,
      };
    }

    const where: Prisma.UserWhereInput = {
      role: "TUTOR",
      tutorProfile: tutorProfileConditions,
    };

    // Try to find relevant tutors first
    let tutors = await prisma.user.findMany({
      where,
      include: {
        tutorProfile: {
          select: {
            specialties: true,
            rating: true,
            hourlyRate: true,
            totalSessions: true,
            bio: true,
          },
        },
      },
      orderBy: {
        tutorProfile: {
          rating: "desc",
        },
      },
      take: 12,
    });

    // If no relevant tutors found, get top-rated tutors
    if (tutors.length === 0) {
      tutors = await prisma.user.findMany({
        where: {
          role: "TUTOR",
          tutorProfile: {
            isActive: true,
            approvalStatus: "APPROVED",
          },
        },
        include: {
          tutorProfile: {
            select: {
              specialties: true,
              rating: true,
              hourlyRate: true,
              totalSessions: true,
              bio: true,
            },
          },
        },
        orderBy: {
          tutorProfile: {
            rating: "desc",
          },
        },
        take: 12,
      });
    }

    // Transform tutors data
    const tutorsData = tutors
      .filter((tutor) => tutor.tutorProfile && tutor.name)
      .map((tutor) => ({
        id: tutor.id,
        name: tutor.name!,
        image: tutor.image,
        specialties: tutor.tutorProfile!.specialties,
        rating: tutor.tutorProfile!.rating,
        hourlyRate: tutor.tutorProfile!.hourlyRate,
        totalSessions: tutor.tutorProfile!.totalSessions,
        bio: tutor.tutorProfile!.bio,
        isRecommended: specialtyMatches.length > 0 && 
          tutor.tutorProfile!.specialties.some(spec => 
            specialtyMatches.some(match => 
              spec.toLowerCase().includes(match.toLowerCase()) || 
              match.toLowerCase().includes(spec.toLowerCase())
            )
          ),
      }));

    return NextResponse.json({
      tutors: tutorsData,
      hasRecommendations: specialtyMatches.length > 0 && tutorsData.some(t => t.isRecommended),
      studentPreferences: {
        learningGoal: studentProfile.learningGoal,
        currentLevel: studentProfile.currentLevel,
        preferredSchedule: studentProfile.preferredSchedule,
      },
    });
  } catch (error) {
    return createErrorResponse(
      error,
      "Failed to fetch recommended tutors. Please try again."
    );
  }
}
