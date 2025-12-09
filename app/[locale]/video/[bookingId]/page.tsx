/**
 * Video Session Page
 * 
 * Page for joining and participating in video calls.
 * Requires authentication and validates user has access to the booking.
 */

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideoSessionClient } from "@/components/video/VideoSessionClient";
import { Role } from "@prisma/client";

export default async function VideoSessionPage({
  params,
}: {
  params: Promise<{ locale: string; bookingId: string }>;
}) {
  const user = await requireAuth();
  const { locale, bookingId } = await params;

  // Fetch booking and verify access
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
      videoSession: true,
    },
  });

  if (!booking) {
    redirect(`/${locale}/dashboard`);
  }

  // Verify user has access
  const isStudent = booking.studentId === user.id;
  const isTutor = booking.tutor.userId === user.id;

  if (!isStudent && !isTutor) {
    redirect(`/${locale}/dashboard`);
  }

  // Determine user role for the call
  const userRole = isTutor ? "tutor" : "student";
  const otherUser = isTutor ? booking.student : booking.tutor.user;

  return (
    <VideoSessionClient
      bookingId={bookingId}
      userRole={userRole}
      userName={user.name || user.email}
      otherUserName={otherUser.name || otherUser.email}
      locale={locale}
    />
  );
}

