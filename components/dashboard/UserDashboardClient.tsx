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
  Clock3,
  DollarSign,
  User,
  BookOpen,
  ArrowRight,
  Video,
  Sparkles,
  LogOut,
  Search,
  Star,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { slugify } from "@/lib/utils/slug";
import type { Booking, BookingStatus } from "@prisma/client";
import { PaymentButton } from "@/components/payment/PaymentButton";

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
  name?: string | null | undefined;
  email: string;
  image?: string | null | undefined;
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
  const tCommon = useTranslations("common");
  const tVideoCall = useTranslations("videoCall");
  const tPayment = useTranslations("payment");

  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      // NextAuth v5 signout - redirect to signout endpoint which handles everything
      window.location.href = `/api/auth/signout?callbackUrl=/${locale}`;
    } catch (error) {
      // Error handling - user will be redirected anyway
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

  // Check if session is ready to join (5 minutes before scheduled time)
  const canJoinSession = (scheduledAt: Date, status: BookingStatus, duration: number, callEndedAt?: Date | null) => {
    if (status !== "CONFIRMED") {
      return false;
    }
    
    // If tutor has ended the call, prevent rejoining
    if (callEndedAt) {
      return false;
    }
    
    const now = new Date();
    const sessionStart = new Date(scheduledAt);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 1000);
    
    // Only allow joining at the exact time or during the session, not before or after
    return now >= sessionStart && now <= sessionEnd;
  };

  const getStatusBadge = (status: BookingStatus, scheduledAt: Date, duration: number) => {
    const now = new Date();
    const sessionStart = new Date(scheduledAt);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 1000);
    const isPast = now > sessionEnd;
    
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50/80 dark:bg-yellow-950/80 backdrop-blur-sm text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 rounded-full px-3 py-1"
          >
            <Clock className="w-3 h-3 mr-1.5" />
            {isPast ? tBooking("past") : tBooking("upcoming")}
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50/80 dark:bg-green-950/80 backdrop-blur-sm text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 rounded-full px-3 py-1"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {isPast ? tBooking("past") : tBooking("upcoming")}
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
        {/* Welcome Section - Enhanced Design */}
        <div className="mb-16 sm:mb-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
            {/* Left: Welcome Text */}
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-md border border-green-500/20 dark:border-green-500/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-lg group hover:scale-105 transition-transform">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2.5 animate-pulse" />
                <span className="mr-2">{t("welcome")}</span>
                <Sparkles className="w-3 h-3 text-green-500 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.04em] mb-4 text-black dark:text-white">
                {t("title")}
                <br />
                <span className="relative inline-block mt-2">
                  <span className="inline-block bg-gradient-to-r from-[#ccf381] to-[#d4f89a] text-black px-4 py-2 -rotate-[-2deg] transform origin-center font-bold shadow-[0_8px_16px_rgba(204,243,129,0.3)] relative z-10">
                    {user.name?.split(" ")[0] || "there"}!
                  </span>
                  <span className="absolute inset-0 bg-[#ccf381]/30 blur-xl -rotate-[-2deg] transform origin-center" aria-hidden="true" />
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-[#666] dark:text-[#a1a1aa] max-w-2xl mb-8 font-light">
                {t("subtitle")}
              </p>

              {/* Quick Stats Pills */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-white/90 to-green-50/50 dark:from-[#1a1a1a]/90 dark:to-green-950/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/50 rounded-2xl text-sm font-bold text-black dark:text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="p-1.5 bg-green-500/20 dark:bg-green-500/10 rounded-lg">
                    <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>{totalBookings}</span>
                  <span className="text-xs font-medium text-[#666] dark:text-[#aaa] ml-1">{t("totalBookings")}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-white/90 to-blue-50/50 dark:from-[#1a1a1a]/90 dark:to-blue-950/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-800/50 rounded-2xl text-sm font-bold text-black dark:text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="p-1.5 bg-blue-500/20 dark:bg-blue-500/10 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>{upcomingBookings.length}</span>
                  <span className="text-xs font-medium text-[#666] dark:text-[#aaa] ml-1">{t("upcomingSessions")}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-white/90 to-purple-50/50 dark:from-[#1a1a1a]/90 dark:to-purple-950/20 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-800/50 rounded-2xl text-sm font-bold text-black dark:text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="p-1.5 bg-purple-500/20 dark:bg-purple-500/10 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>{completedSessions}</span>
                  <span className="text-xs font-medium text-[#666] dark:text-[#aaa] ml-1">{t("completedSessions")}</span>
                </div>
              </div>
            </div>

            {/* Right: User Avatar/Profile Card */}
            <div className="lg:w-80">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-green-50/30 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-green-950/20 border-2 border-[#e5e5e5] dark:border-[#262626] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_64px_rgba(34,197,94,0.15)] transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative z-10 p-8 text-center">
                  {user.image ? (
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-3 border-green-200/50 dark:border-green-800/50 shadow-xl ring-2 ring-green-100 dark:ring-green-900/50">
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-3 border-green-200/50 dark:border-green-800/50 flex items-center justify-center shadow-xl ring-2 ring-green-100 dark:ring-green-900/50">
                      <User className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-black dark:text-white mb-1">
                    {user.name || "Student"}
                  </h3>
                  <p className="text-sm text-[#666] dark:text-[#aaa] mb-4">
                    {user.email}
                  </p>
                  <Link href={`/${locale}/tutors`}>
                    <Button
                      size="lg"
                      className="w-full rounded-2xl bg-gradient-to-r from-[#111] to-[#222] dark:from-[#ccf381] dark:to-[#d4f89a] text-white dark:text-black px-6 py-6 text-base font-bold transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] hover:-translate-y-1 inline-flex items-center justify-center gap-3 group/btn"
                    >
                      <Search className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      {t("browseTutors")}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats Overview - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Bookings */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-green-50/30 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-green-950/20 border-2 border-[#e5e5e5] dark:border-[#262626] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_64px_rgba(34,197,94,0.15)] hover:border-green-400/50 dark:hover:border-green-600/50 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-2xl">
                  <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-2 border-green-500/30 dark:border-green-500/20 rounded-full px-3 py-1 text-xs font-bold">
                  Total
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#666] dark:text-[#aaa]">{t("totalBookings")}</p>
                <p className="text-4xl font-bold text-black dark:text-white">{totalBookings}</p>
                <p className="text-xs text-[#666] dark:text-[#aaa]">All time bookings</p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-blue-950/20 border-2 border-[#e5e5e5] dark:border-[#262626] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_64px_rgba(59,130,246,0.15)] hover:border-blue-400/50 dark:hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-2xl">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500/30 dark:border-blue-500/20 rounded-full px-3 py-1 text-xs font-bold">
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#666] dark:text-[#aaa]">{t("upcomingSessions")}</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{upcomingBookings.length}</p>
                <p className="text-xs text-[#666] dark:text-[#aaa]">Scheduled sessions</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Sessions */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-purple-950/20 border-2 border-[#e5e5e5] dark:border-[#262626] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_64px_rgba(168,85,247,0.15)] hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-2 border-purple-500/30 dark:border-purple-500/20 rounded-full px-3 py-1 text-xs font-bold">
                  Done
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#666] dark:text-[#aaa]">{t("completedSessions")}</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{completedSessions}</p>
                <p className="text-xs text-[#666] dark:text-[#aaa]">Finished sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings - Enhanced Design */}
        {upcomingBookings.length > 0 && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-2xl backdrop-blur-sm">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  {t("upcomingBookings")}
                </h2>
                <p className="text-sm text-[#666] dark:text-[#a1a1aa] ml-14">
                  {t("upcomingBookingsDescription")}
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border-2 border-green-500/30 dark:border-green-500/20 rounded-full px-6 py-2.5 text-base font-bold shadow-lg backdrop-blur-sm">
                {upcomingBookings.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => {
                const isToday = new Date(booking.scheduledAt).toDateString() === new Date().toDateString();
                const hoursUntil = Math.floor((new Date(booking.scheduledAt).getTime() - new Date().getTime()) / (1000 * 60 * 60));
                return (
                  <Card
                    key={booking.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-green-50/30 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-green-950/20 border-2 border-[#e5e5e5] dark:border-[#262626] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(34,197,94,0.15)] hover:border-green-400/50 dark:hover:border-green-600/50 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Time indicator badge */}
                    {isToday && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 rounded-full px-3 py-1 text-xs font-bold shadow-lg animate-pulse">
                          Today
                        </Badge>
                      </div>
                    )}
                    
                    <CardContent className="relative z-10 p-6">
                      <div className="flex items-start gap-5 mb-5">
                        {/* Tutor Avatar */}
                        <div className="relative shrink-0">
                          {booking.tutor.user.image ? (
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-3 border-green-200/50 dark:border-green-800/50 shadow-lg ring-2 ring-green-100 dark:ring-green-900/50">
                              <Image
                                src={booking.tutor.user.image}
                                alt={booking.tutor.user.name || t("tutorFallback")}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-3 border-green-200/50 dark:border-green-800/50 flex items-center justify-center shadow-lg ring-2 ring-green-100 dark:ring-green-900/50">
                              <User className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          {canJoinSession(booking.scheduledAt, booking.status, booking.duration, booking.callEndedAt) && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a] animate-pulse" />
                          )}
                        </div>

                        {/* Tutor Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                            {booking.tutor.user.name || t("tutorFallback")}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex text-[#ffb800]">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(booking.tutor.rating)
                                      ? "fill-[#ffb800] text-[#ffb800]"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-black dark:text-white">
                              {booking.tutor.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {booking.tutor.specialties.slice(0, 3).map((spec, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full px-3 py-1"
                              >
                                {spec}
                              </Badge>
                            ))}
                            {booking.tutor.specialties.length > 3 && (
                              <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
                                +{booking.tutor.specialties.length - 3}
                              </Badge>
                            )}
                          </div>
                          {isToday && hoursUntil <= 2 && (
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                              Starts in {hoursUntil === 0 ? "less than an hour" : `${hoursUntil} ${hoursUntil === 1 ? "hour" : "hours"}`}
                            </p>
                          )}
                          {getStatusBadge(booking.status, booking.scheduledAt, booking.duration)}
                        </div>
                      </div>

                      {/* Session Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="flex items-center gap-2.5 p-3 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm rounded-xl border border-[#e5e5e5] dark:border-[#262626]">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-[#666] dark:text-[#aaa] font-medium">Date</p>
                            <p className="text-sm font-bold text-black dark:text-white">{formatDate(booking.scheduledAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm rounded-xl border border-[#e5e5e5] dark:border-[#262626]">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-[#666] dark:text-[#aaa] font-medium">Time</p>
                            <p className="text-sm font-bold text-black dark:text-white">{formatTime(booking.scheduledAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm rounded-xl border border-[#e5e5e5] dark:border-[#262626]">
                          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Clock3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-[#666] dark:text-[#aaa] font-medium">Duration</p>
                            <p className="text-sm font-bold text-black dark:text-white">{booking.duration} {tBooking("min")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm rounded-xl border border-[#e5e5e5] dark:border-[#262626]">
                          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs text-[#666] dark:text-[#aaa] font-medium">Price</p>
                            <p className="text-sm font-bold text-black dark:text-white">${booking.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {booking.status === "CONFIRMED" && !booking.paymentId && (
                          <PaymentButton bookingId={booking.id} />
                        )}
                        {canJoinSession(booking.scheduledAt, booking.status, booking.duration, booking.callEndedAt) && (
                          <Link href={`/${locale}/sessions/${booking.id}`} className="flex-1">
                            <Button
                              size="lg"
                              className="w-full rounded-2xl bg-gradient-to-r from-[#111] to-[#222] dark:from-[#ccf381] dark:to-[#d4f89a] text-white dark:text-black px-6 py-6 text-base font-bold transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] hover:-translate-y-1 inline-flex items-center justify-center gap-3 group/btn"
                            >
                              <Video className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                              {tVideoCall("joinSession")}
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/${locale}/tutors/${slugify(booking.tutor.user.name || "")}`} className="flex-1">
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full rounded-2xl bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-[#111] dark:hover:border-[#ccf381] transition-all font-semibold"
                          >
                            {t("viewTutor")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Bookings - Enhanced Design */}
        {pastBookings.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-2xl backdrop-blur-sm">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t("pastSessions")}
                </h2>
                <p className="text-sm text-[#666] dark:text-[#a1a1aa] ml-14">
                  {t("pastSessionsDescription")}
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500/30 dark:border-blue-500/20 rounded-full px-6 py-2.5 text-base font-bold shadow-lg backdrop-blur-sm">
                {pastBookings.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastBookings.slice(0, 6).map((booking) => (
                <Card
                  key={booking.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-blue-950/10 border-2 border-[#e5e5e5] dark:border-[#262626] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)] hover:border-blue-400/50 dark:hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-1.5"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="relative z-10 p-5">
                    <div className="flex items-start gap-4 mb-4">
                      {booking.tutor.user.image ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-blue-200/50 dark:border-blue-800/50 shadow-md ring-1 ring-blue-100 dark:ring-blue-900/50 shrink-0">
                          <Image
                            src={booking.tutor.user.image}
                            alt={booking.tutor.user.name || t("tutorFallback")}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shadow-md ring-1 ring-blue-100 dark:ring-blue-900/50 shrink-0">
                          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-black dark:text-white mb-1.5 truncate">
                          {booking.tutor.user.name || t("tutorFallback")}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#666] dark:text-[#aaa] mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(booking.scheduledAt)}</span>
                        </div>
                        {getStatusBadge(booking.status, booking.scheduledAt, booking.duration)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5] dark:border-[#262626]">
                      <div>
                        <p className="text-xs text-[#666] dark:text-[#aaa] font-medium mb-1">Price</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${booking.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#666] dark:text-[#aaa] font-medium mb-1">Duration</p>
                        <p className="text-sm font-semibold text-black dark:text-white">
                          {booking.duration} {tBooking("min")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
            <AlertDialogDescription className="text-base text-[#666] dark:text-[#aaa] pt-2">
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
