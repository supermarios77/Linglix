"use client";

import Link from "next/link";
import { Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface Tutor {
  name: string;
  language: string;
  rating: number;
}

interface FeaturedTutorsProps {
  locale: string;
}

/**
 * Featured Tutors Section Component
 * 
 * Displays featured tutors in a grid layout
 * Production-ready with proper TypeScript types
 */
export function FeaturedTutors({ locale }: FeaturedTutorsProps) {
  const t = useTranslations("landing");

  const tutors: Tutor[] = [
    { name: "Maria Garcia", language: "Spanish Tutor", rating: 4.9 },
    { name: "Jean-Pierre", language: "French Tutor", rating: 5.0 },
    { name: "Hiroshi Tanaka", language: "Japanese Tutor", rating: 4.8 },
    { name: "Emma Schmidt", language: "German Tutor", rating: 4.9 },
  ];

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
        {tutors.map((tutor, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
          >
            <div className="w-full h-60 rounded-[24px] overflow-hidden mb-5 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">{tutor.name}</span>
                <span className="text-xs text-[#888] dark:text-[#a1a1aa]">{tutor.language}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">{tutor.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

