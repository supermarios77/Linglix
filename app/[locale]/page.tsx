import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";
import { HeroSection } from "@/components/landing/HeroSection";
import { MarqueeTicker } from "@/components/landing/MarqueeTicker";
import { FeaturedTutors } from "@/components/landing/FeaturedTutors";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";

/**
 * Landing Page
 *
 * Modern, beautiful landing page matching the provided design style
 * Adapted for language learning platform
 * 
 * Production-ready with:
 * - Component-based architecture
 * - Proper TypeScript types
 * - Server/Client component separation
 * - Full localization support
 */
export async function generateMetadata() {
  const t = await getTranslations("landing.hero");

  return {
    title: "Linglix - Learn Languages with Native Tutors",
    description: t("description"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("landing");
  const session = await auth();

  const marqueeItems = t.raw("marquee.items") as string[];

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
      <BackgroundBlobs />
      <LandingPageClient session={session} locale={locale} />
      <div className="pt-16 sm:pt-20">
        <HeroSection locale={locale} session={session} />
        <MarqueeTicker items={marqueeItems} />
        <FeaturedTutors locale={locale} />
        <Testimonials locale={locale} />
        <Footer locale={locale} session={session} />
      </div>
    </div>
  );
}
