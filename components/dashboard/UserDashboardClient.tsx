"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import Image from "next/image";
import { slugify } from "@/lib/utils/slug";
import type { Booking, BookingStatus } from "@prisma/client";

/**
 * User Dashboard Client Component
 * 
 * Simple user dashboard with:
 * - User welcome section
 * - Upcoming bookings
 * - Past sessions
 * - Quick actions
 * - Landing page style design
 */
interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface TutorUser {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface TutorProfile {
  id: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
}

interface BookingWithTutor extends Booking {
  tutor: {
    id: string;
    user: TutorUser;
    specialties: string[];
    hourlyRate: number;
    rating: number;
  };
  videoSession: {
    id: string;
    startedAt: Date | null;
    endedAt: Date | null;
    recordingUrl: string | null;
    review: {
      id: string;
      rating: number;
      comment: string | null;
    } | null;
  } | null;
}

interface UserDashboardClientProps {
  locale: string;
  user: User;
  upcomingBookings: BookingWithTutor[];
  pastBookings: BookingWithTutor[];
}

export function UserDashboardClient({
  locale,
  user,
  upcomingBookings,
  pastBookings,
}: UserDashboardClientProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tBooking = useTranslations("booking");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50/80 dark:bg-yellow-950/80 backdrop-blur-sm text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 rounded-full px-3 py-1"
          >
            <Clock className="w-3 h-3 mr-1.5" />
            {tBooking("upcoming")}
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50/80 dark:bg-green-950/80 backdrop-blur-sm text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 rounded-full px-3 py-1"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {tBooking("upcoming")}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50/80 dark:bg-blue-950/80 backdrop-blur-sm text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 rounded-full px-3 py-1"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {tBooking("past")}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 rounded-full px-3 py-1"
          >
            <XCircle className="w-3 h-3 mr-1.5" />
            {tBooking("cancelled")}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen pt-16 sm:pt-20">
      {/* Navigation Bar */}
      <header className="fixed top-0 z-[1000] w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-[rgba(250,250,250,0.85)] dark:bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] dark:border-[#262626]">
        <Link
          href={`/${locale}`}
          className="font-bold text-lg sm:text-xl md:text-2xl tracking-[-0.03em] text-black dark:text-white hover:opacity-80 transition-opacity"
        >
          Linglix<span className="text-[#111] dark:text-[#ccf381]">.</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/${locale}/tutors`}>
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
            >
              <Search className="w-4 h-4" />
              {t("browseTutors")}
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <User className="w-4 h-4 text-[#666] dark:text-[#aaa]" />
            )}
            <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
              {user.name || user.email}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ccf381] rounded-full mr-2 sm:mr-2.5 animate-pulse" />
            <span>{t("welcome")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.04em] mb-4 text-black dark:text-white">
            {t("title")}, {user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#555] dark:text-[#a1a1aa] max-w-2xl mx-auto font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link href={`/${locale}/tutors`} className="w-full">
            <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-black dark:text-white">
                  <div className="p-2 bg-[#ccf381]/20 dark:bg-[#ccf381]/10 rounded-lg">
                    <Search className="w-5 h-5 text-[#ccf381]" />
                  </div>
                  {t("browseTutors")}
                </CardTitle>
                <CardDescription className="text-[#666] dark:text-[#aaa]">
                  {t("browseTutorsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="group-hover:translate-x-1 transition-transform text-[#ccf381] hover:text-[#ccf381]"
                >
                  {t("getStarted")} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-black dark:text-white">
                <div className="p-2 bg-blue-500/20 dark:bg-blue-500/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                {t("stats")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666] dark:text-[#aaa]">{t("totalBookings")}</span>
                  <span className="font-semibold text-black dark:text-white">
                    {upcomingBookings.length + pastBookings.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666] dark:text-[#aaa]">{t("upcomingSessions")}</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {upcomingBookings.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666] dark:text-[#aaa]">{t("completedSessions")}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {pastBookings.filter((b) => b.status === "COMPLETED").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-8 sm:mb-12">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                {t("upcomingBookings")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#aaa]">
                {t("upcomingBookingsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {booking.tutor.user.image ? (
                            <Image
                              src={booking.tutor.user.image}
                              alt={booking.tutor.user.name || "Tutor"}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#e5e5e5] dark:bg-[#262626] flex items-center justify-center">
                              <User className="w-5 h-5 text-[#666] dark:text-[#aaa]" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-black dark:text-white">
                              {booking.tutor.user.name || "Tutor"}
                            </h3>
                            <p className="text-xs text-[#666] dark:text-[#aaa]">
                              {booking.tutor.specialties.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#666] dark:text-[#aaa]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.scheduledAt)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatTime(booking.scheduledAt)} ({booking.duration} min)
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>${booking.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(booking.status)}
                        <Link
                          href={`/${locale}/tutors/${slugify(booking.tutor.user.name || "")}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626]"
                          >
                            {t("viewTutor")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                {t("pastSessions")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#aaa]">
                {t("pastSessionsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {booking.tutor.user.image ? (
                            <Image
                              src={booking.tutor.user.image}
                              alt={booking.tutor.user.name || "Tutor"}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#e5e5e5] dark:bg-[#262626] flex items-center justify-center">
                              <User className="w-5 h-5 text-[#666] dark:text-[#aaa]" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-black dark:text-white">
                              {booking.tutor.user.name || "Tutor"}
                            </h3>
                            <p className="text-xs text-[#666] dark:text-[#aaa]">
                              {booking.tutor.specialties.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#666] dark:text-[#aaa]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.scheduledAt)}
                          </div>
                          {booking.videoSession?.recordingUrl && (
                            <Link
                              href={booking.videoSession.recordingUrl}
                              className="text-[#ccf381] hover:underline"
                            >
                              {t("viewRecording")}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {upcomingBookings.length === 0 && pastBookings.length === 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#666] dark:text-[#aaa]" />
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                {t("noBookings")}
              </h3>
              <p className="text-sm text-[#666] dark:text-[#aaa] mb-6">
                {t("noBookingsDescription")}
              </p>
              <Link href={`/${locale}/tutors`}>
                <Button className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black rounded-full">
                  {t("browseTutors")} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

