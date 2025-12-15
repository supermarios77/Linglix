import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, isValidLocale } from "@/i18n/config";

/**
 * Inter - Modern, highly legible sans-serif font
 * 
 * Designed specifically for computer screens with:
 * - Excellent readability at all sizes
 * - Tall x-height for clarity
 * - Open apertures for better character recognition
 * - Optimized for UI and web applications
 * - Used by major tech companies (GitHub, Figma, etc.)
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Optimize font loading
  preload: true,
  weight: ["300", "400", "500", "600", "700"], // Modern weight range
  style: ["normal"],
});

/**
 * Generate metadata for locale-specific layout
 * Includes hreflang tags for multi-language SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  // Generate alternate language URLs
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = `${baseUrl}/${loc}`;
  });

  return {
    title: {
      default: "Linglix - Learn Languages with Native Tutors",
      template: "%s | Linglix",
    },
    description: "Connect with certified native language tutors for personalized 1-on-1 video lessons. Learn Spanish, English, French, and more. Book your first session today!",
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
      type: "website",
      locale: locale,
      url: `${baseUrl}/${locale}`,
      siteName: "Linglix",
      title: "Linglix - Learn Languages with Native Tutors",
      description: "Connect with certified native language tutors for personalized 1-on-1 video lessons. Learn Spanish, English, French, and more.",
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
      description: "Connect with certified native language tutors for personalized lessons",
      images: [`${baseUrl}/twitter-image.jpg`],
      creator: "@linglix",
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

/**
 * Locale-specific layout
 * 
 * This layout wraps all pages with the current locale and provides
 * translations to client components via NextIntlClientProvider
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Theme script - prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
        {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/**
 * Generate static params for all locales
 * This enables static generation for all locale routes
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}