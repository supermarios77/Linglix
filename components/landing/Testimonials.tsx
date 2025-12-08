"use client";

import { useTranslations } from "next-intl";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  gradient: string;
}

interface TestimonialsProps {
  locale: string;
}

/**
 * Testimonials Section Component
 * 
 * Displays customer testimonials in a grid layout
 * Production-ready with proper TypeScript types
 */
export function Testimonials({ locale }: TestimonialsProps) {
  const t = useTranslations("landing.testimonials");

  const testimonials: Testimonial[] = [
    {
      quote: t("quotes.1"),
      author: "Li Wei",
      role: t("verifiedStudent"),
      gradient: "from-[#7928ca] to-[#ff0080]",
    },
    {
      quote: t("quotes.2"),
      author: "Ayşe Yılmaz",
      role: t("verifiedStudent"),
      gradient: "from-[#06B6D4] to-[#3b82f6]",
    },
    {
      quote: t("quotes.3"),
      author: "Min-jun Park",
      role: t("verifiedStudent"),
      gradient: "from-[#ccf381] to-[#a8e063]",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <h3 className="text-[28px] sm:text-[36px] md:text-[42px] font-semibold mb-3 sm:mb-4 text-black dark:text-white px-2">
          {t("title")}{" "}
          <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-2 sm:px-3 py-0.5 sm:py-1 -rotate-[-2deg] transform origin-center font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.1)] text-[24px] sm:text-[32px] md:text-[36px]">
            {t("titleHighlight")}
          </span>
        </h3>
        <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] px-4">{t("subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 border border-[#e5e5e5] dark:border-[#262626] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]"
          >
            <div className="flex text-[#ffb800] text-base sm:text-lg mb-3 sm:mb-4" aria-label="5 stars">
              ★★★★★
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[#444] dark:text-[#a1a1aa] mb-4 sm:mb-6">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${testimonial.gradient}`} aria-hidden="true" />
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-black dark:text-white">{testimonial.author}</h4>
                <p className="text-[10px] sm:text-xs text-[#888] dark:text-[#a1a1aa]">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

