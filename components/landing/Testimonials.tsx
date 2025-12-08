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
  const t = useTranslations("landing");

  const testimonials: Testimonial[] = [
    {
      quote: "My English has improved so much! Abby is patient, engaging, and makes learning fun. I can finally have conversations with confidence.",
      author: "Sarah Chen",
      role: "Verified Student",
      gradient: "from-[#7928ca] to-[#ff0080]",
    },
    {
      quote: "The flexible scheduling is perfect for my busy lifestyle. I can learn English at my own pace with an amazing tutor. Highly recommend!",
      author: "Maya Rodriguez",
      role: "Verified Student",
      gradient: "from-[#06B6D4] to-[#3b82f6]",
    },
    {
      quote: "Best investment I've made for my career. Learning English with Abby has opened so many opportunities. The quality is outstanding.",
      author: "Zoe Williams",
      role: "Verified Student",
      gradient: "from-[#ccf381] to-[#a8e063]",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-16">
        <h3 className="text-[42px] font-semibold mb-4 text-black dark:text-white">
          {t("testimonials.title")}{" "}
          <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 py-1 -rotate-[-2deg] transform origin-center font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
            {t("testimonials.titleHighlight")}
          </span>
        </h3>
        <p className="text-lg text-[#666] dark:text-[#a1a1aa]">{t("testimonials.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 border border-[#e5e5e5] dark:border-[#262626] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]"
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

