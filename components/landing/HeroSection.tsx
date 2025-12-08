"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  locale: string;
  session: any;
}

/**
 * Hero Section Component
 * 
 * Main hero section with CTA buttons and floating cards
 * Production-ready with proper TypeScript types
 */
export function HeroSection({ locale, session }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <main className="relative max-w-[1400px] w-full mx-auto min-h-screen pt-36 pb-16 px-4 md:px-12 grid md:grid-cols-2 items-center gap-16">
      <div className="z-[2]">
        <div className="inline-flex items-center px-3 py-1.5 bg-white/80 dark:bg-[#121212] backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <span className="w-2 h-2 bg-[#ccf381] rounded-full mr-2" />
          New Platform Launch
        </div>
        <h1 className="text-[56px] md:text-[76px] leading-[0.95] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
          Learn Languages with <br />
          <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 py-1 -rotate-[-2deg] transform origin-center font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
            Native Tutors.
          </span>
        </h1>
        <p className="text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[460px] mb-10">
          Connect with expert tutors for personalized, one-on-one language learning experiences. Flexible scheduling, affordable pricing, and real results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Link href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`}>
            <Button
              size="lg"
              className="bg-[#111] dark:bg-white text-white dark:text-black px-9 py-[18px] rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-[#eee] inline-flex items-center gap-2.5"
            >
              {t("hero.ctaPrimary")}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/${locale}/tutors`}>
            <Button
              size="lg"
              variant="outline"
              className="px-9 py-[18px] rounded-full font-semibold text-base bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] border border-[#e5e5e5] dark:border-[#333] transition-all hover:bg-white dark:hover:bg-black hover:border-black dark:hover:border-white"
            >
              {t("hero.ctaSecondary")}
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative h-[500px] md:h-[700px] w-full">
        <div className="group w-full h-full rounded-[32px] overflow-hidden relative -rotate-2 transition-all duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:rotate-0 hover:-translate-y-0.5">
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#121212] dark:from-[#1a1a1a] dark:to-[#0a0a0a] border border-[#262626] flex items-center justify-center">
            <Users className="w-32 h-32 md:w-48 md:h-48 text-[#ccf381] opacity-60" />
          </div>
          {/* Badge Element */}
          <div className="absolute top-5 left-5 z-[4] w-[100px] h-[100px] flex items-center justify-center bg-[#ccf381] dark:bg-[#ccf381] rounded-full text-black font-extrabold text-center rotate-[15deg] shadow-[0_10px_20px_rgba(0,0,0,0.2)] text-sm leading-tight border border-[#262626]">
            BEST
            <br />
            TUTORS
          </div>
        </div>
        {/* Floating Glassmorphism Card 1 */}
        <div className="floating-card absolute bottom-[60px] left-[-40px] bg-white/70 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[3] transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7928ca] to-[#ff0080] flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">Native Speakers</h4>
            <p className="text-xs text-[#666] dark:text-[#a1a1aa]">Certified Tutors</p>
            <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★★</div>
          </div>
        </div>
        {/* Floating Glassmorphism Card 2 */}
        <div className="floating-card absolute top-20 right-[-20px] bg-white/70 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[3] animate-[float_6s_ease-in-out_1.5s_infinite] transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3b82f6] flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">Flexible Schedule</h4>
            <p className="text-xs text-[#666] dark:text-[#a1a1aa]">24/7 Available</p>
            <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★☆</div>
          </div>
        </div>
      </div>
    </main>
  );
}

