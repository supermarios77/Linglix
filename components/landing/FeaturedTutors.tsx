import Link from "next/link";
import Image from "next/image";
import { Star, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface FeaturedTutorsProps {
  locale: string;
}

interface TutorData {
  id: string;
  name: string | null;
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

  // Fetch active tutors with their profiles
  const tutors = await prisma.user.findMany({
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

  // Transform to simpler format
  const tutorData: TutorData[] = tutors
    .filter((tutor) => tutor.tutorProfile)
    .map((tutor) => ({
      id: tutor.id,
      name: tutor.name || "Tutor",
      image: tutor.image,
      specialties: tutor.tutorProfile!.specialties,
      rating: tutor.tutorProfile!.rating,
      hourlyRate: tutor.tutorProfile!.hourlyRate,
      totalSessions: tutor.tutorProfile!.totalSessions,
    }));

  const tutorCount = tutorData.length;

  // Get primary specialty or default
  const getPrimarySpecialty = (specialties: string[]) => {
    if (specialties.length > 0) {
      return specialties[0];
    }
    return "Language Tutor";
  };

  // Single Tutor - Hero Style Layout
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
        <div className="relative">
          {/* Large Hero Card */}
          <div className="group relative bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-[40px] overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626] shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_60px_120px_rgba(0,0,0,0.15)] hover:-translate-y-2">
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7928ca]/5 via-transparent to-[#ccf381]/5 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
            
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side - Content */}
              <div className="p-12 md:p-16 flex flex-col justify-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccf381]/10 dark:bg-[#ccf381]/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 w-fit">
                  <Sparkles className="w-3 h-3 text-[#ccf381]" />
                  <span>Featured Tutor</span>
                </div>
                
                <h2 className="text-[48px] md:text-[64px] leading-[0.95] font-bold tracking-[-0.03em] mb-4 text-black dark:text-white">
                  {tutor.name}
                </h2>
                
                <p className="text-xl text-[#666] dark:text-[#a1a1aa] mb-6">
                  {getPrimarySpecialty(tutor.specialties)}
                </p>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="flex text-[#ffb800]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#ffb800] text-[#ffb800]" />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-black dark:text-white ml-2">{tutor.rating.toFixed(1)}</span>
                  </div>
                  <div className="h-8 w-px bg-[#e5e5e5] dark:bg-[#262626]" />
                  <div>
                    <div className="text-sm text-[#888] dark:text-[#a1a1aa]">Sessions</div>
                    <div className="text-xl font-bold text-black dark:text-white">{tutor.totalSessions}+</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#888] dark:text-[#a1a1aa]">Rate</div>
                    <div className="text-xl font-bold text-black dark:text-white">${tutor.hourlyRate}/hr</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  {tutor.specialties.slice(0, 3).map((specialty, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#ccf381]" />
                      <span>{specialty}</span>
                    </div>
                  ))}
                </div>
                
                <Link href={`/${locale}/tutors/${tutor.id}`}>
                  <button className="w-full md:w-auto bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-10 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:bg-[#222] dark:hover:bg-[#d4f89a]">
                    View Profile
                  </button>
                </Link>
              </div>
              
              {/* Right Side - Image/Visual */}
              <div className="relative h-[400px] md:h-auto bg-gradient-to-br from-[#1a1a1a] to-[#121212] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center overflow-hidden">
                {tutor.image ? (
                  <Image
                    src={tutor.image}
                    alt={tutor.name || "Tutor"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="relative">
                    <Users className="w-48 h-48 text-[#ccf381] opacity-60" />
                    <div className="absolute inset-0 bg-[#ccf381]/20 blur-3xl rounded-full" aria-hidden="true" />
                  </div>
                )}
                {/* Badge */}
                <div className="absolute top-6 right-6 w-[120px] h-[120px] flex items-center justify-center bg-gradient-to-br from-[#ccf381] to-[#a8e063] rounded-full text-black font-black text-center rotate-[12deg] shadow-[0_12px_24px_rgba(0,0,0,0.3)] text-sm leading-tight border-2 border-black/10">
                  <div>
                    <div className="text-[12px]">TOP</div>
                    <div className="text-[12px]">TUTOR</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tutorData.map((tutor) => (
            <Link key={tutor.id} href={`/${locale}/tutors/${tutor.id}`}>
              <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-2 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                <div className="relative w-full h-80 rounded-[24px] overflow-hidden mb-6 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                  {tutor.image ? (
                    <Image src={tutor.image} alt={tutor.name || "Tutor"} fill className="object-cover" />
                  ) : (
                    <Users className="w-24 h-24 text-[#ccc] dark:text-[#404040]" />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-2xl font-bold mb-1 text-black dark:text-white">{tutor.name}</h4>
                    <p className="text-base text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-[#ffb800] text-[#ffb800]" />
                      <span className="text-lg font-bold text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-base font-semibold text-black dark:text-white">${tutor.hourlyRate}/hr</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card */}
          <Link href={`/${locale}/tutors/${tutorData[0].id}`} className="md:col-span-2">
            <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-2 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] h-full">
              <div className="relative w-full h-64 rounded-[24px] overflow-hidden mb-6 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                {tutorData[0].image ? (
                  <Image src={tutorData[0].image} alt={tutorData[0].name || "Tutor"} fill className="object-cover" />
                ) : (
                  <Users className="w-24 h-24 text-[#ccc] dark:text-[#404040]" />
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-2xl font-bold mb-1 text-black dark:text-white">{tutorData[0].name}</h4>
                  <p className="text-base text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutorData[0].specialties)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-[#ffb800] text-[#ffb800]" />
                    <span className="text-lg font-bold text-black dark:text-white">{tutorData[0].rating.toFixed(1)}</span>
                  </div>
                  <span className="text-base font-semibold text-black dark:text-white">${tutorData[0].hourlyRate}/hr</span>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Two Small Cards */}
          <div className="space-y-6">
            {tutorData.slice(1, 3).map((tutor) => (
              <Link key={tutor.id} href={`/${locale}/tutors/${tutor.id}`}>
                <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-1 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <div className="relative w-full h-40 rounded-[20px] overflow-hidden mb-4 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                    {tutor.image ? (
                      <Image src={tutor.image} alt={tutor.name || "Tutor"} fill className="object-cover" />
                    ) : (
                      <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-lg font-bold mb-0.5 text-black dark:text-white">{tutor.name}</h4>
                      <p className="text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                        <span className="text-sm font-bold text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm font-semibold text-black dark:text-white">${tutor.hourlyRate}/hr</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {tutorData.map((tutor) => (
          <Link key={tutor.id} href={`/${locale}/tutors/${tutor.id}`}>
            <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <div className="relative w-full h-60 rounded-[24px] overflow-hidden mb-5 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                {tutor.image ? (
                  <Image src={tutor.image} alt={tutor.name || "Tutor"} fill className="object-cover" />
                ) : (
                  <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
                )}
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-base block mb-1 text-black dark:text-white">{tutor.name}</span>
                  <span className="text-xs text-[#888] dark:text-[#a1a1aa]">{getPrimarySpecialty(tutor.specialties)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                  <span className="font-bold text-sm text-black dark:text-white">{tutor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

