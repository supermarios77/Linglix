import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, isValidLocale } from "@/i18n/config";

/**
 * Plus Jakarta Sans - Modern, beautiful geometric sans-serif
 * 
 * Originally designed for Jakarta's city branding, now widely used for:
 * - Modern web applications and startups
 * - Clean, geometric forms
 * - Excellent readability
 * - Beautiful, contemporary aesthetic
 * - Perfect for UI/UX design
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap", // Optimize font loading
  preload: true,
  weight: ["400", "500", "600", "700", "800"], // Include multiple weights for design flexibility
});

export const metadata: Metadata = {
  title: "Linglix - Learn Languages with Tutors",
  description: "Online language learning platform connecting students with native tutors",
};

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
    <html lang={locale}>
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased`}
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