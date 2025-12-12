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
        <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-card/90 dark:bg-card/90 backdrop-blur-md border border-border rounded-full text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-md group hover:scale-105 transition-transform">
          <span className="w-2 h-2 bg-brand-primary rounded-full mr-2 animate-pulse" />
          <span className="mr-2 text-xs">{t("hero.badge")}</span>
          <Sparkles className="w-3 h-3 text-brand-primary opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight font-bold tracking-tight mb-6 sm:mb-8 text-foreground px-2">
          {t("hero.title")}
          <br />
          <span className="relative inline-block mt-2">
            <span className="inline-block bg-brand-primary text-black px-4 py-2 -rotate-[-2deg] transform origin-center font-bold shadow-lg relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
              {t("hero.titleHighlight")}
            </span>
            <span className="absolute inset-0 bg-brand-primary/20 blur-xl -rotate-[-2deg] transform origin-center" aria-hidden="true" />
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mb-8 sm:mb-10 md:mb-12 font-light px-4">
          {t("hero.description")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12 sm:mb-14 md:mb-16 w-full sm:w-auto px-4">
          <Link href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`} className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary text-primary-foreground px-8 sm:px-10 py-6 rounded-full font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-primary/90 inline-flex items-center justify-center gap-3 group min-h-[56px]"
            >
              <span>{t("hero.ctaPrimary")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href={`/${locale}/tutors`} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 sm:px-10 py-6 rounded-full font-semibold text-base bg-card/60 backdrop-blur-sm border-2 border-border transition-all hover:bg-card hover:border-primary hover:shadow-lg min-h-[56px]"
            >
              {t("hero.ctaSecondary")}
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 sm:mb-10 md:mb-12 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full text-sm font-medium text-foreground">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>{t("hero.featureNative")}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full text-sm font-medium text-foreground">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>{t("hero.featureFlexible")}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full text-sm font-medium text-foreground">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>{t("hero.featureAffordable")}</span>
          </div>
        </div>
      </div>

    </main>
  );
}

