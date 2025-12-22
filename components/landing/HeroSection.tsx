"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  locale: string;
  session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null;
}

export function HeroSection({ locale, session }: HeroSectionProps) {
  const t = useTranslations("landing.hero");

  return (
    <main className="relative max-w-[1400px] w-full mx-auto pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-8 lg:px-12">
      <div className="flex flex-col items-center text-center mb-16 md:mb-24 z-[2] relative">
        <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider mb-6 md:mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2 animate-pulse" />
          {t("badge")}
        </div>

        <h1 className="font-space-grotesk text-4xl sm:text-5xl md:text-6xl lg:text-[76px] leading-[1.1] md:leading-[1.05] font-semibold tracking-[-0.03em] mb-6 md:mb-8 text-black dark:text-white max-w-5xl px-4">
          <span className="block">
            {t("title")}{" "}
            <span className="inline-block font-bold bg-[#FFE600] text-black px-3 md:px-4 py-1 md:py-2">
              {t("titleHighlight")}
            </span>
          </span>
          <span className="block mt-2">{t("subtitle")}</span>
        </h1>

        <p className="text-base md:text-lg lg:text-xl leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[680px] mb-10 md:mb-12 px-4">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto px-4">
          <Link
            href={session ? `/${locale}/dashboard` : `/${locale}/tutors`}
            className="w-full sm:w-auto bg-[#111] dark:bg-white text-white dark:text-black px-8 md:px-10 py-4 md:py-[18px] rounded-full font-semibold text-base md:text-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-white dark:border-2 dark:border-white inline-flex items-center justify-center gap-2.5"
            aria-label={t("ctaPrimary")}
          >
            {t("ctaPrimary")}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          <Link
            href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`}
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-[18px] rounded-full font-semibold text-base md:text-lg bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(26,26,26,0.5)] border border-[#e5e5e5] dark:border-[#262626] transition-all hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-black dark:hover:border-white inline-flex items-center justify-center"
            aria-label={t("ctaSecondary")}
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>
    </main>
  );
}
