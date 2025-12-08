import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { TutorsListingClient } from "@/components/tutors/TutorsListingClient";
import { PublicNav } from "@/components/navigation/PublicNav";
import { slugify } from "@/lib/utils/slug";
import { Prisma } from "@prisma/client";

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
 */
export async function generateMetadata() {
  const t = await getTranslations("tutor");

  return {
    title: `${t("title")} - Linglix`,
    description: t("subtitle"),
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

  // Build where clause
  const tutorProfileConditions: Prisma.TutorProfileWhereInput = {
    isActive: true,
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

  // Fetch tutors with pagination
  const [tutors, totalCount] = await Promise.all([
    prisma.user.findMany({
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
    }),
    prisma.user.count({ where }),
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

  // Get all unique languages/specialties for filter
  const allTutors = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorProfile: {
        isActive: true,
      },
    },
    include: {
      tutorProfile: {
        select: {
          specialties: true,
        },
      },
    },
  });

  const allLanguages = Array.from(
    new Set(
      allTutors
        .filter((t) => t.tutorProfile)
        .flatMap((t) => t.tutorProfile!.specialties)
    )
  ).sort();

  const totalPages = Math.ceil(totalCount / perPage);
  const session = await auth();

  return (
    <>
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

