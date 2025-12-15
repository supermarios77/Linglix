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

  // Single Tutor - Clean Professional Layout
  if (tutorCount === 1) {
    const tutor = tutorData[0];
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">{t("trending.title")}</h3>
          <Link 
            href={`/${locale}/tutors`} 
            className="text-sm font-medium text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
          >
            {t("trending.seeAll")} →
          </Link>
        </div>
        
        <Link href={`/${locale}/tutors/${tutor.slug}`}>
          <div className="group bg-white dark:bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-[32px] border border-[#e5e5e5] dark:border-[#262626] overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1">
            <div className="p-8 sm:p-10 md:p-12">
              {/* Featured Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 dark:bg-accent/20 border border-accent/30 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {t("trending.featuredTutor")}
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="space-y-6">
                {/* Name and Specialty */}
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white mb-3 group-hover:text-accent transition-colors">
                    {tutor.name}
                  </h2>
                  <p className="text-lg sm:text-xl text-[#666] dark:text-[#a1a1aa] font-medium">
                    {getPrimarySpecialty(tutor.specialties)}
                  </p>
                </div>
                
                {/* Stats - Enhanced */}
                <div className="flex flex-wrap items-center gap-6 sm:gap-8 pb-6 border-b border-[#e5e5e5] dark:border-[#262626]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(tutor.rating)
                              ? "fill-[#ffb800] text-[#ffb800]"
                              : "fill-none text-[#e5e5e5] dark:text-[#404040]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold text-black dark:text-white ml-1">
                      {tutor.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#888] dark:text-[#666]" />
                    <span className="text-base font-medium text-[#666] dark:text-[#a1a1aa]">
                      {tutor.totalSessions}+ {t("trending.sessions")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-black dark:text-white">
                      ${tutor.hourlyRate}
                    </span>
                    <span className="text-sm text-[#888] dark:text-[#666]">
                      {t("trending.hourly")}
                    </span>
                  </div>
                </div>
                
                {/* Specialties - Enhanced */}
                <div className="flex flex-wrap gap-3">
                  {tutor.specialties.slice(0, 4).map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] text-sm font-medium text-black dark:text-white rounded-full hover:border-accent dark:hover:border-accent transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                      {specialty}
                    </span>
                  ))}
                  {tutor.specialties.length > 4 && (
                    <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#888] dark:text-[#a1a1aa]">
                      +{tutor.specialties.length - 4} more
                    </span>
                  )}
                </div>
                
                {/* CTA - Enhanced */}
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 text-base font-semibold text-black dark:text-white group-hover:text-accent transition-colors">
                    <span>{t("trending.viewProfile")}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>
    );
  }

  // Two Tutors - Side by Side
  if (tutorCount === 2) {
    return (
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 sm:mb-8 md:mb-10">
          <h3 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
          <Link 
            href={`/${locale}/tutors`} 
            className="underline font-medium text-sm sm:text-base text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
          >
            {t("trending.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {tutorData.map((tutor) => (
            <Link key={tutor.id} href={`/${locale}/tutors/${tutor.slug}`}>
              <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-2 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 text-black dark:text-white">{tutor.name}</h4>
                    <p className="text-sm sm:text-base text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#ffb800] text-[#ffb800]" />
                      <span className="text-base sm:text-lg font-bold text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-black dark:text-white">${tutor.hourlyRate}{t("trending.hourly")}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Three Tutors - 1 Large + 2 Small
  if (tutorCount === 3) {
    return (
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 sm:mb-8 md:mb-10">
          <h3 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
          <Link 
            href={`/${locale}/tutors`} 
            className="underline font-medium text-sm sm:text-base text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
          >
            {t("trending.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Large Card */}
          <Link href={`/${locale}/tutors/${tutorData[0].slug}`} className="md:col-span-2">
            <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-2 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] h-full">
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold mb-1 text-black dark:text-white">{tutorData[0].name}</h4>
                  <p className="text-sm sm:text-base text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutorData[0].specialties)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#ffb800] text-[#ffb800]" />
                    <span className="text-base sm:text-lg font-bold text-black dark:text-white">{tutorData[0].rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-black dark:text-white">${tutorData[0].hourlyRate}{t("trending.hourly")}</span>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Two Small Cards */}
          <div className="space-y-4 sm:space-y-6">
            {tutorData.slice(1, 3).map((tutor) => (
              <Link key={tutor.id} href={`/${locale}/tutors/${tutor.slug}`}>
                <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-1 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold mb-0.5 text-black dark:text-white">{tutor.name}</h4>
                      <p className="text-[10px] sm:text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#ffb800] text-[#ffb800]" />
                        <span className="text-xs sm:text-sm font-bold text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">${tutor.hourlyRate}{t("trending.hourly")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Four or More Tutors - Grid Layout
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 sm:mb-8 md:mb-10">
        <h3 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
        <Link 
          href={`/${locale}/tutors`} 
          className="underline font-medium text-sm sm:text-base text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
        >
          {t("trending.seeAll")}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {tutorData.map((tutor) => (
          <Link key={tutor.id} href={`/${locale}/tutors/${tutor.id}`}>
            <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-sm sm:text-base block mb-1 text-black dark:text-white">{tutor.name}</span>
                  <span className="text-[10px] sm:text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#ffb800] text-[#ffb800]" />
                  <span className="font-bold text-xs sm:text-sm text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

