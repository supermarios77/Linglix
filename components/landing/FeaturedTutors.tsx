import Link from "next/link";
import Image from "next/image";
import { Star, Users, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
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
 * Production-ready with proper TypeScript types
 */
export async function FeaturedTutors({ locale }: FeaturedTutorsProps) {
  const t = await getTranslations("landing");

  // Fetch active and approved tutors with their profiles
  // Gracefully handle database connection errors
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
    tutors = await prisma.user.findMany({
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
          <div className="group bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#e5e5e5] dark:border-[#1a1a1a] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative w-full md:w-80 h-64 md:h-auto bg-[#f5f5f5] dark:bg-[#121212] flex-shrink-0">
                {tutor.image ? (
                  <Image
                    src={tutor.image}
                    alt={tutor.name || t("trending.tutorFallback")}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
                  </div>
                )}
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#ccf381] text-black text-xs font-semibold rounded-full">
                  {t("trending.featuredTutor")}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                    {tutor.name}
                  </h2>
                  <p className="text-[#666] dark:text-[#a1a1aa] mb-4">
                    {getPrimarySpecialty(tutor.specialties)}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                      <span className="font-semibold text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-[#888] dark:text-[#666]">
                      {tutor.totalSessions}+ {t("trending.sessions")}
                    </div>
                    <div className="text-sm font-semibold text-black dark:text-white">
                      ${tutor.hourlyRate}{t("trending.hourly")}
                    </div>
                  </div>
                  
                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {tutor.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] text-sm text-[#666] dark:text-[#a1a1aa] rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* CTA */}
                <div className="mt-6 pt-6 border-t border-[#e5e5e5] dark:border-[#1a1a1a]">
                  <span className="text-sm font-medium text-[#666] dark:text-[#a1a1aa] group-hover:text-black dark:group-hover:text-white transition-colors">
                    {t("trending.viewProfile")} →
                  </span>
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
                <div className="relative w-full h-64 sm:h-72 md:h-80 rounded-[20px] sm:rounded-[24px] overflow-hidden mb-4 sm:mb-6 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                  {tutor.image ? (
                    <Image src={tutor.image} alt={tutor.name || t("trending.tutorFallback")} fill className="object-cover" />
                  ) : (
                    <Users className="w-20 h-20 sm:w-24 sm:h-24 text-[#ccc] dark:text-[#404040]" />
                  )}
                </div>
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
              <div className="relative w-full h-56 sm:h-64 rounded-[20px] sm:rounded-[24px] overflow-hidden mb-4 sm:mb-6 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                {tutorData[0].image ? (
                  <Image src={tutorData[0].image} alt={tutorData[0].name || t("trending.tutorFallback")} fill className="object-cover" />
                ) : (
                  <Users className="w-20 h-20 sm:w-24 sm:h-24 text-[#ccc] dark:text-[#404040]" />
                )}
              </div>
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
                  <div className="relative w-full h-32 sm:h-40 rounded-[16px] sm:rounded-[20px] overflow-hidden mb-3 sm:mb-4 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                    {tutor.image ? (
                      <Image src={tutor.image} alt={tutor.name || t("trending.tutorFallback")} fill className="object-cover" />
                    ) : (
                      <Users className="w-12 h-12 sm:w-16 sm:h-16 text-[#ccc] dark:text-[#404040]" />
                    )}
                  </div>
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
              <div className="relative w-full h-48 sm:h-56 md:h-60 rounded-[20px] sm:rounded-[24px] overflow-hidden mb-4 sm:mb-5 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                {tutor.image ? (
                  <Image src={tutor.image} alt={tutor.name || t("trending.tutorFallback")} fill className="object-cover" />
                ) : (
                  <Users className="w-14 h-14 sm:w-16 sm:h-16 text-[#ccc] dark:text-[#404040]" />
                )}
              </div>
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

