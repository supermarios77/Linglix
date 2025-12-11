/**
 * Payment Success Page
 * 
 * Displays success message after successful payment
 */

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";

export const dynamic = "force-dynamic";

interface PaymentSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export async function generateMetadata({ params }: PaymentSuccessPageProps) {
  const { locale } = await params;
  const t = await getTranslations("payment");
  return {
    title: `${t("successTitle")} | Linglix`,
  };
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: PaymentSuccessPageProps) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const t = await getTranslations("payment");

  // Require authentication
  await requireAuth();

  // If session_id is provided, verify the payment
  let booking = null;
  if (session_id) {
    try {
      booking = await prisma.booking.findFirst({
        where: { paymentId: session_id },
        include: {
          tutor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      // If error, just show success page anyway
      console.error("Error fetching booking:", error);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-hidden">
      <BackgroundBlobs />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 sm:p-12 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                {t("successTitle")}
              </h1>
              <p className="text-[#666] dark:text-[#aaa]">
                {booking
                  ? t("successMessage", {
                      tutorName: booking.tutor.user.name || "Tutor",
                    })
                  : t("successMessageGeneric")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button asChild className="flex-1">
                <Link href={`/${locale}/dashboard`}>
                  {t("goToDashboard")}
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
