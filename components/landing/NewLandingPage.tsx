"use client";

import { PublicNav } from "@/components/navigation/PublicNav";
import { BackgroundBlobs } from "./BackgroundBlobs";
import { HeroSection } from "./HeroSection";
import { MarqueeTicker } from "./MarqueeTicker";
import { PopularLanguages } from "./PopularLanguages";
import { HowItWorks } from "./HowItWorks";
import { NewsletterCTA } from "./NewsletterCTA";
import { Testimonials } from "./Testimonials";
import { ScrollToTop } from "./ScrollToTop";

interface NewLandingPageProps {
  locale: string;
  session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null;
}

// Validate locale to prevent injection attacks
function isValidLocale(locale: string): boolean {
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(locale);
}

export function NewLandingPage({ locale, session }: NewLandingPageProps) {
  // Sanitize locale to prevent path traversal
  const safeLocale = isValidLocale(locale) ? locale : "en";

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
      <BackgroundBlobs />
      <PublicNav locale={safeLocale} session={session} />
      <HeroSection locale={safeLocale} session={session} />
      <MarqueeTicker />
      <PopularLanguages locale={safeLocale} />
      <HowItWorks />
      <NewsletterCTA locale={safeLocale} />
      <Testimonials />
      <ScrollToTop />
    </div>
  );
}
