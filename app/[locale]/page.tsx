import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { NewLandingPage } from "@/components/landing/NewLandingPage";
import { OrganizationSchema, FAQSchema, WebSiteSchema } from "@/lib/seo/structured-data";
import { getLanguagesWithTutorCounts } from "@/lib/db/languages";
import { getOrSetCache, CacheConfig, generateCacheKey } from "@/lib/cache";
import { logger } from "@/lib/logger";

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
  const { locales } = await import("@/config/i18n/config");
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
      "German tutor",
      "Italian tutor",
      "Portuguese tutor",
      "Japanese tutor",
      "Korean tutor",
      "Chinese tutor",
      "language lessons",
      "online language classes",
      "1-on-1 tutoring",
      "learn languages online",
      "language learning platform",
      "online language school",
    ],
    authors: [{ name: "Linglix" }],
    creator: "Linglix",
    publisher: "Linglix",
    metadataBase: new URL(baseUrl),
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
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Linglix - Learn Languages with Native Tutors",
      description: t("description") || "Connect with certified native language tutors for personalized lessons",
      images: [`${baseUrl}/twitter-image.jpg`],
      creator: "@linglix",
      site: "@linglix",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  // Fetch languages with tutor counts (cached)
  const languages = await getOrSetCache(
    generateCacheKey(CacheConfig.TUTOR_SPECIALTIES.keyPrefix, "popular-languages"),
    async () => {
      try {
        return await getLanguagesWithTutorCounts();
      } catch (error) {
        // If database query fails, return empty array
        logger.error(
          "Failed to fetch languages with tutor counts",
          error instanceof Error ? error : new Error(String(error))
        );
        return [];
      }
    },
    CacheConfig.TUTOR_SPECIALTIES.ttl
  );

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
      <WebSiteSchema
        url={baseUrl}
        name="Linglix"
        description="Online language learning platform connecting students with native tutors"
        potentialAction={{
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/${locale}/tutors?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        }}
      />
      <OrganizationSchema
        url={baseUrl}
        logo="/logo.png"
        description="Online language learning platform connecting students with native tutors"
      />
      <FAQSchema faqs={faqs} />
      <NewLandingPage locale={locale} session={session} languages={languages} />
    </>
  );
}
