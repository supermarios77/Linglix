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
 * Displays pricing information with interactive monthly hours selector
 * Production-ready with proper TypeScript types
 */
export function PricingSection({ locale }: PricingSectionProps) {
  const t = useTranslations("landing.pricing");
  
  const [monthlyHours, setMonthlyHours] = useState(4);
  const pricePerMinute = 0.5;
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

  const pricingTiers = [
    {
      name: t("tier.starter.name"),
      duration: "30 min",
      price: pricePerHalfHour,
      description: t("tier.starter.description"),
      features: [
        t("tier.starter.feature1"),
        t("tier.starter.feature2"),
        t("tier.starter.feature3"),
      ],
      popular: false,
    },
    {
      name: t("tier.professional.name"),
      duration: "1 hour",
      price: pricePerHour,
      description: t("tier.professional.description"),
      features: [
        t("tier.professional.feature1"),
        t("tier.professional.feature2"),
        t("tier.professional.feature3"),
        t("tier.professional.feature4"),
      ],
      popular: true,
    },
    {
      name: t("tier.premium.name"),
      duration: "1 hour",
      price: pricePerHour,
      description: t("tier.premium.description"),
      features: [
        t("tier.premium.feature1"),
        t("tier.premium.feature2"),
        t("tier.premium.feature3"),
        t("tier.premium.feature4"),
        t("tier.premium.feature5"),
      ],
      popular: false,
    },
  ];

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

      {/* Pricing Info Banner */}
      <div className="mb-12 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#ccf381]/10 to-[#ccf381]/5 dark:from-[#ccf381]/20 dark:to-[#ccf381]/10 border-2 border-[#ccf381]/30 dark:border-[#ccf381]/30 rounded-[24px] p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccf381] text-black rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              {t("ratePerMinute")}
            </div>
            <div className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-2">
              ${pricePerMinute.toFixed(2)}
              <span className="text-xl sm:text-2xl font-normal text-[#666] dark:text-[#a1a1aa] ml-2">
                /{t("minute")}
              </span>
            </div>
            <p className="text-sm text-[#666] dark:text-[#a1a1aa] font-light">
              {t("rateBreakdown")}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white/60 dark:bg-[#1a1a1a]/60 rounded-xl">
              <div className="text-2xl font-bold text-black dark:text-white mb-1">
                ${pricePerHalfHour}
              </div>
              <div className="text-xs text-[#666] dark:text-[#a1a1aa] font-light">
                {t("halfHour")}
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-[#1a1a1a]/60 rounded-xl">
              <div className="text-2xl font-bold text-black dark:text-white mb-1">
                ${pricePerHour}
              </div>
              <div className="text-xs text-[#666] dark:text-[#a1a1aa] font-light">
                {t("fullHour")}
              </div>
            </div>
          </div>

          {/* Monthly Hours Selector */}
          <div className="border-t border-[#ccf381]/20 dark:border-[#ccf381]/20 pt-6">
            <label className="block text-sm font-semibold text-black dark:text-white mb-4 text-center">
              {t("selectMonthlyHours")}
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center hover:border-[#ccf381] dark:hover:border-[#ccf381] hover:bg-[#ccf381]/10 dark:hover:bg-[#ccf381]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={monthlyHours <= 1}
              >
                <Minus className="w-4 h-4 text-black dark:text-white" />
              </button>
              
              <div className="flex flex-col items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={monthlyHours}
                  onChange={handleHoursChange}
                  className="w-20 text-center text-3xl font-bold text-black dark:text-white bg-transparent border-none focus:outline-none"
                />
                <span className="text-xs text-[#666] dark:text-[#a1a1aa] font-light">
                  {t("hours")} / {t("month")}
                </span>
              </div>
              
              <button
                onClick={handleIncrement}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center hover:border-[#ccf381] dark:hover:border-[#ccf381] hover:bg-[#ccf381]/10 dark:hover:bg-[#ccf381]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={monthlyHours >= 100}
              >
                <Plus className="w-4 h-4 text-black dark:text-white" />
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-[#666] dark:text-[#a1a1aa] mb-2 font-light">
                {t("estimatedMonthly")}
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
                ${calculateMonthlyPrice().toLocaleString()}
                <span className="text-lg font-normal text-[#666] dark:text-[#a1a1aa] ml-2">
                  /{t("month")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
        {pricingTiers.map((tier, index) => (
          <div
            key={index}
            className={`group relative bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 sm:p-10 border-2 transition-all duration-300 ${
              tier.popular
                ? "border-[#ccf381] dark:border-[#ccf381] shadow-[0_20px_40px_rgba(204,243,129,0.15)] scale-105"
                : "border-[#e5e5e5] dark:border-[#262626] hover:border-[#ccf381]/50 dark:hover:border-[#ccf381]/50 hover:shadow-lg"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#ccf381] text-black rounded-full text-xs font-bold uppercase tracking-wider">
                {t("popular")}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                {tier.name}
              </h3>
              <p className="text-sm text-[#666] dark:text-[#a1a1aa] mb-4 font-light">
                {tier.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-black dark:text-white">
                  ${tier.price}
                </span>
                <span className="text-lg text-[#666] dark:text-[#a1a1aa] font-light">
                  /{tier.duration}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#ccf381] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#666] dark:text-[#a1a1aa] font-light">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={`/${locale}/tutors`} className="block">
              <Button
                className={`w-full rounded-full py-6 font-semibold text-sm transition-all duration-300 ${
                  tier.popular
                    ? "bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1"
                    : "bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-[#ccf381] dark:hover:border-[#ccf381] hover:bg-[#ccf381]/5 dark:hover:bg-[#ccf381]/5"
                }`}
              >
                {t("cta")}
                {tier.popular && (
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-sm text-[#666] dark:text-[#a1a1aa] mb-4 font-light">
          {t("note")}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccf381]/10 dark:bg-[#ccf381]/20 border border-[#ccf381]/30 dark:border-[#ccf381]/30 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-[#ccf381]" />
          <span className="text-sm font-medium text-black dark:text-white">
            {t("guarantee")}
          </span>
        </div>
      </div>
    </section>
  );
}
