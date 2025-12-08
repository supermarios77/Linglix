import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";

/**
 * Admin Dashboard Page
 * 
 * Production-ready admin dashboard for managing tutors
 * - Secure: Requires ADMIN role
 * - Localized: Full i18n support
 * - Server-side: Fetches data on server
 * - Matches landing page design style
 */
export async function generateMetadata() {
  const t = await getTranslations("admin");
  return {
    title: `${t("title")} | Linglix`,
    description: t("subtitle"),
  };
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    // Require admin role - redirects if not admin
    await requireRole(Role.ADMIN);

    const { locale } = await params;

    return (
      <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
        <BackgroundBlobs />
        <AdminDashboardClient locale={locale} />
      </div>
    );
  } catch (error) {
    // If unauthorized, redirect to home
    redirect("/");
  }
}

