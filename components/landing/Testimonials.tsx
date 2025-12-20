"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface Testimonial {
  rating: number;
  quoteKey: "1" | "2" | "3";
  avatar: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    rating: 5,
    quoteKey: "1",
    avatar: "👩",
    gradient: "from-[#ff6b4a] to-[#ffa94d]",
  },
  {
    rating: 5,
    quoteKey: "2",
    avatar: "👨",
    gradient: "from-[#4a90ff] to-[#4dc3ff]",
  },
  {
    rating: 5,
    quoteKey: "3",
    avatar: "👩",
    gradient: "from-[#ff4d8c] to-[#ff8f70]",
  },
];

export function Testimonials() {
  const t = useTranslations("landing.testimonials");

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-16">
        <h3 className="font-space-grotesk text-[42px] font-semibold mb-4 text-black dark:text-white">
          {t("title")}{" "}
          <span className="inline-block font-bold bg-[#FFE600] text-black px-3 py-1">{t("titleHighlight")}</span>
        </h3>
        <p className="text-lg text-[#666] dark:text-[#a1a1aa]">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => {
          try {
            const quoteText = t(`quotes.${testimonial.quoteKey}.text`);
            const quoteName = t(`quotes.${testimonial.quoteKey}.name`);
            const quoteLanguage = t(`quotes.${testimonial.quoteKey}.language`);

            return (
              <article
                key={testimonial.quoteKey}
                className="group bg-white dark:bg-[#1a1a1a] rounded-[24px] p-8 border border-[#eee] dark:border-[#262626] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all"
              >
                <div className="flex mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={`${testimonial.quoteKey}-star-${i}`} className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-[#555] dark:text-[#a1a1aa] leading-relaxed mb-6 italic">
                  &ldquo;{quoteText}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center`}
                    aria-hidden="true"
                  >
                    <span className="text-xl" role="img" aria-label={quoteName}>
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-black dark:text-white">{quoteName}</h5>
                    <p className="text-xs text-[#888] dark:text-[#a1a1aa]">{quoteLanguage}</p>
                  </div>
                </div>
              </article>
            );
          } catch {
            return null;
          }
        })}
      </div>
    </section>
  );
}
