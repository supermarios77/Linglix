/**
 * 2FA Verification Page
 * 
 * Page for admins to verify their 2FA token after password login
 * Only shown in production
 */

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/config/auth";
import { Role } from "@prisma/client";
import { is2FARequired } from "@/lib/auth/two-factor";
import { prisma } from "@/lib/db/prisma";
import { Verify2FAForm } from "@/components/auth/Verify2FAForm";
import { Suspense } from "react";

interface Verify2FAPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}

export async function generateMetadata({ params }: Verify2FAPageProps) {
  const { locale } = await params;
  const t = await getTranslations("auth.verify2fa");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Verify2FAPage({ params, searchParams }: Verify2FAPageProps) {
  // Only show 2FA in production
  if (process.env.NODE_ENV !== "production") {
    const { locale } = await params;
    redirect(`/${locale}/dashboard`);
  }

  const { locale } = await params;
  const { callbackUrl } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, twoFactorEnabled: true },
  });

  if (!user || user.role !== Role.ADMIN) {
    redirect(`/${locale}/dashboard`);
  }

  // Check if 2FA is required
  if (!is2FARequired(user.role, user.twoFactorEnabled)) {
    redirect(`/${locale}/dashboard`);
  }

  const redirectUrl = callbackUrl || `/${locale}/dashboard`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="animate-pulse bg-white dark:bg-[#1a1a1a] rounded-[24px] h-96" />}>
          <Verify2FAForm locale={locale} callbackUrl={redirectUrl} />
        </Suspense>
      </div>
    </div>
  );
}
