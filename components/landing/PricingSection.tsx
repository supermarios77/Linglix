"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ArrowRight, Plus, Minus, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

interface PricingSectionProps {
  locale: string;
}

/**
 * Pricing Section Component
 * 
 * Displays pricing information with interactive monthly hours selector
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
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <span className="w-2 h-2 bg-[#ccf381] rounded-full animate-pulse" />
          <span>{t("badge")}</span>
          <Sparkles className="w-3 h-3 text-[#ccf381] opacity-70" />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-black dark:text-white mb-4">
          {t("title")}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-[#666] dark:text-[#a1a1aa] max-w-2xl mx-auto font-light">
          {t("subtitle")}
        </p>
      </div>

      {/* Main Pricing Card */}
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-white dark:bg-[#1a1a1a] rounded-[40px] p-8 sm:p-10 md:p-14 border-2 border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ccf381]/5 via-transparent to-[#ccf381]/5 dark:from-[#ccf381]/10 dark:via-transparent dark:to-[#ccf381]/10" />
          
          <div className="relative z-10">
            {/* Session Options */}
            <div className="mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6 text-center">
                {t("sessionOptions")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 30 Minute Session */}
                <div className="group relative bg-gradient-to-br from-white to-[#fafafa] dark:from-[#0a0a0a] dark:to-[#1a1a1a] rounded-[28px] p-8 border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-[#ccf381] dark:hover:border-[#ccf381] transition-all duration-300 hover:shadow-lg">
                  <div className="text-center">
                    <div className="text-5xl sm:text-6xl font-bold text-black dark:text-white mb-3">
                      ${pricePerHalfHour}
                    </div>
                    <div className="text-lg sm:text-xl text-[#666] dark:text-[#a1a1aa] font-medium mb-2">
                      {t("halfHour")}
                    </div>
                    <div className="text-sm text-[#888] dark:text-[#666] font-light">
                      30 {t("minutes")}
                    </div>
                  </div>
                </div>

                {/* 1 Hour Session - Featured */}
                <div className="group relative bg-gradient-to-br from-[#ccf381]/20 to-[#ccf381]/10 dark:from-[#ccf381]/30 dark:to-[#ccf381]/15 rounded-[28px] p-8 border-2 border-[#ccf381] dark:border-[#ccf381] hover:shadow-lg transition-all duration-300">
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-[#ccf381] text-black rounded-full text-xs font-bold uppercase tracking-wider">
                    {t("popular")}
                  </div>
                  <div className="text-center">
                    <div className="text-5xl sm:text-6xl font-bold text-black dark:text-white mb-3">
                      ${pricePerHour}
                    </div>
                    <div className="text-lg sm:text-xl text-[#666] dark:text-[#a1a1aa] font-medium mb-2">
                      {t("fullHour")}
                    </div>
                    <div className="text-sm text-[#888] dark:text-[#666] font-light">
                      60 {t("minutes")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Hours Selector */}
            <div className="border-t border-[#e5e5e5] dark:border-[#262626] pt-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#ccf381]" />
                  <label className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                    {t("selectMonthlyHours")}
                  </label>
                </div>
                <p className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa] font-light mb-8 max-w-md mx-auto">
                  {t("selectDescription")}
                </p>
                
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-10">
                  <button
                    onClick={handleDecrement}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center hover:border-[#ccf381] dark:hover:border-[#ccf381] hover:bg-[#ccf381]/10 dark:hover:bg-[#ccf381]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    disabled={monthlyHours <= 1}
                  >
                    <Minus className="w-6 h-6 text-black dark:text-white" />
                  </button>
                  
                  <div className="flex flex-col items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={monthlyHours}
                      onChange={handleHoursChange}
                      className="w-32 sm:w-40 text-center text-5xl sm:text-6xl font-bold text-black dark:text-white bg-transparent border-none focus:outline-none focus:ring-0"
                    />
                    <span className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] font-light">
                      {t("hours")} / {t("month")}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleIncrement}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center hover:border-[#ccf381] dark:hover:border-[#ccf381] hover:bg-[#ccf381]/10 dark:hover:bg-[#ccf381]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    disabled={monthlyHours >= 100}
                  >
                    <Plus className="w-6 h-6 text-black dark:text-white" />
                  </button>
                </div>
                
                {/* Monthly Cost Display */}
                <div className="bg-gradient-to-br from-[#ccf381]/15 to-[#ccf381]/5 dark:from-[#ccf381]/25 dark:to-[#ccf381]/10 rounded-[32px] p-8 sm:p-10 border-2 border-[#ccf381]/40 dark:border-[#ccf381]/40">
                  <div className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa] mb-4 font-light uppercase tracking-wide">
                    {t("estimatedMonthly")}
                  </div>
                  <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-black dark:text-white mb-2">
                    ${calculateMonthlyPrice().toLocaleString()}
                  </div>
                  <div className="text-lg sm:text-xl text-[#666] dark:text-[#a1a1aa] font-light">
                    / {t("month")}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <Link href={`/${locale}/tutors`}>
                <Button
                  className="w-full sm:w-auto bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-12 sm:px-14 py-7 sm:py-8 rounded-full font-semibold text-lg sm:text-xl transition-all duration-300 hover:bg-[#222] dark:hover:bg-[#d4f89a] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 inline-flex items-center justify-center gap-3"
                >
                  <span>{t("cta")}</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccf381]/10 dark:bg-[#ccf381]/20 border border-[#ccf381]/30 dark:border-[#ccf381]/30 rounded-full mb-4">
          <CheckCircle2 className="w-4 h-4 text-[#ccf381]" />
          <span className="text-sm font-medium text-black dark:text-white">
            {t("guarantee")}
          </span>
        </div>
        <p className="text-sm text-[#666] dark:text-[#a1a1aa] font-light max-w-2xl mx-auto">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
