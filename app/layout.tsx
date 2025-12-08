import { locales } from "@/i18n/config";
import { notFound } from "next/navigation";

/**
 * Root Layout
 * 
 * This is the root layout that handles locale routing.
 * It redirects to the locale-specific layout.
 */
export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  // This layout is only used for non-locale routes
  // All actual pages should be under [locale]
  return children;
}
