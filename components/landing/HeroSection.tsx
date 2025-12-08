"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  locale: string;
  session: { user?: { id: string; name?: string | null; email?: string | null } } | null;
}

/**
 * Hero Section Component
 * 
 * Enhanced hero section with improved layout and visual hierarchy
 * Production-ready with proper TypeScript types
 */
export function HeroSection({ locale, session }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <main className="relative max-w-[1400px] w-full mx-auto min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12">
      {/* Centered Content Layout */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-12 md:pb-16">
        {/* Badge */}
        <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] group hover:scale-105 transition-transform">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ccf381] rounded-full mr-2 sm:mr-2.5 animate-pulse" />
          <span className="mr-1.5 sm:mr-2 text-[10px] sm:text-xs">{t("hero.badge")}</span>
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ccf381] opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Main Heading */}
        <h1 className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[88px] xl:text-[100px] leading-[0.92] font-bold tracking-[-0.04em] mb-6 sm:mb-8 text-black dark:text-white px-2">
          {t("hero.title")}
          <br />
          <span className="relative inline-block mt-1 sm:mt-2">
            <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 -rotate-[-2deg] transform origin-center font-bold shadow-[0_4px_8px_rgba(0,0,0,0.1)] sm:shadow-[0_6px_12px_rgba(0,0,0,0.12)] relative z-10 text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px]">
              {t("hero.titleHighlight")}
            </span>
            <span className="absolute inset-0 bg-[#ffeb3b]/20 dark:bg-[#ccf381]/20 blur-xl -rotate-[-2deg] transform origin-center" aria-hidden="true" />
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl lg:text-[22px] leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[600px] mb-8 sm:mb-10 md:mb-12 font-light px-4">
          {t("hero.description")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center mb-12 sm:mb-14 md:mb-16 w-full sm:w-auto px-4">
          <Link href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`} className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-8 sm:px-10 py-5 sm:py-6 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:bg-[#222] dark:hover:bg-[#d4f89a] inline-flex items-center justify-center gap-2.5 sm:gap-3 group min-h-[48px] sm:min-h-[56px]"
            >
              <span>{t("hero.ctaPrimary")}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href={`/${locale}/tutors`} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 rounded-full font-semibold text-sm sm:text-base bg-white/60 dark:bg-[#1a1a1a]/60 backdrop-blur-sm border-2 border-[#e5e5e5] dark:border-[#262626] transition-all hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-[#111] dark:hover:border-[#ccf381] hover:shadow-lg min-h-[48px] sm:min-h-[56px]"
            >
              {t("hero.ctaSecondary")}
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 px-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs sm:text-sm font-medium text-black dark:text-white">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ccf381]" />
            <span>{t("hero.featureNative")}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs sm:text-sm font-medium text-black dark:text-white">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ccf381]" />
            <span>{t("hero.featureFlexible")}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs sm:text-sm font-medium text-black dark:text-white">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ccf381]" />
            <span>{t("hero.featureAffordable")}</span>
          </div>
        </div>
      </div>

    </main>
  );
}

