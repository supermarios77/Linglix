import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { TutorsListingClient } from "@/components/tutors/TutorsListingClient";
import { PublicNav } from "@/components/navigation/PublicNav";
import { slugify } from "@/lib/utils/slug";
import { Prisma } from "@prisma/client";
import { BreadcrumbSchema } from "@/lib/seo/structured-data";

interface TutorsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    language?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    page?: string;
  }>;
}

/**
 * Tutors Listing Page
 * 
 * Displays all available tutors with search and filtering
 * Production-ready with:
 * - Server-side data fetching
 * - Search and filter functionality
 * - Pagination
 * - Full internationalization
 * - Caching (5 minutes TTL)
 */

// Enable static generation for better performance
export const revalidate = 300; // Revalidate every 5 minutes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("tutor");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  // Generate alternate language URLs
  const { locales } = await import("@/config/i18n/config");
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = `${baseUrl}/${loc}/tutors`;
  });

  return {
    title: `Find Language Tutors Online | ${t("title")} - Linglix`,
    description: t("subtitle") || "Browse certified native language tutors. Filter by language, price, and rating. Book your first 1-on-1 lesson today!",
    keywords: [
      "language tutors",
      "online tutors",
      "native speakers",
      "Spanish tutors",
      "English tutors",
      "French tutors",
      "find tutor",
      "language lessons",
    ],
    alternates: {
      canonical: `${baseUrl}/${locale}/tutors`,
      languages: {
        ...alternates,
        "x-default": `${baseUrl}/en/tutors`,
      },
    },
    openGraph: {
      title: `Find Language Tutors Online | ${t("title")} - Linglix`,
      description: t("subtitle") || "Browse certified native language tutors and book personalized lessons",
      url: `${baseUrl}/${locale}/tutors`,
      siteName: "Linglix",
      locale: locale,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-tutors.jpg`,
          width: 1200,
          height: 630,
          alt: "Linglix - Find Language Tutors",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Find Language Tutors Online | ${t("title")}`,
      description: t("subtitle") || "Browse certified native language tutors",
      images: [`${baseUrl}/twitter-tutors.jpg`],
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
    verification: {
      // Add verification codes when available
    },
  };
}

export default async function TutorsPage({
  params,
  searchParams,
}: TutorsPageProps) {
  const { locale } = await params;
  const searchParamsResolved = await searchParams;
  const t = await getTranslations("tutor");

  // Parse search parameters
  const search = searchParamsResolved.search || "";
  const language = searchParamsResolved.language || "";
  const minPrice = searchParamsResolved.minPrice
    ? parseFloat(searchParamsResolved.minPrice)
    : undefined;
  const maxPrice = searchParamsResolved.maxPrice
    ? parseFloat(searchParamsResolved.maxPrice)
    : undefined;
  const minRating = searchParamsResolved.minRating
    ? parseFloat(searchParamsResolved.minRating)
    : undefined;
  const page = parseInt(searchParamsResolved.page || "1", 10);
  const perPage = 12;

  // Build where clause - only show approved and active tutors
  const tutorProfileConditions: Prisma.TutorProfileWhereInput = {
    isActive: true,
    approvalStatus: "APPROVED", // Only show approved tutors
  };

  // Add language/specialty filter
  if (language) {
    tutorProfileConditions.specialties = {
      has: language,
    };
  }

  // Add price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    tutorProfileConditions.hourlyRate = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  // Add rating filter
  if (minRating !== undefined) {
    tutorProfileConditions.rating = {
      gte: minRating,
    };
  }

  // Build where clause
  const where: Prisma.UserWhereInput = {
    role: "TUTOR",
    tutorProfile: tutorProfileConditions,
  };

  // Add search filter (name or specialties)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      {
        tutorProfile: {
          ...tutorProfileConditions,
          specialties: {
            hasSome: [search],
          },
        },
      },
    ];
  }

  // Use cache for tutors listing
  const { getOrSetCache, CacheConfig, generateCacheKey } = await import("@/lib/cache");
  const cacheKey = generateCacheKey(
    CacheConfig.TUTORS_LIST.keyPrefix,
    locale,
    page,
    search || "",
    language || "",
    minPrice || "",
    maxPrice || "",
    minRating || ""
  );

  // Fetch tutors with pagination (cached)
  const [tutors, totalCount, allLanguages] = await Promise.all([
    getOrSetCache(
      generateCacheKey(cacheKey, "tutors"),
      async () => {
        const result = await prisma.user.findMany({
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
          skip: (page - 1) * perPage,
          take: perPage,
        });
        return result;
      },
      CacheConfig.TUTORS_LIST.ttl
    ),
    getOrSetCache(
      generateCacheKey(cacheKey, "count"),
      async () => prisma.user.count({ where }),
      CacheConfig.TUTORS_LIST.ttl
    ),
    // Get all unique languages/specialties for filter (cached)
    getOrSetCache(
      generateCacheKey(CacheConfig.TUTOR_SPECIALTIES.keyPrefix),
      async () => {
        const { getAllTutorSpecialties } = await import("@/lib/db/query-optimization");
        return await getAllTutorSpecialties();
      },
      CacheConfig.TUTOR_SPECIALTIES.ttl
    ),
  ]);

  // Transform tutors data with slugs
  const tutorsData = tutors
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
    }));

  const totalPages = Math.ceil(totalCount / perPage);
  const session = await auth();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";
  const tutorsUrl = `${baseUrl}/${locale}/tutors`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: "Tutors", url: tutorsUrl },
        ]}
      />
      <PublicNav locale={locale} session={session} />
      <div className="pt-16 sm:pt-20">
        <TutorsListingClient
          tutors={tutorsData}
          locale={locale}
          search={search}
          language={language}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minRating={minRating}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          languages={allLanguages}
        />
      </div>
    </>
  );
}

