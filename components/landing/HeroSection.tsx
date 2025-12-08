"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  locale: string;
  session: any;
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
    <main className="relative max-w-[1400px] w-full mx-auto min-h-screen pt-32 pb-20 px-4 md:px-12">
      {/* Centered Content Layout */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto pt-8 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] group hover:scale-105 transition-transform">
          <span className="w-2 h-2 bg-[#ccf381] rounded-full mr-2.5 animate-pulse" />
          <span className="mr-2">New Platform Launch</span>
          <Sparkles className="w-3 h-3 text-[#ccf381] opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Main Heading */}
        <h1 className="text-[64px] md:text-[88px] lg:text-[100px] leading-[0.92] font-bold tracking-[-0.04em] mb-8 text-black dark:text-white">
          Learn Languages
          <br />
          <span className="relative inline-block mt-2">
            <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-5 py-2 -rotate-[-2deg] transform origin-center font-bold shadow-[0_6px_12px_rgba(0,0,0,0.12)] relative z-10">
              with Native Tutors
            </span>
            <span className="absolute inset-0 bg-[#ffeb3b]/20 dark:bg-[#ccf381]/20 blur-xl -rotate-[-2deg] transform origin-center" aria-hidden="true" />
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl md:text-[22px] leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[600px] mb-12 font-light">
          Connect with expert tutors for personalized, one-on-one language learning experiences. Flexible scheduling, affordable pricing, and real results.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
          <Link href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`}>
            <Button
              size="lg"
              className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-10 py-6 rounded-full font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:bg-[#222] dark:hover:bg-[#d4f89a] inline-flex items-center gap-3 group"
            >
              <span>{t("hero.ctaPrimary")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href={`/${locale}/tutors`}>
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-6 rounded-full font-semibold text-base bg-white/60 dark:bg-[#1a1a1a]/60 backdrop-blur-sm border-2 border-[#e5e5e5] dark:border-[#262626] transition-all hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-[#111] dark:hover:border-[#ccf381] hover:shadow-lg"
            >
              {t("hero.ctaSecondary")}
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white">
            <CheckCircle2 className="w-4 h-4 text-[#ccf381]" />
            <span>Native Speakers</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white">
            <CheckCircle2 className="w-4 h-4 text-[#ccf381]" />
            <span>Flexible Schedule</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white">
            <CheckCircle2 className="w-4 h-4 text-[#ccf381]" />
            <span>Affordable Pricing</span>
          </div>
        </div>
      </div>

    </main>
  );
}

