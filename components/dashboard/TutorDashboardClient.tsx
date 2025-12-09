"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  Clock,
  User,
  DollarSign,
  Star,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  Clock3,
  Menu,
  X,
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
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const sections = [
    { id: "overview", label: tTutor("sections.overview"), icon: LayoutDashboard },
    { id: "sessions", label: tTutor("sections.sessions"), icon: BookOpen },
    { id: "calendar", label: tTutor("sections.calendar"), icon: CalendarDays },
    { id: "availability", label: tTutor("sections.availability"), icon: Clock3 },
    { id: "reviews", label: tTutor("sections.reviews"), icon: Star },
  ];

  return (
    <div className="relative min-h-screen pt-16 sm:pt-20">
      {/* Navigation Bar */}
      <header className="fixed top-0 z-[1000] w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-[rgba(250,250,250,0.85)] dark:bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] dark:border-[#262626]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Link
            href={`/${locale}`}
            className="font-bold text-lg sm:text-xl md:text-2xl tracking-[-0.03em] text-black dark:text-white hover:opacity-80 transition-opacity"
          >
            Linglix<span className="text-[#111] dark:text-[#ccf381]">.</span>
          </Link>
        </div>

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

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-64 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border-r border-[#e5e5e5] dark:border-[#262626] z-50 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                {user.image ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626]">
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center">
                    <User className="w-6 h-6 text-[#666] dark:text-[#aaa]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black dark:text-white truncate">
                    {user.name || tTutor("tutor")}
                  </p>
                  <p className="text-xs text-[#666] dark:text-[#a1a1aa] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              {getApprovalStatusBadge(tutorProfile.approvalStatus)}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#ccf381]/20 dark:bg-[#ccf381]/10 text-[#111] dark:text-[#ccf381] border border-[#ccf381]/30 dark:border-[#ccf381]/30 shadow-sm backdrop-blur-sm"
                        : "text-[#666] dark:text-[#a1a1aa] hover:bg-white/60 dark:hover:bg-[#262626]/60 hover:text-black dark:hover:text-white backdrop-blur-sm"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#ccf381]" : ""}`} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#262626]">
              <Link href={`/${locale}`}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">

            {/* Section Content */}
            {activeSection === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Hero Summary Card */}
                <Card className="relative bg-gradient-to-br from-white via-white to-[#fafafa] dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 border-2 border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.1)] overflow-hidden mb-8 sm:mb-12">
                  {/* Background Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7928ca]/5 via-transparent to-[#ccf381]/5 opacity-50" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
                      {/* Left Side - Main Stats */}
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccf381]/10 dark:bg-[#ccf381]/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                          <Sparkles className="w-3 h-3 text-[#ccf381]" />
                          <span>Dashboard Overview</span>
                        </div>
                        
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-4 text-black dark:text-white">
                          Welcome back,
                          <br />
                          <span className="relative inline-block mt-2">
                            <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-4 py-2 -rotate-[-2deg] transform origin-center font-bold shadow-[0_4px_8px_rgba(0,0,0,0.1)] relative z-10">
                              {user.name || tTutor("tutor")}
                            </span>
                            <span className="absolute inset-0 bg-[#ffeb3b]/20 dark:bg-[#ccf381]/20 blur-xl -rotate-[-2deg] transform origin-center" aria-hidden="true" />
                          </span>
                        </h2>
                        
                        <p className="text-lg sm:text-xl text-[#666] dark:text-[#a1a1aa] mb-8 max-w-2xl">
                          {totalSessions === 0 
                            ? tTutor("noSessionsDescription")
                            : `You've completed ${totalSessions} ${totalSessions === 1 ? 'session' : 'sessions'} with ${totalStudents} ${totalStudents === 1 ? 'student' : 'students'} and earned $${totalEarnings.toFixed(2)}`}
                        </p>

                        {/* Quick Stats Pills */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>${totalEarnings.toFixed(2)}</span>
                          </div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>{totalSessions} Sessions</span>
                          </div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{averageRating > 0 ? averageRating.toFixed(1) : "0.0"} Rating</span>
                          </div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white">
                            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>{totalStudents} Students</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Visual Stats */}
                      <div className="lg:w-80 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-black dark:text-white mb-1">
                              {upcomingBookings.length}
                            </div>
                            <div className="text-xs text-[#666] dark:text-[#a1a1aa] uppercase tracking-wide">
                              Upcoming
                            </div>
                          </div>
                          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-black dark:text-white mb-1">
                              {reviews.length}
                            </div>
                            <div className="text-xs text-[#666] dark:text-[#a1a1aa] uppercase tracking-wide">
                              Reviews
                            </div>
                          </div>
                        </div>
                        {averageRating > 0 && (
                          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-2xl p-6 text-center">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < Math.round(averageRating)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-2xl font-bold text-black dark:text-white">
                              {averageRating.toFixed(1)}
                            </div>
                            <div className="text-xs text-[#666] dark:text-[#a1a1aa] mt-1">
                              Average Rating
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeSection === "sessions" && (
              <div className="space-y-6">

                {/* Upcoming Sessions */}
                {upcomingBookings.length > 0 && (
              <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] sm:rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-black dark:text-white">
                      {tTutor("upcomingSessions")}
                    </CardTitle>
                    <Badge variant="outline" className="rounded-md bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30">
                      {upcomingBookings.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingBookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="block p-4 sm:p-5 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {booking.student.image ? (
                              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#e5e5e5] dark:border-[#262626] flex-shrink-0">
                                <Image
                                  src={booking.student.image}
                                  alt={booking.student.name || tTutor("student")}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-[#666] dark:text-[#aaa]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-black dark:text-white mb-1">
                                {booking.student.name || tTutor("student")}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#666] dark:text-[#aaa]">
                                <span>{formatDate(booking.scheduledAt)}</span>
                                <span>•</span>
                                <span>{formatTime(booking.scheduledAt)}</span>
                                <span>•</span>
                                <span>{booking.duration} {tBooking("min")}</span>
                                <span>•</span>
                                <span className="font-medium text-black dark:text-white">${booking.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
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
              <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] sm:rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-black dark:text-white">
                      {tTutor("pastSessions")}
                    </CardTitle>
                    <Badge variant="outline" className="rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                      {pastBookings.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pastBookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 sm:p-5 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-xl hover:border-[#ccf381] dark:hover:border-[#ccf381]/50 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {booking.student.image ? (
                              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#e5e5e5] dark:border-[#262626] flex-shrink-0">
                                <Image
                                  src={booking.student.image}
                                  alt={booking.student.name || tTutor("student")}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-[#666] dark:text-[#aaa]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-black dark:text-white mb-1">
                                {booking.student.name || tTutor("student")}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#666] dark:text-[#aaa]">
                                <span>{formatDate(booking.scheduledAt)}</span>
                                {booking.videoSession?.review && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                      <span>{booking.videoSession.review.rating}/5</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
                )}
              </div>
            )}

            {activeSection === "calendar" && (
              <div className="space-y-6">
                <AvailabilityCalendar
                  bookings={[...upcomingBookings, ...pastBookings]}
                />
              </div>
            )}

            {activeSection === "availability" && (
              <div>
                <AvailabilityManager locale={locale} />
              </div>
            )}

            {activeSection === "reviews" && (
              <div>
                {reviews.length > 0 ? (
                  <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] sm:rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-black dark:text-white">
                    {tTutor("reviews")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                            <div
                              key={review.id}
                              className="p-4 sm:p-5 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-xl hover:shadow-md transition-all duration-200"
                            >
                        <div className="flex items-start gap-3">
                          {review.student.image ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#e5e5e5] dark:border-[#262626] flex-shrink-0">
                              <Image
                                src={review.student.image}
                                alt={review.student.name || tTutor("student")}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-[#666] dark:text-[#aaa]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-black dark:text-white truncate">
                                {review.student.name || tTutor("student")}
                              </h4>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-xs text-[#666] dark:text-[#aaa] line-clamp-2">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
                ) : (
                  <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] sm:rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <CardContent className="py-12 sm:py-16 text-center">
                      <Star className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[#666] dark:text-[#aaa] mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white mb-2">
                        No Reviews Yet
                      </h3>
                      <p className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa]">
                        Reviews from your students will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Empty State - Only show if no bookings at all in overview */}
            {activeSection === "overview" && upcomingBookings.length === 0 && pastBookings.length === 0 && (
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] sm:rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <CardContent className="py-12 sm:py-16 text-center">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[#666] dark:text-[#aaa] mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white mb-2">
                {tTutor("noSessions")}
              </h3>
              <p className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa] max-w-md mx-auto">
                {tTutor("noSessionsDescription")}
              </p>
            </CardContent>
          </Card>
            )}
          </div>
        </main>
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

