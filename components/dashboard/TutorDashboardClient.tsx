"use client";

import { useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  LogOut,
  Award,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import type { Booking, BookingStatus, TutorProfile, TutorApprovalStatus, Review } from "@prisma/client";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { AvailabilityManager } from "./AvailabilityManager";

/**
 * Tutor Dashboard Client Component
 * 
 * Production-ready tutor dashboard with:
 * - Earnings and statistics
 * - Upcoming and past sessions
 * - Student management
 * - Reviews and ratings
 * - Profile status
 * - Polished UI matching landing page style
 */
interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface StudentUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface BookingWithStudent extends Booking {
  student: StudentUser;
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

interface ReviewWithStudent extends Review {
  student: StudentUser;
}

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

interface TutorProfileWithBookings extends TutorProfile {
  bookings: BookingWithStudent[];
  availability: Availability[];
}

interface TutorDashboardClientProps {
  locale: string;
  user: User;
  tutorProfile: TutorProfileWithBookings;
  upcomingBookings: BookingWithStudent[];
  pastBookings: BookingWithStudent[];
  totalEarnings: number;
  reviews: ReviewWithStudent[];
  availability: Availability[];
}

export function TutorDashboardClient({
  locale,
  user,
  tutorProfile,
  upcomingBookings,
  pastBookings,
  totalEarnings,
  reviews,
  availability,
}: TutorDashboardClientProps) {
  const t = useTranslations("dashboard");
  const tTutor = useTranslations("dashboard.tutor");
  const tBooking = useTranslations("booking");
  const tCommon = useTranslations("common");

  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      window.location.href = `/api/auth/signout?callbackUrl=/${locale}`;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to sign out:", error);
      }
    }
  };

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

  const getApprovalStatusBadge = (status: TutorApprovalStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/50 rounded-full px-4 py-1.5">
            <Clock className="w-3 h-3 mr-1.5" />
            {tTutor("status.pending")}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50 rounded-full px-4 py-1.5">
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {tTutor("status.approved")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/50 rounded-full px-4 py-1.5">
            <XCircle className="w-3 h-3 mr-1.5" />
            {tTutor("status.rejected")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const completedSessions = pastBookings.filter((b) => b.status === "COMPLETED").length;
  const totalSessions = tutorProfile.totalSessions || completedSessions;
  const averageRating = tutorProfile.rating || 0;
  const totalStudents = new Set(pastBookings.map((b) => b.studentId)).size;

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
          <Button
            variant="outline"
            onClick={() => setShowSignOutDialog(true)}
            className="flex items-center gap-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full hover:border-red-500 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{tCommon("signOut")}</span>
          </Button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
        {/* Welcome Section */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] group hover:scale-105 transition-transform">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ccf381] rounded-full mr-2 sm:mr-2.5 animate-pulse" />
            <span className="mr-1.5 sm:mr-2 text-[10px] sm:text-xs">{tTutor("welcome")}</span>
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ccf381] opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>

          <h1 className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[88px] xl:text-[100px] leading-[0.92] font-bold tracking-[-0.04em] mb-6 sm:mb-8 text-black dark:text-white px-2">
            {tTutor("title")}
            <br />
            <span className="relative inline-block mt-1 sm:mt-2">
              <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rotate-2 transform origin-center font-bold shadow-[0_4px_8px_rgba(0,0,0,0.1)] sm:shadow-[0_6px_12px_rgba(0,0,0,0.12)] relative z-10 text-[28px] sm:text-[36px] md:text-[44px] lg:text-[85px] xl:text-[95px]">
                {user.name || tTutor("tutor")}
              </span>
              <span className="absolute inset-0 bg-[#ffeb3b]/20 dark:bg-[#ccf381]/20 blur-xl rotate-2 transform origin-center" aria-hidden="true" />
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[600px] mb-6 sm:mb-8 px-4">
            {tTutor("subtitle")}
          </p>

          {/* Approval Status */}
          {tutorProfile.approvalStatus === "PENDING" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50/80 dark:bg-yellow-950/80 border border-yellow-200 dark:border-yellow-800 rounded-full text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              <AlertCircle className="w-4 h-4" />
              {tTutor("status.pendingMessage")}
            </div>
          )}

          {tutorProfile.approvalStatus === "REJECTED" && tutorProfile.rejectionReason && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50/80 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-full text-sm text-red-700 dark:text-red-300 mb-4 max-w-2xl">
              <AlertCircle className="w-4 h-4" />
              <span>{tTutor("status.rejectedMessage")}: {tutorProfile.rejectionReason}</span>
            </div>
          )}

          {getApprovalStatusBadge(tutorProfile.approvalStatus)}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Total Earnings */}
          <Card className="bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a1a]/95 dark:to-[#0a0a0a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 dark:bg-green-500/10 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#666] dark:text-[#a1a1aa] font-medium">
                  {tTutor("stats.totalEarnings")}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                  ${totalEarnings.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Sessions */}
          <Card className="bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a1a]/95 dark:to-[#0a0a0a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 dark:bg-blue-500/10 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#666] dark:text-[#a1a1aa] font-medium">
                  {tTutor("stats.totalSessions")}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                  {totalSessions}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a1a]/95 dark:to-[#0a0a0a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 dark:bg-yellow-500/10 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#666] dark:text-[#a1a1aa] font-medium">
                  {tTutor("stats.averageRating")}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                  </p>
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Students */}
          <Card className="bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a1a]/95 dark:to-[#0a0a0a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 dark:bg-purple-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#666] dark:text-[#a1a1aa] font-medium">
                  {tTutor("stats.totalStudents")}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                  {totalStudents}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar and Availability Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Calendar */}
          <AvailabilityCalendar
            bookings={[...upcomingBookings, ...pastBookings]}
            locale={locale}
          />

          {/* Availability Manager */}
          <AvailabilityManager locale={locale} />
        </div>

        {/* Upcoming Sessions */}
        {upcomingBookings.length > 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[24px] sm:rounded-[32px] overflow-hidden mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                {tTutor("upcomingSessions")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#a1a1aa] text-base">
                {tTutor("upcomingSessionsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 sm:p-8 bg-gradient-to-br from-white/60 to-[#fafafa]/60 dark:from-[#0a0a0a]/60 dark:to-[#1a1a1a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          {booking.student.image ? (
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626]">
                              <Image
                                src={booking.student.image}
                                alt={booking.student.name || tTutor("student")}
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
                              {booking.student.name || tTutor("student")}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#666] dark:text-[#aaa]">
                              {booking.student.email}
                            </p>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Sessions */}
        {pastBookings.length > 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[24px] sm:rounded-[32px] overflow-hidden mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                {tTutor("pastSessions")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#a1a1aa] text-base">
                {tTutor("pastSessionsDescription")}
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
                          {booking.student.image ? (
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626]">
                              <Image
                                src={booking.student.image}
                                alt={booking.student.name || tTutor("student")}
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
                              {booking.student.name || tTutor("student")}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#666] dark:text-[#aaa]">
                              {booking.student.email}
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
                          {booking.videoSession?.review && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{booking.videoSession.review.rating}/5</span>
                            </div>
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

        {/* Reviews */}
        {reviews.length > 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[24px] sm:rounded-[32px] overflow-hidden mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                {tTutor("reviews")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#a1a1aa] text-base">
                {tTutor("reviewsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 bg-gradient-to-br from-white/60 to-[#fafafa]/60 dark:from-[#0a0a0a]/60 dark:to-[#1a1a1a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-[20px]"
                  >
                    <div className="flex items-start gap-4">
                      {review.student.image ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626] flex-shrink-0">
                          <Image
                            src={review.student.image}
                            alt={review.student.name || tTutor("student")}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ccf381]/20 to-[#7928ca]/20 border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-[#ccf381]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-black dark:text-white">
                            {review.student.name || tTutor("student")}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-[#666] dark:text-[#aaa]">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty States */}
        {upcomingBookings.length === 0 && pastBookings.length === 0 && (
          <Card className="bg-gradient-to-br from-white/90 to-[#fafafa]/90 dark:from-[#1a1a1a]/90 dark:to-[#0a0a0a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[24px] sm:rounded-[32px] overflow-hidden">
            <CardContent className="py-16 sm:py-20 text-center">
              <div className="relative inline-block mb-6">
                <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-[#ccf381] mb-4" />
                <div className="absolute inset-0 bg-[#ccf381]/20 blur-3xl rounded-full" aria-hidden="true" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-3">
                {tTutor("noSessions")}
              </h3>
              <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] mb-8 max-w-md mx-auto">
                {tTutor("noSessionsDescription")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/20 dark:bg-red-500/10 rounded-xl">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                {t("signOutConfirmTitle")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-[#666] dark:text-[#a1a1aa] pt-2">
              {t("signOutConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
            <AlertDialogCancel
              className="w-full sm:w-auto bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors"
            >
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 hover:shadow-[0_12px_24px_rgba(239,68,68,0.3)] inline-flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {tCommon("signOut")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

