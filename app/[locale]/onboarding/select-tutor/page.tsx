import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { PublicNav } from "@/components/navigation/PublicNav";
import { TutorSelectionClient } from "@/components/onboarding/TutorSelectionClient";
import { slugify } from "@/lib/utils/slug";
import { Prisma } from "@prisma/client";

/**
 * Post-Onboarding Tutor Selection Page
 * 
 * Shows recommended tutors based on student preferences.
 * If no relevant tutors found, shows top-rated tutors.
 */
export async function generateMetadata() {
  const t = await getTranslations("onboarding.selectTutor");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SelectTutorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  // Redirect if not authenticated
  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  // Check if user is a student
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: true,
    },
  });

  if (!user || user.role !== "STUDENT" || !user.studentProfile) {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch recommended tutors
  let tutorsData: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
    specialties: string[];
    rating: number;
    hourlyRate: number;
    totalSessions: number;
    bio: string | null;
    isRecommended: boolean;
  }> = [];

  let hasRecommendations = false;
  let studentPreferences = {
    learningGoal: user.studentProfile.learningGoal,
    currentLevel: user.studentProfile.currentLevel,
    preferredSchedule: user.studentProfile.preferredSchedule,
  };

  try {
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

    const specialtyMatches = getSpecialtyMatches(user.studentProfile.learningGoal);

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
    tutorsData = tutors
      .filter((tutor) => tutor.tutorProfile && tutor.name)
      .map((tutor) => ({
        id: tutor.id,
        name: tutor.name!,
        slug: slugify(tutor.name!),
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

    hasRecommendations = specialtyMatches.length > 0 && tutorsData.some(t => t.isRecommended);
  } catch (error) {
    // If error, just show empty state - component will handle it
    console.error("Error fetching recommended tutors:", error);
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
      <PublicNav locale={locale} session={session} />
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full opacity-60 dark:opacity-40 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(204,243,129)_0%,rgba(0,0,0,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full opacity-60 dark:opacity-40 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(255,235,59)_0%,rgba(0,0,0,0)_70%)]" />

      <div className="relative z-10 pt-24 sm:pt-28 pb-12">
        <TutorSelectionClient
          tutors={tutorsData}
          locale={locale}
          hasRecommendations={hasRecommendations}
          studentPreferences={studentPreferences}
        />
      </div>
    </div>
  );
}
