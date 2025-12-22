import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils/slug";
import { TutorDetailClient } from "@/components/tutors/TutorDetailClient";
import { PublicNav } from "@/components/navigation/PublicNav";
import { TutorSchema, BreadcrumbSchema } from "@/lib/seo/structured-data";

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

// Revalidate every 5 minutes for tutor details
export const revalidate = 300;
export async function generateMetadata({
  params,
}: TutorDetailPageProps) {
  const { locale, tutorName } = await params;
  const t = await getTranslations("tutor");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  // Find tutor by slug - query TutorProfile directly
  // Filter by isActive and approvalStatus first, then filter user role in memory
  const tutorProfiles = await prisma.tutorProfile.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED",
    },
    include: {
      user: true,
    },
  });

  // Filter by user role and name in memory to avoid relation filtering issues
  const validTutorProfiles = tutorProfiles.filter(
    (tp) => tp.user.role === "TUTOR" && tp.user.name !== null
  );

  const tutorProfile = tutorProfiles.find(
    (tp) => tp.user.name && slugify(tp.user.name) === tutorName
  );

  if (!tutorProfile) {
    return {
      title: "Tutor Not Found - Linglix",
    };
  }

  const tutorNameValue = tutorProfile.user.name!;
  const specialties = tutorProfile.specialties.join(", ");
  const description = tutorProfile.bio || `${tutorNameValue} is a certified ${specialties} tutor on Linglix. Book a personalized 1-on-1 lesson today!`;
  const url = `${baseUrl}/${locale}/tutors/${tutorName}`;
  const imageUrl = tutorProfile.user.image || `${baseUrl}/default-tutor.jpg`;

  // Generate alternate language URLs
  const { locales } = await import("@/config/i18n/config");
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = `${baseUrl}/${loc}/tutors/${tutorName}`;
  });

  return {
    title: `${tutorNameValue} - ${specialties} Tutor | Linglix`,
    description: description,
    keywords: [
      `${tutorNameValue} tutor`,
      ...tutorProfile.specialties,
      "language tutor",
      "online tutor",
      "native speaker",
    ],
    alternates: {
      canonical: url,
      languages: {
        ...alternates,
        "x-default": `${baseUrl}/en/tutors/${tutorName}`,
      },
    },
    openGraph: {
      type: "profile",
      locale: locale,
      url: url,
      siteName: "Linglix",
      title: `${tutorNameValue} - ${specialties} Tutor | Linglix`,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${tutorNameValue} - Language Tutor`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tutorNameValue} - ${specialties} Tutor`,
      description: description,
      images: [imageUrl],
      creator: "@linglix",
      site: "@linglix",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function TutorDetailPage({
  params,
}: TutorDetailPageProps) {
  const { locale, tutorName } = await params;
  const t = await getTranslations("tutor");

  // Find tutor by slug - query TutorProfile directly
  // Filter by isActive and approvalStatus first, then filter user role in memory
  const tutorProfiles = await prisma.tutorProfile.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED",
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

  // Filter by user role and name in memory to avoid relation filtering issues
  const validTutorProfiles = tutorProfiles.filter(
    (tp) => tp.user.role === "TUTOR" && tp.user.name !== null
  );

  const tutorProfile = validTutorProfiles.find(
    (tp) => tp.user.name && slugify(tp.user.name) === tutorName
  );

  if (!tutorProfile) {
    notFound();
  }

  const tutor = {
    ...tutorProfile.user,
    tutorProfile: tutorProfile,
  };

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";
  const tutorUrl = `${baseUrl}/${locale}/tutors/${tutorName}`;

  return (
    <>
      <TutorSchema
        name={tutorData.name}
        url={tutorUrl}
        image={tutorData.image}
        bio={tutorData.bio}
        specialties={tutorData.specialties}
        rating={tutorData.rating}
        reviewCount={tutorData.reviews.length}
        hourlyRate={tutorData.hourlyRate}
        totalSessions={tutorData.totalSessions}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: "Tutors", url: `${baseUrl}/${locale}/tutors` },
          { name: tutorData.name, url: tutorUrl },
        ]}
      />
      <PublicNav locale={locale} session={session} />
      <div className="pt-16 sm:pt-20">
        <TutorDetailClient tutor={tutorData} locale={locale} />
      </div>
    </>
  );
}

