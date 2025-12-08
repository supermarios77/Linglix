import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { UserDashboardClient } from "@/components/dashboard/UserDashboardClient";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";

/**
 * User Dashboard Page
 * 
 * Simple user dashboard for students
 * - Secure: Requires authentication
 * - Localized: Full i18n support
 * - Server-side: Fetches data on server
 * - Matches landing page design style
 */
export async function generateMetadata() {
  const t = await getTranslations("dashboard");
  return {
    title: `${t("title")} | Linglix`,
    description: t("subtitle"),
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    // Require authentication
    const user = await requireAuth();
    const { locale } = await params;

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
        videoSession: {
          include: {
            review: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
      take: 10, // Limit to recent bookings
    });

    // Separate upcoming and past bookings
    const now = new Date();
    const upcomingBookings = bookings.filter(
      (booking) => booking.scheduledAt > now && booking.status !== "CANCELLED"
    );
    const pastBookings = bookings.filter(
      (booking) => booking.scheduledAt <= now || booking.status === "CANCELLED"
    );

    return (
      <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
        <BackgroundBlobs />
        <UserDashboardClient
          locale={locale}
          user={user}
          upcomingBookings={upcomingBookings}
          pastBookings={pastBookings}
        />
      </div>
    );
  } catch (error) {
    // If unauthorized, redirect to sign in
    redirect("/");
  }
}

