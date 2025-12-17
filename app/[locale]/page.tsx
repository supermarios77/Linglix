import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";
import { HeroSection } from "@/components/landing/HeroSection";
import { MarqueeTicker } from "@/components/landing/MarqueeTicker";
import { FeaturedTutors } from "@/components/landing/FeaturedTutors";
import { EmailSignup } from "@/components/landing/EmailSignup";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";
import { OrganizationSchema, FAQSchema } from "@/lib/seo/structured-data";

// Revalidate landing page every 5 minutes
export const revalidate = 300;

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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("landing.hero");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  // Generate alternate language URLs
  const { locales } = await import("@/i18n/config");
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = `${baseUrl}/${loc}`;
  });

  return {
    title: "Linglix - Learn Languages with Native Tutors Online | 1-on-1 Lessons",
    description: t("description") || "Connect with certified native language tutors for personalized 1-on-1 video lessons. Learn Spanish, English, French, and more. Book your first session today!",
    keywords: [
      "language learning",
      "online tutors",
      "native speakers",
      "Spanish tutor",
      "English tutor",
      "French tutor",
      "language lessons",
      "online language classes",
      "1-on-1 tutoring",
      "learn languages online",
    ],
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        ...alternates,
        "x-default": `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: "Linglix - Learn Languages with Native Tutors",
      description: t("description") || "Connect with certified native language tutors for personalized 1-on-1 video lessons",
      url: `${baseUrl}/${locale}`,
      siteName: "Linglix",
      locale: locale,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Linglix - Language Learning Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Linglix - Learn Languages with Native Tutors",
      description: t("description") || "Connect with certified native language tutors for personalized lessons",
      images: [`${baseUrl}/twitter-image.jpg`],
    },
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  // FAQ data for structured data
  const faqs = [
    {
      question: "How does Linglix work?",
      answer: "Linglix connects students with certified native language tutors for personalized 1-on-1 video lessons. Students browse tutor profiles, book sessions at their preferred times, and learn through interactive video calls with real-time feedback.",
    },
    {
      question: "How much do language lessons cost?",
      answer: "Lesson prices are a fixed 30$ per hour.",
    },
    {
      question: "How do I book a language lesson?",
      answer: "To book a lesson, browse our tutors, select a time slot that works for you, and complete payment. You'll receive a confirmation email with the video call link. Lessons can be booked at least 24 hours in advance.",
    },
    {
      question: "What languages can I learn?",
      answer: "Linglix offers tutors for multiple languages including Spanish, English, French, German, Italian, Portuguese, Japanese, Korean, and Chinese. Browse our tutors page to see all available languages.",
    },
    {
      question: "Are the tutors certified?",
      answer: "Yes, all tutors on Linglix are native speakers who have been verified and approved by our team. Each tutor profile shows their specialties, ratings, and experience to help you find the perfect match.",
    },
  ];

  return (
    <>
      <OrganizationSchema
        url={baseUrl}
        logo="/logo.png"
        description="Online language learning platform connecting students with native tutors"
      />
      <FAQSchema faqs={faqs} />
      <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
        <BackgroundBlobs />
        <LandingPageClient session={session} locale={locale} />
        <div className="pt-16 sm:pt-20">
          <HeroSection locale={locale} session={session} />
          <MarqueeTicker items={marqueeItems} />
          <Suspense fallback={<div className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto"><div className="animate-pulse bg-white dark:bg-[#1a1a1a] rounded-[20px] h-96" /></div>}>
            <FeaturedTutors locale={locale} />
          </Suspense>
          <Suspense fallback={null}>
            <EmailSignup locale={locale} />
          </Suspense>
          <Suspense fallback={null}>
            <Testimonials locale={locale} />
          </Suspense>
          <Footer locale={locale} session={session} />
        </div>
      </div>
    </>
  );
}
