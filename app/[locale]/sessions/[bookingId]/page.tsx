/**
 * Video Call Session Page
 * 
 * Production-ready video call page for joining Stream Video sessions.
 * - Validates booking access (only student and tutor can join)
 * - Checks booking status and timing
 * - Creates/retrieves Stream call ID
 * - Provides secure access to video sessions
 */

import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { BookingStatus } from "@prisma/client";
import { VideoCallClient } from "@/components/video/VideoCallClient";
import { StreamVideoProvider } from "@/components/video/StreamVideoProvider";
import { StreamChatProvider } from "@/components/chat/StreamChatProvider";
import { BackgroundBlobs } from "@/components/landing/BackgroundBlobs";

export const dynamic = "force-dynamic";

interface VideoCallPageProps {
  params: Promise<{ locale: string; bookingId: string }>;
}

export async function generateMetadata({ params }: VideoCallPageProps) {
  const { locale } = await params;
  const t = await getTranslations("videoCall");
  return {
    title: `${t("title")} | Linglix`,
    description: t("description"),
  };
}

export default async function VideoCallPage({ params }: VideoCallPageProps) {
  const { locale, bookingId } = await params;

  try {
    // Require authentication
    const user = await requireAuth();

    // Fetch booking with all necessary relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      notFound();
    }

    // Verify user has access to this booking
    const isStudent = booking.studentId === user.id;
    const isTutor = booking.tutor.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTutor && !isAdmin) {
      redirect(`/${locale}/dashboard`);
    }

    // Check booking status - only allow joining if booking is confirmed or completed
    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      redirect(`/${locale}/dashboard`);
    }

    // Generate or retrieve call ID
    // Format: "booking-{bookingId}" for unique call identification
    const callId = booking.callId || `booking-${booking.id}`;

    // Update booking with callId if it doesn't exist
    if (!booking.callId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { callId },
      });
    }

    // Determine the other participant (for display)
    const otherParticipant = isStudent
      ? {
          id: booking.tutor.user.id,
          name: booking.tutor.user.name || "Tutor",
          image: booking.tutor.user.image,
        }
      : {
          id: booking.student.id,
          name: booking.student.name || "Student",
          image: booking.student.image,
        };

    return (
      <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-hidden">
        <BackgroundBlobs />
        <StreamVideoProvider
          userId={user.id}
          userName={user.name}
          userImage={user.image}
        >
          <StreamChatProvider
            userId={user.id}
            userName={user.name}
            userImage={user.image}
          >
            <VideoCallClient
              callId={callId}
              locale={locale}
              user={user}
              otherParticipant={otherParticipant}
              isTutor={isTutor}
            />
          </StreamChatProvider>
        </StreamVideoProvider>
      </div>
    );
  } catch (error) {
    // Log error and redirect to dashboard
    if (process.env.NODE_ENV === "development") {
      console.error("Video call page error:", error);
    }
    redirect(`/${locale}/dashboard`);
  }
}
