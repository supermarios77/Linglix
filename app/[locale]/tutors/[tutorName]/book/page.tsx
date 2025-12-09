/**
 * Booking Page
 * 
 * Page for students to book a session with a tutor.
 * Production-ready with availability checking, validation, and error handling.
 */

import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";
import { slugify } from "@/lib/utils/slug";
import { BookingClient } from "@/components/booking/BookingClient";
import { PublicNav } from "@/components/navigation/PublicNav";
import { auth } from "@/config/auth";

interface BookingPageProps {
  params: Promise<{ locale: string; tutorName: string }>;
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { locale, tutorName } = await params;
  const t = await getTranslations("booking");

  return {
    title: `${t("title")} - Linglix`,
    description: t("description"),
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { locale, tutorName } = await params;

  // Require student role
  const user = await requireRole(Role.STUDENT);

  // Find tutor by slug
  const tutors = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorProfile: {
        isActive: true,
        approvalStatus: "APPROVED",
      },
    },
    include: {
      tutorProfile: {
        include: {
          availability: {
            where: {
              isActive: true,
            },
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      },
    },
  });

  const tutor = tutors.find(
    (t) => t.name && slugify(t.name) === tutorName
  );

  if (!tutor || !tutor.tutorProfile) {
    notFound();
  }

  const session = await auth();

  return (
    <>
      <PublicNav locale={locale} session={session} />
      <div className="pt-16 sm:pt-20">
        <BookingClient
          tutor={{
            id: tutor.tutorProfile.id,
            userId: tutor.id,
            name: tutor.name!,
            email: tutor.email,
            image: tutor.image,
            hourlyRate: tutor.tutorProfile.hourlyRate,
            specialties: tutor.tutorProfile.specialties,
            availability: tutor.tutorProfile.availability.map((avail) => ({
              dayOfWeek: avail.dayOfWeek,
              startTime: avail.startTime,
              endTime: avail.endTime,
              timezone: avail.timezone,
            })),
          }}
          locale={locale}
        />
      </div>
    </>
  );
}

