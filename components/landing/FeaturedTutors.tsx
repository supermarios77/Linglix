import Link from "next/link";
import { Star, Sparkles, CheckCircle2, ArrowRight, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils/slug";

interface FeaturedTutorsProps {
  locale: string;
}

interface TutorData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  specialties: string[];
  rating: number;
  hourlyRate: number;
  totalSessions: number;
}

/**
 * Featured Tutors Section Component
 * 
 * Fetches tutors from database and displays them with dynamic layouts
 * based on tutor count:
 * - 1 tutor: Large hero-style card (insanely different)
 * - 2 tutors: Side-by-side layout
 * - 3 tutors: 1 large + 2 small cards
 * - 4+ tutors: Grid layout
 * 
 * Production-ready with:
 * - Proper TypeScript types
 * - Caching (10 minutes TTL)
 * - Error handling
 */
export async function FeaturedTutors({ locale }: FeaturedTutorsProps) {
  const t = await getTranslations("landing");

  // Fetch active and approved tutors with their profiles
  // Use cache to reduce database load
  const { getOrSetCache, CacheConfig, generateCacheKey } = await import("@/lib/cache");
  
  const cacheKey = generateCacheKey(CacheConfig.FEATURED_TUTORS.keyPrefix, locale);
  
  let tutors: Awaited<ReturnType<typeof prisma.user.findMany<{
    where: {
      role: "TUTOR";
      tutorProfile: {
        isActive: true;
        approvalStatus: "APPROVED";
      };
    };
    include: {
      tutorProfile: {
        select: {
          specialties: true;
          rating: true;
          hourlyRate: true;
          totalSessions: true;
        };
      };
    };
  }>>> = [];
  
  try {
    tutors = await getOrSetCache(
      cacheKey,
      async () => {
        return await prisma.user.findMany({
          where: {
            role: "TUTOR",
            tutorProfile: {
              isActive: true,
              approvalStatus: "APPROVED", // Only show approved tutors
            },
          },
          include: {
            tutorProfile: {
              select: {
                specialties: true,
                rating: true,
                hourlyRate: true,
                totalSessions: true,
              },
            },
          },
          take: 8, // Limit to 8 for display
          orderBy: {
            tutorProfile: {
              rating: "desc",
            },
          },
        });
      },
      CacheConfig.FEATURED_TUTORS.ttl
    );
  } catch (error) {
    // Log error but don't crash the page
    if (process.env.NODE_ENV === "development") {
      console.error("[FeaturedTutors] Database error:", error);
    }
    // Return empty array to show empty state
    tutors = [];
  }

  // Transform to simpler format
  const tutorData: TutorData[] = tutors
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
    }));

  const tutorCount = tutorData.length;

  // Empty state - no tutors available
  if (tutorCount === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 sm:mb-8 md:mb-10">
          <h3 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
        </div>
        <div className="text-center py-12 sm:py-16">
          <p className="text-[#888] dark:text-[#a1a1aa] text-base sm:text-lg">
            {t("trending.noTutorsAvailable") || "No tutors available at the moment. Please check back later."}
          </p>
        </div>
      </section>
    );
  }

  // Get primary specialty or default
  const getPrimarySpecialty = (specialties: string[]) => {
    if (specialties.length > 0) {
      return specialties[0];
    }
    return t("trending.languageTutor");
  };

  // Single Tutor - Grid Style (matches product grid)
  if (tutorCount === 1) {
    const tutor = tutorData[0];
    return (
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <h3 className="text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
          <Link 
            href={`/${locale}/tutors`} 
            className="underline font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
          >
            {t("trending.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <Link href={`/${locale}/tutors/${tutor.slug}`}>
            <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
              <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-6xl">👨‍🏫</div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-base block mb-1 text-black dark:text-white">{tutor.name}</span>
                  <span className="text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</span>
                </div>
                <span className="font-bold text-black dark:text-white">${tutor.hourlyRate}</span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  // Two Tutors - Grid Style
  if (tutorCount === 2) {
    return (
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <h3 className="text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
          <Link 
            href={`/${locale}/tutors`} 
            className="underline font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
          >
            {t("trending.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {tutorData.map((tutor) => (
            <Link key={tutor.id} href={`/${locale}/tutors/${tutor.slug}`}>
              <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
                  <div className="text-6xl">👨‍🏫</div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-base block mb-1 text-black dark:text-white">{tutor.name}</span>
                    <span className="text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</span>
                  </div>
                  <span className="font-bold text-black dark:text-white">${tutor.hourlyRate}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Three Tutors - Grid Style
  if (tutorCount === 3) {
    return (
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <h3 className="text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
          <Link 
            href={`/${locale}/tutors`} 
            className="underline font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
          >
            {t("trending.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {tutorData.map((tutor) => (
            <Link key={tutor.id} href={`/${locale}/tutors/${tutor.slug}`}>
              <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
                  <div className="text-6xl">👨‍🏫</div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-base block mb-1 text-black dark:text-white">{tutor.name}</span>
                    <span className="text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</span>
                  </div>
                  <span className="font-bold text-black dark:text-white">${tutor.hourlyRate}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Four or More Tutors - Grid Layout
  return (
    <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end mb-10">
        <h3 className="text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
        <Link 
          href={`/${locale}/tutors`} 
          className="underline font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
        >
          {t("trending.seeAll")}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {tutorData.map((tutor) => (
          <Link key={tutor.id} href={`/${locale}/tutors/${tutor.slug}`}>
            <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
              <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-6xl">👨‍🏫</div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-base block mb-1 text-black dark:text-white">{tutor.name}</span>
                  <span className="text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</span>
                </div>
                <span className="font-bold text-black dark:text-white">${tutor.hourlyRate}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

