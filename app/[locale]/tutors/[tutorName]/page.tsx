import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils/slug";
import { TutorDetailClient } from "@/components/tutors/TutorDetailClient";
import { PublicNav } from "@/components/navigation/PublicNav";

interface TutorDetailPageProps {
  params: Promise<{ locale: string; tutorName: string }>;
}

/**
 * Tutor Detail Page
 * 
 * Displays individual tutor profile with full details
 * Uses tutor name slug in URL: /[locale]/tutors/[tutorName]
 * 
 * Production-ready with:
 * - Server-side data fetching
 * - 404 handling for invalid slugs
 * - Full internationalization
 */
export async function generateMetadata({
  params,
}: TutorDetailPageProps) {
  const { locale, tutorName } = await params;
  const t = await getTranslations("tutor");

  // Find tutor by slug
  const tutors = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorProfile: {
        isActive: true,
      },
    },
    include: {
      tutorProfile: true,
    },
  });

  const tutor = tutors.find(
    (t) => t.name && slugify(t.name) === tutorName
  );

  if (!tutor) {
    return {
      title: "Tutor Not Found - Linglix",
    };
  }

  return {
    title: `${tutor.name} - ${t("title")} - Linglix`,
    description: tutor.tutorProfile?.bio || t("subtitle"),
  };
}

export default async function TutorDetailPage({
  params,
}: TutorDetailPageProps) {
  const { locale, tutorName } = await params;
  const t = await getTranslations("tutor");

  // Find tutor by slug - only show approved and active tutors
  const tutors = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorProfile: {
        isActive: true,
        approvalStatus: "APPROVED", // Only show approved tutors
      },
    },
    include: {
      tutorProfile: {
        include: {
          availability: {
            where: {
              isActive: true,
            },
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      },
    },
  });

  const tutor = tutors.find(
    (t) => t.name && slugify(t.name) === tutorName
  );

  if (!tutor || !tutor.tutorProfile) {
    notFound();
  }

  // Get reviews for this tutor
  // TODO: Fetch actual reviews when Review model is populated
  const reviews: {
    id: string;
    rating: number;
    comment: string | null;
    studentId: string;
    createdAt: Date;
    tags: string[];
  }[] = [];

  const tutorData = {
    id: tutor.id,
    name: tutor.name!,
    slug: slugify(tutor.name!),
    image: tutor.image,
    email: tutor.email,
    bio: tutor.tutorProfile.bio,
    specialties: tutor.tutorProfile.specialties,
    rating: tutor.tutorProfile.rating,
    hourlyRate: tutor.tutorProfile.hourlyRate,
    totalSessions: tutor.tutorProfile.totalSessions,
    availability: tutor.tutorProfile.availability.map((avail) => ({
      dayOfWeek: avail.dayOfWeek,
      startTime: avail.startTime,
      endTime: avail.endTime,
      timezone: avail.timezone,
    })),
    reviews,
  };

  const session = await auth();

  return (
    <>
      <PublicNav locale={locale} session={session} />
      <div className="pt-16 sm:pt-20">
        <TutorDetailClient tutor={tutorData} locale={locale} />
      </div>
    </>
  );
}

