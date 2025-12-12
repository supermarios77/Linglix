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

  // Single Tutor - Premium Exclusive Layout
  if (tutorCount === 1) {
    const tutor = tutorData[0];
    return (
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-8 sm:mb-10 md:mb-12">
          <div>
            <h3 className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-black dark:text-white mb-2">{t("trending.title")}</h3>
            <p className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa]">Meet our featured expert</p>
          </div>
          <Link 
            href={`/${locale}/tutors`} 
            className="text-sm sm:text-base font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors underline underline-offset-4"
          >
            {t("trending.seeAll")} →
          </Link>
        </div>
        
        <div className="relative">
          {/* Premium Card with Elevated Design */}
          <div className="group relative bg-white dark:bg-[#0a0a0a] rounded-[32px] sm:rounded-[40px] md:rounded-[48px] overflow-hidden border border-[#e5e5e5] dark:border-[#1a1a1a] shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-700 hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)] hover:-translate-y-1">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }} />
            </div>
            
            {/* Premium Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7928ca] via-[#ccf381] to-[#7928ca] opacity-60" />
            
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-0">
              {/* Left Side - Premium Content */}
              <div className="p-8 sm:p-10 md:p-12 lg:p-16 xl:p-20 flex flex-col justify-center relative z-10">
                {/* Exclusive Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ccf381]/10 to-[#7928ca]/10 dark:from-[#ccf381]/20 dark:to-[#7928ca]/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6 w-fit border border-[#ccf381]/20 dark:border-[#ccf381]/30 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#ccf381] animate-pulse" />
                  <span className="bg-gradient-to-r from-[#ccf381] to-[#7928ca] bg-clip-text text-transparent">{t("trending.featuredTutor")}</span>
                </div>
                
                {/* Name with Premium Typography */}
                <h2 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[64px] xl:text-[72px] leading-[1.05] font-black tracking-[-0.04em] mb-4 text-black dark:text-white">
                  {tutor.name}
                </h2>
                
                {/* Specialty with Elegant Styling */}
                <div className="mb-8">
                  <p className="text-lg sm:text-xl md:text-2xl font-medium text-[#666] dark:text-[#a1a1aa] mb-2">
                    {getPrimarySpecialty(tutor.specialties)}
                  </p>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-[#ccf381] to-transparent" />
                </div>
                
                {/* Premium Stats Grid */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8 pb-8 border-b border-[#e5e5e5] dark:border-[#1a1a1a]">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#ffb800] text-[#ffb800]" />
                      ))}
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#888] dark:text-[#666] mt-1">Rating</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-1">{tutor.totalSessions}+</span>
                    <span className="text-xs text-[#888] dark:text-[#666]">{t("trending.sessions")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-1">${tutor.hourlyRate}</span>
                    <span className="text-xs text-[#888] dark:text-[#666]">{t("trending.hourly")}</span>
                  </div>
                </div>
                
                {/* Specialties with Refined Pills */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
                  {tutor.specialties.slice(0, 3).map((specialty, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white transition-all hover:border-[#ccf381]/50 hover:bg-[#ccf381]/5 dark:hover:bg-[#ccf381]/10"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#ccf381]" />
                      <span>{specialty}</span>
                    </div>
                  ))}
                </div>
                
                {/* Premium CTA Button */}
                <Link href={`/${locale}/tutors/${tutor.slug}`}>
                  <button className="group relative w-full sm:w-auto bg-black dark:bg-[#ccf381] text-white dark:text-black px-10 py-4 rounded-full font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_32px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_16px_32px_rgba(204,243,129,0.3)] overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {t("trending.viewProfile")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7928ca] to-[#ccf381] opacity-0 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity" />
                  </button>
                </Link>
              </div>
              
              {/* Right Side - Premium Image Display */}
              <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-full min-h-[500px] bg-gradient-to-br from-[#fafafa] via-[#f5f5f5] to-[#f0f0f0] dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ccf381]/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#7928ca]/10 to-transparent rounded-full blur-3xl" />
                
                {tutor.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={tutor.image}
                      alt={tutor.name || t("trending.tutorFallback")}
                      fill
                      className="object-cover"
                      style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                    {/* Subtle overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="relative z-10">
                    <Users className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 text-[#ccf381] opacity-40" />
                    <div className="absolute inset-0 bg-[#ccf381]/10 blur-3xl rounded-full" aria-hidden="true" />
                  </div>
                )}
                
                {/* Premium Badge - Top Right */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center bg-gradient-to-br from-[#ccf381] via-[#a8e063] to-[#ccf381] rounded-2xl text-black font-black text-center shadow-[0_8px_24px_rgba(204,243,129,0.4)] border-2 border-white/20 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs md:text-sm leading-tight font-black">TOP</div>
                    <div className="text-[10px] sm:text-xs md:text-sm leading-tight font-black">TUTOR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

