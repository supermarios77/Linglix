"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ArrowRight, Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";

interface PricingSectionProps {
  locale: string;
}

/**
 * Pricing Section Component
 * 
 * Clean, user-friendly pricing display with monthly calculator
 * Production-ready with proper TypeScript types
 */
export function PricingSection({ locale }: PricingSectionProps) {
  const t = useTranslations("landing.pricing");
  
  const [monthlyHours, setMonthlyHours] = useState(4);
  const pricePerHour = 30;
  const pricePerHalfHour = 15;

  const calculateMonthlyPrice = () => {
    return monthlyHours * pricePerHour;
  };

  const handleIncrement = () => {
    setMonthlyHours((prev) => Math.min(prev + 1, 100));
  };

  const handleDecrement = () => {
    setMonthlyHours((prev) => Math.max(prev - 1, 1));
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setMonthlyHours(Math.max(1, Math.min(100, value)));
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-[1200px] mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span>{t("badge")}</span>
          <Sparkles className="w-3 h-3 text-accent opacity-70" />
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.04em] text-black dark:text-white mb-4">
          {t("title")}
        </h2>
        <p className="text-lg sm:text-xl text-[#666] dark:text-[#a1a1aa] max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Pricing Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Session Pricing Cards */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-black dark:text-white mb-6">
            {t("sessionOptions")}
          </h3>
          
          {/* 30 Minute Session */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-[#e5e5e5] dark:border-[#262626] hover:border-accent dark:hover:border-accent transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-black dark:text-white mb-1">
                  ${pricePerHalfHour}
                </div>
                <div className="text-sm text-[#666] dark:text-[#a1a1aa]">
                  30 {t("minutes")}
                </div>
              </div>
              <div className="text-sm font-medium text-[#666] dark:text-[#a1a1aa]">
                {t("halfHour")}
              </div>
            </div>
          </div>

          {/* 1 Hour Session */}
          <div className="bg-accent/10 dark:bg-accent/20 rounded-2xl p-6 border-2 border-accent dark:border-accent">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-3xl font-bold text-black dark:text-white">
                    ${pricePerHour}
                  </div>
                  <span className="px-2 py-0.5 bg-accent text-black text-xs font-bold rounded-full">
                    {t("popular")}
                  </span>
                </div>
                <div className="text-sm text-[#666] dark:text-[#a1a1aa]">
                  60 {t("minutes")}
                </div>
              </div>
              <div className="text-sm font-medium text-[#666] dark:text-[#a1a1aa]">
                {t("fullHour")}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Calculator */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 border border-[#e5e5e5] dark:border-[#262626]">
          <h3 className="text-xl font-semibold text-black dark:text-white mb-6">
            {t("selectMonthlyHours")}
          </h3>
          
          <p className="text-sm text-[#666] dark:text-[#a1a1aa] mb-8">
            {t("selectDescription")}
          </p>

          {/* Hours Selector */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={handleDecrement}
              className="w-12 h-12 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center hover:border-accent dark:hover:border-accent hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={monthlyHours <= 1}
            >
              <Minus className="w-5 h-5 text-black dark:text-white" />
            </button>
            
            <div className="text-center">
              <input
                type="number"
                min="1"
                max="100"
                value={monthlyHours}
                onChange={handleHoursChange}
                className="w-24 text-center text-4xl font-bold text-black dark:text-white bg-transparent border-none focus:outline-none"
              />
              <div className="text-sm text-[#666] dark:text-[#a1a1aa] mt-1">
                {t("hours")} / {t("month")}
              </div>
            </div>
            
            <button
              onClick={handleIncrement}
              className="w-12 h-12 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center hover:border-accent dark:hover:border-accent hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={monthlyHours >= 100}
            >
              <Plus className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>

          {/* Monthly Total */}
          <div className="bg-accent/10 dark:bg-accent/20 rounded-xl p-6 border border-accent/30">
            <div className="text-sm text-[#666] dark:text-[#a1a1aa] mb-2">
              {t("estimatedMonthly")}
            </div>
            <div className="text-4xl font-bold text-black dark:text-white">
              ${calculateMonthlyPrice().toLocaleString()}
            </div>
            <div className="text-sm text-[#666] dark:text-[#a1a1aa] mt-1">
              / {t("month")}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href={`/${locale}/tutors`}>
          <Button
            className="bg-[#111] dark:bg-accent text-white dark:text-black px-10 py-6 rounded-full font-semibold text-lg hover:bg-[#222] dark:hover:bg-brand-primary-light hover:shadow-lg transition-all inline-flex items-center gap-3"
          >
            <span>{t("cta")}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Additional Info */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 dark:bg-accent/20 border border-accent/30 rounded-full mb-4">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-black dark:text-white">
            {t("guarantee")}
          </span>
        </div>
        <p className="text-sm text-[#666] dark:text-[#a1a1aa] max-w-xl mx-auto">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
