import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

/**
 * Admin Dashboard Page
 * 
 * Production-ready admin dashboard for managing tutors
 * - Secure: Requires ADMIN role
 * - Localized: Full i18n support
 * - Server-side: Fetches data on server
 */
export async function generateMetadata() {
  const t = await getTranslations("admin");
  return {
    title: `${t("title")} | Linglix`,
    description: t("subtitle"),
  };
}

export default async function AdminDashboardPage() {
  try {
    // Require admin role - redirects if not admin
    await requireRole(Role.ADMIN);

    const t = await getTranslations("admin");

    return <AdminDashboardClient />;
  } catch (error) {
    // If unauthorized, redirect to home
    redirect("/");
  }
}

