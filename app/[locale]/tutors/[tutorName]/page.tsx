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
  const tutorProfiles = await prisma.tutorProfile.findMany({
    where: {
      isActive: true,
      user: {
        role: "TUTOR",
      },
    },
    include: {
      user: true,
    },
  });

  const tutorProfile = tutorProfiles.find(
    (tp) => tp.user.name && slugify(tp.user.name) === tutorName
  );

  if (!tutorProfile) {
    return {
      title: "Tutor Not Found - Linglix",
    };
  }

  return {
    title: `${tutorProfile.user.name} - ${t("title")} - Linglix`,
    description: tutorProfile.bio || t("subtitle"),
  };
}

export default async function TutorDetailPage({
  params,
}: TutorDetailPageProps) {
  const { locale, tutorName } = await params;
  const t = await getTranslations("tutor");

  // Find tutor by slug - only show approved and active tutors
  const tutorProfiles = await prisma.tutorProfile.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED", // Only show approved tutors
      user: {
        role: "TUTOR",
      },
    },
    include: {
      user: true,
      availability: {
        where: {
          isActive: true,
        },
        orderBy: {
          dayOfWeek: "asc",
        },
      },
    },
  });

  const tutors = tutorProfiles.map((tp) => ({
    ...tp.user,
    tutorProfile: tp,
  }));

  const tutor = tutors.find(
    (t) => t.name && slugify(t.name) === tutorName
  );

  if (!tutor) {
    notFound();
  }

  // Get reviews for this tutor
  const reviews = await prisma.review.findMany({
    where: {
      tutorId: tutor.tutorProfile.id,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      studentId: review.studentId,
      studentName: review.student.name,
      studentImage: review.student.image,
      createdAt: review.createdAt,
      tags: review.tags,
    })),
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

