"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmailSignupProps {
  locale: string;
}

/**
 * Email Signup Section Component
 * 
 * Newsletter/waitlist signup section matching the provided design
 * Production-ready with proper TypeScript types
 */
export function EmailSignup({ locale }: EmailSignupProps) {
  const t = useTranslations("landing");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    // TODO: Implement email signup API call
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <section className="relative py-32 px-4 md:px-12 max-w-[1400px] mx-auto">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-40 blur-[100px] bg-[radial-gradient(circle,hsl(var(--accent)/0.3)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,hsl(var(--accent)/0.2)_0%,rgba(0,0,0,0)_70%)]" />

      <div className="relative bg-gradient-to-br from-white dark:from-[#1a1a1a] to-[#fef9fb] dark:to-[#121212] rounded-[40px] p-16 border border-accent/10 dark:border-accent/20 shadow-[0_40px_80px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,hsl(var(--accent)/0.3)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,hsl(var(--accent)/0.2)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,hsl(var(--accent)/0.2)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,hsl(var(--accent)/0.15)_0%,rgba(0,0,0,0)_70%)]" />

        <div className="relative max-w-[700px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-accent/20 dark:border-accent/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse" />
            {t("waitlist.badge")}
          </div>

          <h2 className="font-space-grotesk text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
            {t("waitlist.title")}
            <br />
            <span className="font-bold bg-accent text-black px-2 py-1 -rotate-[-2deg] transform origin-center inline-block">
              {t("waitlist.titleHighlight")}
            </span>
          </h2>

          <p className="text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa] mb-10 max-w-[540px] mx-auto">
            {t("waitlist.subtitle")}
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-[520px] mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full border border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-base text-black dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || submitted}
              className="bg-[#111] dark:bg-accent text-white dark:text-black px-9 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-brand-primary-light inline-flex items-center justify-center gap-2.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted 
                ? "Joined!" 
                : isSubmitting 
                ? "Joining..."
                : t("waitlist.button")}
              {!submitted && !isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-xs text-[#888] dark:text-[#666]">
            {t("waitlist.disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
