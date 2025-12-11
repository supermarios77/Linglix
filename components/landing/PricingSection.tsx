import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface PricingSectionProps {
  locale: string;
}

/**
 * Pricing Section Component
 * 
 * Displays pricing information with average rates and pricing tiers
 * Production-ready with proper TypeScript types
 */
export async function PricingSection({ locale }: PricingSectionProps) {
  const t = await getTranslations("landing.pricing");

  // Fetch average hourly rate from approved tutors
  let averageRate = 25;
  let minRate = 15;
  let maxRate = 50;
  
  try {
    const rates = await prisma.tutorProfile.findMany({
      where: {
        isActive: true,
        approvalStatus: "APPROVED",
        hourlyRate: { not: null },
      },
      select: {
        hourlyRate: true,
      },
      take: 100, // Sample size
    });

    if (rates.length > 0) {
      const hourlyRates = rates.map((r) => r.hourlyRate);
      averageRate = Math.round(
        hourlyRates.reduce((sum, rate) => sum + rate, 0) / hourlyRates.length
      );
      minRate = Math.min(...hourlyRates);
      maxRate = Math.max(...hourlyRates);
    }
  } catch (error) {
    // Fallback to default values if database query fails
    if (process.env.NODE_ENV === "development") {
      console.error("[PricingSection] Database error:", error);
    }
  }

  const pricingTiers = [
    {
      name: t("tier.starter.name"),
      price: minRate,
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
      price: averageRate,
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
      price: maxRate,
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
                  /{t("hour")}
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
