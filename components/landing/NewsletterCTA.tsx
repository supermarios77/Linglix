"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, FormEvent } from "react";

interface NewsletterCTAProps {
  locale: string;
}

export function NewsletterCTA({ locale }: NewsletterCTAProps) {
  const t = useTranslations("landing.newsletter");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const email = formData.get("email") as string;

      // Basic email validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return;
      }

      // Sanitize email (max length, trim, encode)
      const trimmedEmail = email.trim().slice(0, 254);
      const sanitizedEmail = encodeURIComponent(trimmedEmail);
      
      // Validate locale to prevent path traversal
      const safeLocale = /^[a-z]{2}(-[A-Z]{2})?$/.test(locale) ? locale : "en";
      
      // SSR safety check
      if (typeof window !== "undefined") {
        window.location.href = `/${safeLocale}/auth/signup?email=${sanitizedEmail}`;
      }
    },
    [locale]
  );

  return (
    <section className="relative py-32 px-4 md:px-12 max-w-[1400px] mx-auto">
      {/* Decorative background blur */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-40 blur-[100px] bg-[radial-gradient(circle,rgb(255,200,180)_0%,rgba(255,255,255,0)_70%)] dark:opacity-20"
        aria-hidden="true"
      />

      <div className="relative bg-gradient-to-br from-white dark:from-[#1a1a1a] to-[#fff5f2] dark:to-[#1a0f0a] rounded-[40px] p-16 border border-[rgba(255,107,74,0.1)] dark:border-[rgba(255,107,74,0.2)] shadow-[0_40px_80px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Decorative elements */}
        <div 
          className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(255,169,77)_0%,rgba(255,255,255,0)_70%)]"
          aria-hidden="true"
        />
        <div 
          className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(74,144,255)_0%,rgba(255,255,255,0)_70%)]"
          aria-hidden="true"
        />

        <div className="relative max-w-[700px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-[#ffe5dc] dark:border-[#3a2a25] rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_4px_12px_rgba(255,107,74,0.08)]">
            <span className="w-2 h-2 bg-[#ff6b4a] rounded-full mr-2 animate-pulse" aria-hidden="true" />
            {t("badge")}
          </div>

          <h2 className="font-space-grotesk text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
            {t("title")}{" "}
            <span className="inline-block font-bold bg-[#FFE600] text-black px-3 py-1">{t("titleHighlight")}</span>
          </h2>

          <p className="text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa] mb-10 max-w-[540px] mx-auto">
            {t("description")}
          </p>

          {/* Email Form */}
          <form 
            className="flex flex-col sm:flex-row gap-3 max-w-[520px] mx-auto mb-6" 
            onSubmit={handleSubmit}
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {t("emailPlaceholder")}
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              className="flex-1 px-6 py-4 rounded-full border border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-base text-black dark:text-white focus:outline-none focus:border-[#ff6b4a] focus:ring-2 focus:ring-[rgba(255,107,74,0.1)] transition-all"
              required
              autoComplete="email"
              maxLength={254}
            />
            <button
              type="submit"
              className="bg-[#111] dark:bg-white text-white dark:text-black px-9 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-gray-100 inline-flex items-center justify-center gap-2.5 whitespace-nowrap"
            >
              {t("button")}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>

          <p className="text-xs text-[#888] dark:text-[#a1a1aa]">{t("disclaimer")}</p>
        </div>
      </div>
    </section>
  );
}

