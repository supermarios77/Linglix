"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LanguageWithCount } from "@/lib/db/languages";

interface PopularLanguagesProps {
  locale: string;
  languages: LanguageWithCount[];
}

/**
 * Determine tag based on tutor count and position
 */
function getLanguageTag(index: number, tutors: number): "popular" | "trending" {
  // Top 2 languages are "popular", others are "trending"
  if (index < 2) {
    return "popular";
  }
  return "trending";
}

/**
 * Get card configuration based on position and screen size
 * Creates visual hierarchy with different sizes and layouts
 */
function getCardConfig(index: number, totalCards: number) {
  // Single card - special hero treatment
  if (totalCards === 1) {
    return {
      gridClass: "col-span-1",
      padding: "p-6 sm:p-8 md:p-10 lg:p-12",
      imageHeight: "h-64 sm:h-72 md:h-80 lg:h-96",
      flagSize: "text-[100px] sm:text-[120px] md:text-[140px] lg:text-[160px]",
      nameSize: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
      nameWeight: "font-bold",
      tutorSize: "text-sm sm:text-base md:text-lg lg:text-xl",
      tagSize: "text-base sm:text-lg md:text-xl lg:text-2xl",
      layout: "vertical" as const,
    };
  }

  // Two cards - both get prominent treatment
  if (totalCards === 2) {
    if (index === 0) {
      return {
        gridClass: "col-span-1 sm:col-span-2 lg:col-span-1",
        padding: "p-5 sm:p-6 md:p-8 lg:p-10",
        imageHeight: "h-56 sm:h-64 md:h-72 lg:h-80",
        flagSize: "text-[90px] sm:text-[100px] md:text-[120px] lg:text-[140px]",
        nameSize: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
        nameWeight: "font-bold",
        tutorSize: "text-xs sm:text-sm md:text-base lg:text-lg",
        tagSize: "text-sm sm:text-base md:text-lg lg:text-xl",
        layout: "vertical" as const,
      };
    }
    return {
      gridClass: "col-span-1 sm:col-span-2 lg:col-span-1",
      padding: "p-5 sm:p-6 md:p-8 lg:p-10",
      imageHeight: "h-56 sm:h-64 md:h-72 lg:h-80",
      flagSize: "text-[90px] sm:text-[100px] md:text-[120px] lg:text-[140px]",
      nameSize: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
      nameWeight: "font-bold",
      tutorSize: "text-xs sm:text-sm md:text-base lg:text-lg",
      tagSize: "text-sm sm:text-base md:text-lg lg:text-xl",
      layout: "vertical" as const,
    };
  }

  // Three or more cards
  switch (index) {
    case 0:
      // First card - Hero style, spans 2 columns on tablet/desktop
      return {
        gridClass: "col-span-1 sm:col-span-2 lg:col-span-2",
        padding: "p-5 sm:p-6 md:p-8 lg:p-10",
        imageHeight: "h-56 sm:h-64 md:h-72 lg:h-80",
        flagSize: "text-[90px] sm:text-[100px] md:text-[120px] lg:text-[140px]",
        nameSize: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
        nameWeight: "font-bold",
        tutorSize: "text-xs sm:text-sm md:text-base lg:text-lg",
        tagSize: "text-sm sm:text-base md:text-lg lg:text-xl",
        layout: "vertical" as const,
      };
    case 1:
      // Second card - Medium, prominent
      return {
        gridClass: "col-span-1 sm:col-span-2 lg:col-span-1",
        padding: "p-4 sm:p-5 md:p-6 lg:p-8",
        imageHeight: "h-52 sm:h-60 md:h-64 lg:h-72",
        flagSize: "text-[80px] sm:text-[90px] md:text-[100px] lg:text-[120px]",
        nameSize: "text-base sm:text-lg md:text-xl lg:text-2xl",
        nameWeight: "font-bold",
        tutorSize: "text-xs sm:text-xs md:text-sm lg:text-base",
        tagSize: "text-xs sm:text-sm md:text-base lg:text-lg",
        layout: "vertical" as const,
      };
    case 2:
      // Third card - Horizontal layout on desktop, vertical on mobile
      return {
        gridClass: "col-span-1 sm:col-span-2 lg:col-span-1",
        padding: "p-4 sm:p-5 md:p-6",
        imageHeight: "h-48 sm:h-52 md:h-56 lg:h-full lg:min-h-[200px]",
        flagSize: "text-[70px] sm:text-[80px] md:text-[90px] lg:text-[100px]",
        nameSize: "text-base sm:text-lg md:text-xl",
        nameWeight: "font-semibold",
        tutorSize: "text-xs sm:text-sm",
        tagSize: "text-xs sm:text-sm md:text-base",
        layout: "horizontal" as const,
      };
    default:
      // Standard cards (4th, 5th, etc.) - Compact and consistent
      return {
        gridClass: "col-span-1 sm:col-span-2 lg:col-span-1",
        padding: "p-4 sm:p-5 md:p-6",
        imageHeight: "h-48 sm:h-52 md:h-56 lg:h-60",
        flagSize: "text-[70px] sm:text-[80px] md:text-[90px] lg:text-[100px]",
        nameSize: "text-sm sm:text-base md:text-lg",
        nameWeight: "font-semibold",
        tutorSize: "text-xs sm:text-xs md:text-sm",
        tagSize: "text-xs sm:text-sm md:text-base",
        layout: "vertical" as const,
      };
  }
}

/**
 * Single Language Display Component
 * Shows when there's only one language available
 * Matches the design system of the rest of the landing page
 */
function SingleLanguageDisplay({
  locale,
  language,
  t,
}: {
  locale: string;
  language: LanguageWithCount;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Badge - matching HeroSection style */}
        <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider mb-6 md:mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2 animate-pulse" />
          {t("onlyLanguage")}
        </div>

        {/* Flag icon in gradient container */}
        <div className="mb-6 md:mb-8">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto rounded-2xl overflow-hidden flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${language.gradientColors.from}, ${language.gradientColors.to})`,
            }}
            aria-hidden="true"
          >
            <span
              className="text-4xl sm:text-5xl md:text-6xl"
              role="img"
              aria-label={language.name}
            >
              {language.flag}
            </span>
          </div>
        </div>

        {/* Title - matching HeroSection style */}
        <h3 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] md:leading-[1.05] font-semibold tracking-[-0.03em] mb-4 md:mb-6 text-black dark:text-white max-w-3xl px-4">
          {t("onlyLanguageDescription", { language: language.name })}
        </h3>

        {/* Description */}
        <p className="text-base md:text-lg lg:text-xl leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-2xl mb-8 md:mb-10 px-4">
          {t("browseTutors", { count: language.tutors.toLocaleString(), language: language.name })}
        </p>

        {/* CTA Button - matching HeroSection style */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto px-4">
          <Link
            href={`/${locale}/tutors?language=${encodeURIComponent(language.language)}`}
            className="w-full sm:w-auto bg-[#111] dark:bg-white text-white dark:text-black px-8 md:px-10 py-4 md:py-[18px] rounded-full font-semibold text-base md:text-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-white dark:border-2 dark:border-white inline-flex items-center justify-center gap-2.5"
            aria-label={t("browseTutors", { count: language.tutors.toLocaleString(), language: language.name })}
          >
            {t("viewAllTutors")}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PopularLanguages({ locale, languages }: PopularLanguagesProps) {
  const t = useTranslations("landing.popularLanguages");

  // Only show languages that have tutors
  const languagesWithTutors = languages.filter((lang) => lang.tutors > 0);

  // If no languages, don't render the section
  if (languagesWithTutors.length === 0) {
    return null;
  }

  // If only one language, show special single language display
  if (languagesWithTutors.length === 1) {
    return <SingleLanguageDisplay locale={locale} language={languagesWithTutors[0]} t={t} />;
  }

  // Multiple languages - show grid with different card styles
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 md:mb-10 gap-3 sm:gap-4">
        <h3 className="font-space-grotesk text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-black dark:text-white leading-tight">
          {t("title")}
        </h3>
        <Link
          href={`/${locale}/tutors`}
          className="underline font-medium text-sm sm:text-base text-black dark:text-white hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          {t("seeAll")}
        </Link>
      </div>

      {/* Responsive grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 auto-rows-fr">
        {languagesWithTutors.slice(0, 8).map((lang, index) => {
          const tag = getLanguageTag(index, languagesWithTutors.length);
          const config = getCardConfig(index, languagesWithTutors.length);
          const isHorizontal = config.layout === "horizontal";

          return (
            <Link
              key={lang.language}
              href={`/${locale}/tutors?language=${encodeURIComponent(lang.language)}`}
              className={`group bg-white dark:bg-[#1a1a1a] rounded-[16px] sm:rounded-[20px] transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-8px] sm:hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] ${config.gridClass} ${config.padding} ${
                isHorizontal ? "flex flex-col lg:flex-row lg:gap-4" : "flex flex-col"
              }`}
              aria-label={`${lang.name} - ${lang.tutors.toLocaleString()} ${t("tutors")}`}
            >
              {/* Gradient image container */}
              <div
                className={`${config.imageHeight} ${
                  isHorizontal ? "w-full lg:w-1/2 lg:flex-shrink-0" : "w-full"
                } rounded-lg sm:rounded-xl overflow-hidden ${
                  isHorizontal ? "mb-3 sm:mb-4 lg:mb-0" : "mb-3 sm:mb-4 md:mb-5"
                } flex items-center justify-center flex-shrink-0`}
                style={{
                  background: `linear-gradient(to bottom right, ${lang.gradientColors.from}, ${lang.gradientColors.to})`,
                }}
                aria-hidden="true"
              >
                <span className={config.flagSize} role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
              </div>

              {/* Content section */}
              <div
                className={`flex ${
                  isHorizontal ? "flex-col lg:flex-col lg:justify-center lg:flex-1" : "flex-col"
                } ${isHorizontal ? "lg:pl-0" : ""} flex-1`}
              >
                <div className={`flex justify-between items-start ${isHorizontal ? "mb-1 sm:mb-2" : "mb-1 sm:mb-2"}`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <span
                      className={`${config.nameSize} ${config.nameWeight} block mb-0.5 sm:mb-1 md:mb-2 text-black dark:text-white truncate`}
                    >
                      {lang.name}
                    </span>
                    <span className={`${config.tutorSize} text-[#888] dark:text-[#a1a1aa] block truncate`}>
                      {lang.tutors.toLocaleString()} {t("tutors")}
                    </span>
                  </div>
                  <span
                    className={`font-space-grotesk font-bold ${config.tagSize} text-black dark:text-white flex-shrink-0 ${
                      isHorizontal ? "lg:mt-2" : ""
                    }`}
                  >
                    {t(tag)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
