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
      gradient: "from-accent to-brand-primary-light",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-16">
        <h3 className="font-space-grotesk text-[42px] font-semibold mb-4 text-black dark:text-white">
          {t("title")}{" "}
          <span className="font-normal bg-gradient-to-r from-accent to-brand-primary-light bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
        </h3>
        <p className="text-lg text-[#666] dark:text-[#a1a1aa]">{t("subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] p-8 border border-[#eee] dark:border-[#262626] transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]"
          >
            <div className="flex text-[#ffb800] text-lg mb-4" aria-label="5 stars">
              ★★★★★
            </div>
            <p className="text-base leading-relaxed text-[#444] dark:text-[#a1a1aa] mb-6">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient}`} aria-hidden="true" />
              <div>
                <h4 className="font-semibold text-sm text-black dark:text-white">{testimonial.author}</h4>
                <p className="text-xs text-[#888] dark:text-[#a1a1aa]">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

