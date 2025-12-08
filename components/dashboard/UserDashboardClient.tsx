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
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { slugify } from "@/lib/utils/slug";
import type { Booking, BookingStatus } from "@prisma/client";

/**
 * User Dashboard Client Component
 * 
 * Enhanced user dashboard matching landing page style:
 * - Large, bold typography
 * - Highlighted text effects
 * - Feature pills
 * - Polished glassmorphism
 * - Better visual hierarchy
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
  const tBooking = useTranslations("booking");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
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

  const totalBookings = upcomingBookings.length + pastBookings.length;
  const completedSessions = pastBookings.filter((b) => b.status === "COMPLETED").length;

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

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
        {/* Welcome Section - Matching Hero Style */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20">
          {/* Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] group hover:scale-105 transition-transform">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ccf381] rounded-full mr-2 sm:mr-2.5 animate-pulse" />
            <span className="mr-1.5 sm:mr-2 text-[10px] sm:text-xs">{t("welcome")}</span>
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ccf381] opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Main Heading with Highlighted Text */}
          <h1 className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[88px] xl:text-[100px] leading-[0.92] font-bold tracking-[-0.04em] mb-6 sm:mb-8 text-black dark:text-white px-2">
            {t("title")}
            <br />
            <span className="relative inline-block mt-1 sm:mt-2">
              <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 -rotate-[-2deg] transform origin-center font-bold shadow-[0_4px_8px_rgba(0,0,0,0.1)] sm:shadow-[0_6px_12px_rgba(0,0,0,0.12)] relative z-10 text-[28px] sm:text-[36px] md:text-[44px] lg:text-[85px] xl:text-[95px]">
                {user.name?.split(" ")[0] || "there"}!
              </span>
              <span className="absolute inset-0 bg-[#ffeb3b]/20 dark:bg-[#ccf381]/20 blur-xl -rotate-[-2deg] transform origin-center" aria-hidden="true" />
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl lg:text-[22px] leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[600px] mb-8 sm:mb-10 md:mb-12 font-light px-4">
            {t("subtitle")}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 px-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs sm:text-sm font-medium text-black dark:text-white">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ccf381]" />
              <span>{totalBookings} {t("totalBookings")}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs sm:text-sm font-medium text-black dark:text-white">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ccf381]" />
              <span>{upcomingBookings.length} {t("upcomingSessions")}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs sm:text-sm font-medium text-black dark:text-white">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ccf381]" />
              <span>{completedSessions} {t("completedSessions")}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions - Enhanced Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <Link href={`/${locale}/tutors`} className="w-full group">
            <Card className="bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_60px_120px_rgba(0,0,0,0.15)] hover:-translate-y-2 cursor-pointer h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ccf381]/5 via-transparent to-[#7928ca]/5 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-black dark:text-white text-xl sm:text-2xl">
                  <div className="p-3 bg-[#ccf381]/20 dark:bg-[#ccf381]/10 rounded-xl">
                    <Search className="w-6 h-6 text-[#ccf381]" />
                  </div>
                  {t("browseTutors")}
                </CardTitle>
                <CardDescription className="text-[#666] dark:text-[#aaa] text-base">
                  {t("browseTutorsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  size="lg"
                  className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-8 sm:px-10 py-5 sm:py-6 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:bg-[#222] dark:hover:bg-[#d4f89a] inline-flex items-center justify-center gap-2.5 sm:gap-3 group/btn"
                >
                  <span>{t("getStarted")}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.1)] h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-[#ccf381]/5 opacity-50 transition-opacity duration-700" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-black dark:text-white text-xl sm:text-2xl">
                <div className="p-3 bg-blue-500/20 dark:bg-blue-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                {t("stats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-xl">
                  <span className="text-[#666] dark:text-[#aaa]">{t("totalBookings")}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                    {totalBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-xl">
                  <span className="text-[#666] dark:text-[#aaa]">{t("upcomingSessions")}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {upcomingBookings.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-xl">
                  <span className="text-[#666] dark:text-[#aaa]">{t("completedSessions")}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {completedSessions}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings - Enhanced Design */}
        {upcomingBookings.length > 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-8 sm:mb-12 rounded-[24px] sm:rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                {t("upcomingBookings")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#aaa] text-base">
                {t("upcomingBookingsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group p-6 sm:p-8 bg-gradient-to-br from-white/80 to-[#fafafa]/80 dark:from-[#0a0a0a]/80 dark:to-[#1a1a1a]/80 backdrop-blur-sm border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[20px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          {booking.tutor.user.image ? (
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626]">
                              <Image
                                src={booking.tutor.user.image}
                                alt={booking.tutor.user.name || t("tutorFallback")}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#ccf381]/20 to-[#7928ca]/20 border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center">
                              <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#ccf381]" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-1">
                              {booking.tutor.user.name || t("tutorFallback")}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-[#ffb800]">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                      i < Math.floor(booking.tutor.rating)
                                        ? "fill-[#ffb800] text-[#ffb800]"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-black dark:text-white">
                                {booking.tutor.rating.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {booking.tutor.specialties.slice(0, 2).map((spec, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
                                >
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-[#666] dark:text-[#aaa]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{formatDate(booking.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{formatTime(booking.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{booking.duration} {tBooking("min")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-black dark:text-white">
                              ${booking.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {getStatusBadge(booking.status)}
                        <Link
                          href={`/${locale}/tutors/${slugify(booking.tutor.user.name || "")}`}
                        >
                          <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-[#111] dark:hover:border-[#ccf381] transition-all"
                          >
                            {t("viewTutor")}
                            <ArrowRight className="w-4 h-4 ml-2" />
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

        {/* Past Bookings - Enhanced Design */}
        {pastBookings.length > 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[24px] sm:rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                {t("pastSessions")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#aaa] text-base">
                {t("pastSessionsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 sm:p-8 bg-gradient-to-br from-white/60 to-[#fafafa]/60 dark:from-[#0a0a0a]/60 dark:to-[#1a1a1a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          {booking.tutor.user.image ? (
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626]">
                              <Image
                                src={booking.tutor.user.image}
                                alt={booking.tutor.user.name || t("tutorFallback")}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#ccf381]/20 to-[#7928ca]/20 border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center">
                              <User className="w-6 h-6 sm:w-8 sm:h-8 text-[#ccf381]" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-1">
                              {booking.tutor.user.name || t("tutorFallback")}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#666] dark:text-[#aaa]">
                              {booking.tutor.specialties.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#666] dark:text-[#aaa]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.scheduledAt)}</span>
                          </div>
                          {booking.videoSession?.recordingUrl && (
                            <Link
                              href={booking.videoSession.recordingUrl}
                              className="text-[#ccf381] hover:underline font-medium"
                            >
                              {t("viewRecording")}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div>{getStatusBadge(booking.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Enhanced */}
        {upcomingBookings.length === 0 && pastBookings.length === 0 && (
          <Card className="bg-gradient-to-br from-white/90 to-[#fafafa]/90 dark:from-[#1a1a1a]/90 dark:to-[#0a0a0a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[24px] sm:rounded-[32px] overflow-hidden">
            <CardContent className="py-16 sm:py-20 text-center">
              <div className="relative inline-block mb-6">
                <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-[#ccf381] mb-4" />
                <div className="absolute inset-0 bg-[#ccf381]/20 blur-3xl rounded-full" aria-hidden="true" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-3">
                {t("noBookings")}
              </h3>
              <p className="text-base sm:text-lg text-[#666] dark:text-[#aaa] mb-8 max-w-md mx-auto">
                {t("noBookingsDescription")}
              </p>
              <Link href={`/${locale}/tutors`}>
                <Button
                  size="lg"
                  className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-8 sm:px-10 py-5 sm:py-6 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:bg-[#222] dark:hover:bg-[#d4f89a] inline-flex items-center justify-center gap-2.5 sm:gap-3 group"
                >
                  <span>{t("browseTutors")}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
