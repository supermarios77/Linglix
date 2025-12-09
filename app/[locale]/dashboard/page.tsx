import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { UserDashboardClient } from "@/components/dashboard/UserDashboardClient";
import { TutorDashboardClient } from "@/components/dashboard/TutorDashboardClient";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";
import { Role } from "@prisma/client";

/**
 * Dashboard Page
 * 
 * Unified dashboard that adapts based on user role:
 * - Students: See their bookings and learning progress
 * - Tutors: See their sessions, earnings, and students
 * 
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

    // If user is a tutor, fetch tutor-specific data
    if (user.role === Role.TUTOR) {
      // Fetch tutor profile
      const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId: user.id },
        include: {
          bookings: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  email: true,
                },
              },
            },
            orderBy: {
              scheduledAt: "desc",
            },
            take: 20,
          },
          availability: {
            orderBy: [
              { dayOfWeek: "asc" },
              { startTime: "asc" },
            ],
          },
        },
      });

      if (!tutorProfile) {
        // Tutor profile not found, redirect to onboarding
        redirect(`/${locale}/onboarding`);
      }

      // Calculate stats
      const now = new Date();
      const allBookings = tutorProfile.bookings;
      const upcomingBookings = allBookings.filter(
        (booking) => booking.scheduledAt > now && booking.status !== "CANCELLED"
      );
      const pastBookings = allBookings.filter(
        (booking) => booking.scheduledAt <= now || booking.status === "CANCELLED"
      );
      const completedBookings = pastBookings.filter(
        (booking) => booking.status === "COMPLETED"
      );

      // Calculate earnings (only from completed bookings)
      const totalEarnings = completedBookings.reduce(
        (sum, booking) => sum + booking.price,
        0
      );

      // Get reviews
      const reviews = await prisma.review.findMany({
        where: {
          tutorId: tutorProfile.id,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      return (
        <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
          <BackgroundBlobs />
          <TutorDashboardClient
            locale={locale}
            user={user}
            tutorProfile={tutorProfile}
            upcomingBookings={upcomingBookings}
            pastBookings={pastBookings}
            totalEarnings={totalEarnings}
            reviews={reviews}
            availability={tutorProfile.availability}
          />
        </div>
      );
    }

    // Student dashboard - fetch student bookings
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
      take: 10,
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

