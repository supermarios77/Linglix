"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  locale: string;
  session: { user?: { id: string; name?: string | null; email?: string | null } } | null;
}

/**
 * Hero Section Component
 * 
 * Modern hero section matching the provided design
 * Production-ready with proper TypeScript types
 */
export function HeroSection({ locale, session }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <main className="relative max-w-[1400px] w-full mx-auto min-h-screen pt-36 pb-16 px-4 md:px-12 grid md:grid-cols-2 items-center gap-16">
      <div className="z-[2]">
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2" />
          {t("hero.badge")}
        </div>

        {/* Main Heading */}
        <h1 className="font-space-grotesk text-[76px] leading-[0.95] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
          {t("hero.title")} <br />
          <span className="font-normal bg-gradient-to-r from-accent to-brand-primary-light bg-clip-text text-transparent">
            {t("hero.titleHighlight")}
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[460px] mb-10">
          {t("hero.description")}
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 items-center">
          <Link
            href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`}
            className="bg-[#111] dark:bg-accent text-white dark:text-black px-9 py-[18px] rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-brand-primary-light inline-flex items-center gap-2.5"
          >
            {t("hero.ctaPrimary")}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href={`/${locale}/tutors`}
            className="px-9 py-[18px] rounded-full font-semibold text-base bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(26,26,26,0.5)] border border-[#e5e5e5] dark:border-[#262626] transition-all hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-black dark:hover:border-accent"
          >
            {t("hero.ctaSecondary")}
          </Link>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative h-[700px] w-full">
        <div className="group w-full h-full rounded-[40px] overflow-hidden relative -rotate-2 transition-transform duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:rotate-0">
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-brand-primary-light/20 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-xl font-semibold text-black dark:text-white">Language Learning</p>
              <p className="text-sm text-[#666] dark:text-[#a1a1aa] mt-2">Connect with native tutors</p>
            </div>
          </div>

          {/* Featured Badge */}
          <div className="absolute top-5 left-5 z-[4] w-[100px] h-[100px] flex items-center justify-center bg-accent rounded-full text-black font-extrabold font-space-grotesk text-center rotate-[15deg] shadow-[0_10px_20px_rgba(0,0,0,0.1)] text-sm leading-tight">
            TOP
            <br />
            RATED
          </div>
        </div>

        {/* Floating Glassmorphism Card 1 */}
        <div className="floating-card absolute bottom-[60px] left-[-40px] bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(26,26,26,0.7)] backdrop-blur-2xl p-4 rounded-[20px] border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex items-center gap-3 z-[3]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-brand-primary-light flex items-center justify-center">
            <span className="text-2xl">⭐</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">Native Speakers</h4>
            <p className="text-xs text-[#666] dark:text-[#a1a1aa]">Certified Tutors</p>
            <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★★</div>
          </div>
        </div>

        {/* Floating Glassmorphism Card 2 */}
        <div className="floating-card absolute top-20 right-[-20px] bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(26,26,26,0.7)] backdrop-blur-2xl p-4 rounded-[20px] border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex items-center gap-3 z-[3] animate-[float_6s_ease-in-out_1.5s_infinite]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary-light to-accent flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">1-on-1 Lessons</h4>
            <p className="text-xs text-[#666] dark:text-[#a1a1aa]">Personalized</p>
            <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★☆</div>
          </div>
        </div>
      </div>
    </main>
  );
}

