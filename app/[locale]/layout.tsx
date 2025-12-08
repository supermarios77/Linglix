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
    <html lang={locale} className="light" data-theme="light">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
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