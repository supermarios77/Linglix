"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface Language {
  name: string;
  flag: string;
  tutors: number;
  tag: "popular" | "trending";
  gradient: string;
  language: string;
}

interface PopularLanguagesProps {
  locale: string;
}

const languages: Language[] = [
  {
    name: "Spanish",
    flag: "🇪🇸",
    tutors: 2500,
    tag: "popular",
    gradient: "from-[#ff6b4a] to-[#ffa94d]",
    language: "spanish",
  },
  {
    name: "French",
    flag: "🇫🇷",
    tutors: 1800,
    tag: "popular",
    gradient: "from-[#4a90ff] to-[#4dc3ff]",
    language: "french",
  },
  {
    name: "Japanese",
    flag: "🇯🇵",
    tutors: 1200,
    tag: "trending",
    gradient: "from-[#ff4d8c] to-[#ff8f70]",
    language: "japanese",
  },
  {
    name: "German",
    flag: "🇩🇪",
    tutors: 1500,
    tag: "popular",
    gradient: "from-[#6b4aff] to-[#a94dff]",
    language: "german",
  },
];

export function PopularLanguages({ locale }: PopularLanguagesProps) {
  const t = useTranslations("landing.popularLanguages");

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end mb-10">
        <h3 className="font-space-grotesk text-[32px] text-black dark:text-white">{t("title")}</h3>
        <Link href={`/${locale}/tutors`} className="underline font-medium text-black dark:text-white hover:opacity-80">
          {t("seeAll")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {languages.map((lang) => (
          <Link
            key={lang.language}
            href={`/${locale}/tutors?language=${encodeURIComponent(lang.language)}`}
            className="group bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
            aria-label={`${lang.name} - ${lang.tutors.toLocaleString()}+ ${t("tutors")}`}
          >
            <div
              className={`w-full h-60 rounded-xl overflow-hidden mb-5 bg-gradient-to-br ${lang.gradient} flex items-center justify-center`}
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
                  {lang.tutors.toLocaleString()}+ {t("tutors")}
                </span>
              </div>
              <span className="font-space-grotesk font-bold text-sm text-black dark:text-white">
                {t(lang.tag)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

