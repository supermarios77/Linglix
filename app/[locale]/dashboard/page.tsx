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

// Mark as dynamic since it uses headers for authentication
export const dynamic = "force-dynamic";

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
  // Get locale first (before try block so it's available in catch)
  const { locale } = await params;
  
  try {
    // Require authentication
    const user = await requireAuth();

    // If user is a tutor, fetch tutor-specific data
    if (user.role === Role.TUTOR) {
      // Fetch tutor profile with error handling for timeout issues
      type TutorProfileWithRelations = Awaited<ReturnType<typeof prisma.tutorProfile.findUnique<{
        where: { userId: string };
        include: {
          bookings: {
            include: {
              student: {
                select: {
                  id: true;
                  name: true;
                  image: true;
                  email: true;
                };
              };
            };
          };
          availability: true;
        };
      }>>>;
      
      type TutorProfileBasic = Awaited<ReturnType<typeof prisma.tutorProfile.findUnique<{
        where: { userId: string };
      }>>>;
      
      let tutorProfile: (TutorProfileWithRelations & { bookings?: any[]; availability?: any[] }) | TutorProfileBasic | null = null;
      try {
        tutorProfile = await prisma.tutorProfile.findUnique({
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
      } catch (error) {
        // Handle database connection errors gracefully
        if (process.env.NODE_ENV === "development") {
          console.error("[Dashboard] Error fetching tutor profile:", error);
        }
        
        // If it's a timeout or connection error, try a simpler query
        if (
          error instanceof Error &&
          (error.message.includes("timeout") ||
            error.message.includes("ETIMEDOUT") ||
            error.message.includes("ECONNREFUSED"))
        ) {
          // Fallback: try fetching just the profile without relations
          try {
            tutorProfile = await prisma.tutorProfile.findUnique({
              where: { userId: user.id },
            });
          } catch (fallbackError) {
            if (process.env.NODE_ENV === "development") {
              console.error("[Dashboard] Fallback query also failed:", fallbackError);
            }
            // If even the simple query fails, redirect to onboarding
            redirect(`/${locale}/onboarding`);
          }
        } else {
          // Re-throw non-timeout errors
          throw error;
        }
      }

      // Ensure tutorProfile is not null
      if (!tutorProfile) {
        redirect(`/${locale}/onboarding`);
      }

      // If we only got the profile without relations, fetch them separately
      // Type guard: check if relations exist by checking for 'bookings' property
      if (!('bookings' in tutorProfile) || !tutorProfile.bookings || !('availability' in tutorProfile) || !tutorProfile.availability) {
        try {
          const [bookings, availability] = await Promise.all([
            prisma.booking.findMany({
              where: { tutorId: tutorProfile.id },
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
              orderBy: { scheduledAt: "desc" },
              take: 20,
            }),
            prisma.availability.findMany({
              where: { tutorId: tutorProfile.id },
              orderBy: [
                { dayOfWeek: "asc" },
                { startTime: "asc" },
              ],
            }),
          ]);
          
          tutorProfile = {
            ...tutorProfile,
            bookings,
            availability,
          } as TutorProfileWithRelations;
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("[Dashboard] Error fetching relations:", error);
          }
          // Continue with empty arrays if relations fail
          if (tutorProfile) {
            tutorProfile = {
              ...tutorProfile,
              bookings: ('bookings' in tutorProfile && Array.isArray(tutorProfile.bookings)) ? tutorProfile.bookings : [],
              availability: ('availability' in tutorProfile && Array.isArray(tutorProfile.availability)) ? tutorProfile.availability : [],
            } as TutorProfileWithRelations;
          }
        }
      }

      // Ensure tutorProfile is not null before proceeding
      if (!tutorProfile) {
        redirect(`/${locale}/onboarding`);
      }

      // Calculate stats
      const now = new Date();
      // Type guard: ensure bookings exists and is an array
      const allBookings = ('bookings' in tutorProfile && Array.isArray(tutorProfile.bookings)) 
        ? tutorProfile.bookings 
        : [];
      
      // Separate bookings by status and time
      const pendingBookings = allBookings.filter(
        (booking) => booking.status === "PENDING"
      );
      const upcomingBookings = allBookings.filter(
        (booking) => booking.scheduledAt > now && booking.status === "CONFIRMED"
      );
      const pastBookings = allBookings.filter(
        (booking) => booking.scheduledAt <= now || booking.status === "CANCELLED"
      );
      const completedBookings = pastBookings.filter(
        (booking) => booking.status === "COMPLETED"
      );

      // Calculate earnings breakdown
      const totalEarnings = completedBookings.reduce(
        (sum, booking) => sum + booking.price,
        0
      );

      // Calculate earnings for this week
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekEarnings = completedBookings
        .filter((booking) => booking.scheduledAt >= weekAgo)
        .reduce((sum, booking) => sum + booking.price, 0);

      // Calculate earnings for this month
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const thisMonthEarnings = completedBookings
        .filter((booking) => booking.scheduledAt >= monthAgo)
        .reduce((sum, booking) => sum + booking.price, 0);

      // Get unique students
      const uniqueStudentIds = new Set(allBookings.map((b) => b.studentId));
      const totalStudents = uniqueStudentIds.size;

      // Get reviews for this tutor
      // tutorId is stored directly in Review model for efficient querying
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
            tutorProfile={{
              ...tutorProfile,
              bookings: allBookings as any,
              availability: ('availability' in tutorProfile && Array.isArray(tutorProfile.availability)) ? tutorProfile.availability : [] as any,
            } as any}
            pendingBookings={pendingBookings}
            upcomingBookings={upcomingBookings}
            pastBookings={pastBookings}
            totalEarnings={totalEarnings}
            thisWeekEarnings={thisWeekEarnings}
            thisMonthEarnings={thisMonthEarnings}
            totalStudents={totalStudents}
            reviews={reviews}
            availability={('availability' in tutorProfile && Array.isArray(tutorProfile.availability)) ? tutorProfile.availability : [] as any}
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
    // Check if it's an authentication error
    if (error instanceof Error && error.name === "HttpError") {
      // Redirect to sign in with locale
      redirect(`/${locale}/auth/signin`);
    }
    
    // For other errors, log and redirect to home with locale
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard error:", error);
    }
    redirect(`/${locale}`);
  }
}

