/**
 * Payment Cancel Page
 * 
 * Displays message when payment is cancelled
 */

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";

export const dynamic = "force-dynamic";

interface PaymentCancelPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ booking_id?: string }>;
}

export async function generateMetadata({ params }: PaymentCancelPageProps) {
  const { locale } = await params;
  const t = await getTranslations("payment");
  return {
    title: `${t("cancelTitle")} | Linglix`,
  };
}

export default async function PaymentCancelPage({
  params,
  searchParams,
}: PaymentCancelPageProps) {
  const { locale } = await params;
  const { booking_id } = await searchParams;
  const t = await getTranslations("payment");

  // Require authentication
  await requireAuth();

  // If booking_id is provided, fetch booking info
  let booking = null;
  if (booking_id) {
    try {
      booking = await prisma.booking.findUnique({
        where: { id: booking_id },
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
      // If error, just show cancel page anyway
      console.error("Error fetching booking:", error);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-hidden">
      <BackgroundBlobs />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 sm:p-12 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                {t("cancelTitle")}
              </h1>
              <p className="text-[#666] dark:text-[#aaa]">
                {t("cancelMessage")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {booking && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/${locale}/dashboard`}>
                    {t("tryAgain")}
                  </Link>
                </Button>
              )}
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
