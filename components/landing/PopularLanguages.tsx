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

export function PopularLanguages({ locale, languages }: PopularLanguagesProps) {
  const t = useTranslations("landing.popularLanguages");

  // Only show languages that have tutors
  const languagesWithTutors = languages.filter((lang) => lang.tutors > 0);

  // If no languages, don't render the section
  if (languagesWithTutors.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end mb-10">
        <h3 className="font-space-grotesk text-[32px] text-black dark:text-white">{t("title")}</h3>
        <Link href={`/${locale}/tutors`} className="underline font-medium text-black dark:text-white hover:opacity-80">
          {t("seeAll")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {languagesWithTutors.slice(0, 8).map((lang, index) => {
          const tag = getLanguageTag(index, lang.tutors);
          return (
            <Link
              key={lang.language}
              href={`/${locale}/tutors?language=${encodeURIComponent(lang.language)}`}
              className="group bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
              aria-label={`${lang.name} - ${lang.tutors.toLocaleString()} ${t("tutors")}`}
            >
              <div
                className="w-full h-60 rounded-xl overflow-hidden mb-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, ${lang.gradientColors.from}, ${lang.gradientColors.to})`,
                }}
                aria-hidden="true"
              >
                <span className="text-[80px]" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-base block mb-1 text-black dark:text-white">{lang.name}</span>
                  <span className="text-xs text-[#888] dark:text-[#a1a1aa]">
                    {lang.tutors.toLocaleString()} {t("tutors")}
                  </span>
                </div>
                <span className="font-space-grotesk font-bold text-sm text-black dark:text-white">
                  {t(tag)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

