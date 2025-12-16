import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";
import { prisma } from "@/lib/db/prisma";

/**
 * Profile Page
 * 
 * Allows users to:
 * - Upload and update their profile picture
 * - Edit their account information
 * - Edit student or tutor profile information
 * 
 * - Secure: Requires authentication
 * - Localized: Full i18n support
 * - Server-side: Fetches user data on server
 */

// Mark as dynamic since it uses headers for authentication
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("profile");
  return {
    title: `${t("title")} | Linglix`,
    description: t("description"),
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  try {
    // Require authentication
    const user = await requireAuth();

    // Fetch user with profile data
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        studentProfile: true,
        tutorProfile: true,
      },
    });

    if (!userWithProfile) {
      redirect(`/${locale}/auth/signin`);
    }

    // Transform tutorProfile to match expected type
    // languagesKnown is stored as JsonValue in Prisma but needs to be typed array
    const transformedTutorProfile = userWithProfile.tutorProfile
      ? {
          ...userWithProfile.tutorProfile,
          languagesKnown:
            userWithProfile.tutorProfile.languagesKnown &&
            Array.isArray(userWithProfile.tutorProfile.languagesKnown)
              ? (userWithProfile.tutorProfile.languagesKnown as Array<{
                  language: string;
                  proficiency: string;
                }>)
              : null,
        }
      : null;

    return (
      <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
        <BackgroundBlobs />
        <ProfileClient 
          locale={locale} 
          user={{
            id: userWithProfile.id,
            name: userWithProfile.name,
            email: userWithProfile.email,
            image: userWithProfile.image,
            role: userWithProfile.role,
          }}
          studentProfile={userWithProfile.studentProfile}
          tutorProfile={transformedTutorProfile}
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
      console.error("Profile page error:", error);
    }
    redirect(`/${locale}`);
  }
}
