"use client";

import Link from "next/link";
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
      padding: "p-8 sm:p-10 md:p-12",
      imageHeight: "h-72 sm:h-80 md:h-96",
      flagSize: "text-[120px] sm:text-[140px] md:text-[160px]",
      nameSize: "text-2xl sm:text-3xl md:text-4xl",
      nameWeight: "font-bold",
      tutorSize: "text-base sm:text-lg md:text-xl",
      tagSize: "text-lg sm:text-xl md:text-2xl",
      layout: "vertical" as const,
    };
  }

  // Two cards - both get prominent treatment
  if (totalCards === 2) {
    if (index === 0) {
      return {
        gridClass: "col-span-1 sm:col-span-2 md:col-span-1",
        padding: "p-6 sm:p-8 md:p-10",
        imageHeight: "h-64 sm:h-72 md:h-80",
        flagSize: "text-[100px] sm:text-[120px] md:text-[140px]",
        nameSize: "text-xl sm:text-2xl md:text-3xl",
        nameWeight: "font-bold",
        tutorSize: "text-sm sm:text-base md:text-lg",
        tagSize: "text-base sm:text-lg md:text-xl",
        layout: "vertical" as const,
      };
    }
    return {
      gridClass: "col-span-1 sm:col-span-2 md:col-span-1",
      padding: "p-6 sm:p-8 md:p-10",
      imageHeight: "h-64 sm:h-72 md:h-80",
      flagSize: "text-[100px] sm:text-[120px] md:text-[140px]",
      nameSize: "text-xl sm:text-2xl md:text-3xl",
      nameWeight: "font-bold",
      tutorSize: "text-sm sm:text-base md:text-lg",
      tagSize: "text-base sm:text-lg md:text-xl",
      layout: "vertical" as const,
    };
  }

  // Three or more cards
  switch (index) {
    case 0:
      // First card - Hero style, spans 2 columns on tablet/desktop
      return {
        gridClass: "col-span-1 sm:col-span-2 md:col-span-2",
        padding: "p-6 sm:p-8 md:p-10",
        imageHeight: "h-64 sm:h-72 md:h-80",
        flagSize: "text-[100px] sm:text-[120px] md:text-[140px]",
        nameSize: "text-xl sm:text-2xl md:text-3xl",
        nameWeight: "font-bold",
        tutorSize: "text-sm sm:text-base md:text-lg",
        tagSize: "text-base sm:text-lg md:text-xl",
        layout: "vertical" as const,
      };
    case 1:
      // Second card - Medium, prominent
      return {
        gridClass: "col-span-1 sm:col-span-2 md:col-span-1",
        padding: "p-5 sm:p-6 md:p-8",
        imageHeight: "h-56 sm:h-64 md:h-72",
        flagSize: "text-[90px] sm:text-[100px] md:text-[120px]",
        nameSize: "text-lg sm:text-xl md:text-2xl",
        nameWeight: "font-bold",
        tutorSize: "text-xs sm:text-sm md:text-base",
        tagSize: "text-sm sm:text-base md:text-lg",
        layout: "vertical" as const,
      };
    case 2:
      // Third card - Horizontal layout on desktop, vertical on mobile
      return {
        gridClass: "col-span-1 sm:col-span-2 md:col-span-1",
        padding: "p-5 sm:p-6 md:p-6",
        imageHeight: "h-48 sm:h-56 md:h-full",
        flagSize: "text-[80px] sm:text-[90px] md:text-[100px]",
        nameSize: "text-base sm:text-lg md:text-xl",
        nameWeight: "font-semibold",
        tutorSize: "text-xs sm:text-sm",
        tagSize: "text-sm sm:text-base",
        layout: "horizontal" as const,
      };
    default:
      // Standard cards (4th, 5th, etc.) - Compact and consistent
      return {
        gridClass: "col-span-1 sm:col-span-2 md:col-span-1",
        padding: "p-4 sm:p-5 md:p-6",
        imageHeight: "h-48 sm:h-52 md:h-60",
        flagSize: "text-[70px] sm:text-[80px] md:text-[90px]",
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
    <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-12">
        <h3 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl text-black dark:text-white mb-4">
          {t("onlyLanguage")}
        </h3>
        <p className="text-base sm:text-lg md:text-xl text-[#666] dark:text-[#a1a1aa] max-w-2xl mx-auto">
          {t("onlyLanguageDescription", { language: language.name })}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Link
          href={`/${locale}/tutors?language=${encodeURIComponent(language.language)}`}
          className="group block bg-white dark:bg-[#1a1a1a] rounded-[24px] p-8 sm:p-10 transition-all duration-300 cursor-pointer border border-[#eee] dark:border-[#333] hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
          aria-label={`${language.name} - ${language.tutors.toLocaleString()} ${t("tutors")}`}
        >
          <div
            className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden mb-6 flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom right, ${language.gradientColors.from}, ${language.gradientColors.to})`,
            }}
            aria-hidden="true"
          >
            <span className="text-[140px] sm:text-[160px] md:text-[180px]" role="img" aria-label={language.name}>
              {language.flag}
            </span>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-3 text-black dark:text-white">
              {language.name}
            </h4>
            <p className="text-lg sm:text-xl md:text-2xl text-[#666] dark:text-[#a1a1aa] mb-6">
              {t("browseTutors", { count: language.tutors.toLocaleString(), language: language.name })}
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity">
              {t("viewAllTutors")}
              <span className="text-lg">→</span>
            </div>
          </div>
        </Link>
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
    <section className="py-16 sm:py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
        <h3 className="font-space-grotesk text-2xl sm:text-3xl md:text-[32px] text-black dark:text-white">
          {t("title")}
        </h3>
        <Link
          href={`/${locale}/tutors`}
          className="underline font-medium text-black dark:text-white hover:opacity-80 transition-opacity"
        >
          {t("seeAll")}
        </Link>
      </div>

      {/* Responsive grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
        {languagesWithTutors.slice(0, 8).map((lang, index) => {
          const tag = getLanguageTag(index, languagesWithTutors.length);
          const config = getCardConfig(index, languagesWithTutors.length);
          const isHorizontal = config.layout === "horizontal";

          return (
            <Link
              key={lang.language}
              href={`/${locale}/tutors?language=${encodeURIComponent(lang.language)}`}
              className={`group bg-white dark:bg-[#1a1a1a] rounded-[20px] transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] ${config.gridClass} ${config.padding} ${
                isHorizontal ? "flex flex-col md:flex-row md:gap-4" : "flex flex-col"
              }`}
              aria-label={`${lang.name} - ${lang.tutors.toLocaleString()} ${t("tutors")}`}
            >
              {/* Gradient image container */}
              <div
                className={`${config.imageHeight} ${
                  isHorizontal ? "w-full md:w-1/2 md:flex-shrink-0" : "w-full"
                } rounded-xl overflow-hidden ${
                  isHorizontal ? "mb-4 md:mb-0" : "mb-4 sm:mb-5"
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
                  isHorizontal ? "flex-col md:flex-col md:justify-center md:flex-1" : "flex-col"
                } ${isHorizontal ? "md:pl-0" : ""} flex-1`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <span
                      className={`${config.nameSize} ${config.nameWeight} block mb-1 sm:mb-2 text-black dark:text-white`}
                    >
                      {lang.name}
                    </span>
                    <span className={`${config.tutorSize} text-[#888] dark:text-[#a1a1aa]`}>
                      {lang.tutors.toLocaleString()} {t("tutors")}
                    </span>
                  </div>
                  <span
                    className={`font-space-grotesk font-bold ${config.tagSize} text-black dark:text-white ${
                      isHorizontal ? "md:mt-2" : ""
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
