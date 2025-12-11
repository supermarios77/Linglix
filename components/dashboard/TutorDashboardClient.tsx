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
  Video,
  AlertCircle,
  TrendingUp,
  Calendar,
  MessageSquare,
  BarChart3,
  TrendingDown,
  Zap,
  Bell,
} from "lucide-react";
import Image from "next/image";
import type { Booking, BookingStatus, TutorProfile, TutorApprovalStatus, Review } from "@prisma/client";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { AvailabilityManager } from "./AvailabilityManager";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

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
  name?: string | null | undefined;
  email: string;
  image?: string | null | undefined;
  role: string;
}

interface StudentUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface BookingWithStudent extends Booking {
  student: StudentUser;
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
  pendingBookings: BookingWithStudent[];
  upcomingBookings: BookingWithStudent[];
  pastBookings: BookingWithStudent[];
  totalEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  totalStudents: number;
  reviews: ReviewWithStudent[];
  availability: Availability[];
}

export function TutorDashboardClient({
  locale,
  user,
  tutorProfile,
  pendingBookings,
  upcomingBookings,
  pastBookings,
  totalEarnings,
  thisWeekEarnings,
  thisMonthEarnings,
  totalStudents,
  reviews,
  availability,
}: TutorDashboardClientProps) {
  const t = useTranslations("dashboard");
  const tTutor = useTranslations("dashboard.tutor");
  const tBooking = useTranslations("booking");
  const tCommon = useTranslations("common");
  const tVideoCall = useTranslations("videoCall");

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

  // Check if session is ready to join (5 minutes before scheduled time)
  const canJoinSession = (scheduledAt: Date, status: BookingStatus) => {
    if (status !== "CONFIRMED") {
      return false;
    }
    const now = new Date();
    const sessionTime = new Date(scheduledAt);
    // Allow joining 5 minutes before session starts
    const joinTime = new Date(sessionTime.getTime() - 5 * 60 * 1000);
    return now >= joinTime;
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
          <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700 rounded-md px-2.5 py-1 text-xs font-medium">
            <Clock className="w-3 h-3 mr-1.5" />
            {tTutor("status.pending")}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 rounded-md px-2.5 py-1 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {tTutor("status.approved")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-md px-2.5 py-1 text-xs font-medium">
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

  // Get all bookings and completed bookings first (needed for chart functions)
  const allBookings = [...pendingBookings, ...upcomingBookings, ...pastBookings];
  const completedBookings = pastBookings.filter((b) => b.status === "COMPLETED");

  // Get today's sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todaysSessions = upcomingBookings.filter((booking) => {
    const bookingDate = new Date(booking.scheduledAt);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === today.getTime();
  });

  // Prepare earnings chart data (last 7 days)
  const prepareEarningsChartData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayEarnings = completedBookings
        .filter((b) => {
          const bookingDate = new Date(b.scheduledAt);
          return bookingDate >= date && bookingDate < nextDay;
        })
        .reduce((sum, b) => sum + b.price, 0);
      
      days.push({
        date: date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric" }),
        earnings: dayEarnings,
      });
    }
    return days;
  };

  const earningsChartData = prepareEarningsChartData();

  // Prepare sessions chart data (last 7 days)
  const prepareSessionsChartData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const daySessions = completedBookings.filter((b) => {
        const bookingDate = new Date(b.scheduledAt);
        return bookingDate >= date && bookingDate < nextDay;
      }).length;
      
      days.push({
        date: date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric" }),
        sessions: daySessions,
      });
    }
    return days;
  };

  const sessionsChartData = prepareSessionsChartData();

  // Get unique students list
  const uniqueStudents = Array.from(
    new Map(
      allBookings
        .filter((b) => b.student)
        .map((b) => [b.studentId, b.student])
    ).values()
  ).slice(0, 10);

  // Handle booking approval/rejection
  const handleBookingAction = async (bookingId: string, action: "confirm" | "cancel") => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "confirm" ? "CONFIRMED" : "CANCELLED",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update booking");
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error updating booking:", error);
      }
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update booking. Please try again."
      );
    }
  };

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
      <header className="fixed top-0 z-[1000] w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-white dark:bg-[#0a0a0a] border-b border-[#e5e5e5] dark:border-[#1a1a1a]">
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
          className={`fixed left-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-64 bg-white dark:bg-[#0a0a0a] border-r border-[#e5e5e5] dark:border-[#1a1a1a] z-50 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-5 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="mb-6 pb-6 border-b border-[#e5e5e5] dark:border-[#1a1a1a]">
              <div className="flex items-center gap-3 mb-3">
                {user.image ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#e5e5e5] dark:border-[#262626]">
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center">
                    <User className="w-6 h-6 text-[#666] dark:text-[#666]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black dark:text-white truncate">
                    {user.name || tTutor("tutor")}
                  </p>
                  <p className="text-xs text-[#666] dark:text-[#888] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex justify-start">
                {getApprovalStatusBadge(tutorProfile.approvalStatus)}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
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
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#ccf381] text-black font-medium"
                        : "text-[#666] dark:text-[#888] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-[#666] dark:text-[#888] group-hover:text-black dark:group-hover:text-white"}`} />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="pt-4 mt-auto border-t border-[#e5e5e5] dark:border-[#1a1a1a]">
              <Link href={`/${locale}`}>
                <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#666] dark:text-[#888] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">

            {/* Section Content */}
            {activeSection === "overview" && (
              <div className="space-y-8 sm:space-y-10">
                {/* Header with Welcome and Key Stats */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                      <span className="w-2 h-2 bg-[#ccf381] rounded-full animate-pulse" />
                      <span>Dashboard</span>
                      <Sparkles className="w-3 h-3 text-[#ccf381] opacity-70" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.04em] text-black dark:text-white mb-3">
                      Welcome back,
                      <br />
                      <span className="relative inline-block mt-2">
                        <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-4 py-2 -rotate-[-2deg] transform origin-center font-bold shadow-[0_4px_8px_rgba(0,0,0,0.1)] relative z-10">
                          {user.name || tTutor("tutor")}
                        </span>
                        <span className="absolute inset-0 bg-[#ffeb3b]/20 dark:bg-[#ccf381]/20 blur-xl -rotate-[-2deg] transform origin-center" aria-hidden="true" />
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] font-light mt-4">
                      {new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { 
                        weekday: "long", 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-6 py-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
                      <div className="text-xs text-[#666] dark:text-[#aaa] mb-1.5 uppercase tracking-wide">Total Earnings</div>
                      <div className="text-2xl font-bold text-black dark:text-white">${totalEarnings.toFixed(2)}</div>
                    </div>
                    <div className="px-6 py-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
                      <div className="text-xs text-[#666] dark:text-[#aaa] mb-1.5 uppercase tracking-wide">Total Sessions</div>
                      <div className="text-2xl font-bold text-black dark:text-white">{totalSessions}</div>
                    </div>
                    <div className="px-6 py-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
                      <div className="text-xs text-[#666] dark:text-[#aaa] mb-1.5 uppercase tracking-wide">Rating</div>
                      <div className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="group relative bg-gradient-to-br from-green-50 via-green-50/80 to-white dark:from-green-950/20 dark:via-green-900/10 dark:to-[#1a1a1a] border-2 border-green-200 dark:border-green-800 rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/20 dark:bg-green-500/10 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs text-green-700 dark:text-green-300 font-semibold uppercase tracking-wide">This Week</span>
                      </div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">${thisWeekEarnings.toFixed(2)}</div>
                      <div className="text-sm text-green-700/70 dark:text-green-300/70">Earnings</div>
                    </div>
                  </Card>

                  <Card className="group relative bg-gradient-to-br from-blue-50 via-blue-50/80 to-white dark:from-blue-950/20 dark:via-blue-900/10 dark:to-[#1a1a1a] border-2 border-blue-200 dark:border-blue-800 rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 dark:bg-blue-500/10 rounded-xl">
                          <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wide">This Month</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">${thisMonthEarnings.toFixed(2)}</div>
                      <div className="text-sm text-blue-700/70 dark:text-blue-300/70">Earnings</div>
                    </div>
                  </Card>

                  <Card className="group relative bg-gradient-to-br from-purple-50 via-purple-50/80 to-white dark:from-purple-950/20 dark:via-purple-900/10 dark:to-[#1a1a1a] border-2 border-purple-200 dark:border-purple-800 rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 dark:bg-purple-500/10 rounded-xl">
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wide">Students</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">{totalStudents}</div>
                      <div className="text-sm text-purple-700/70 dark:text-purple-300/70">Total</div>
                    </div>
                  </Card>

                  <Card className="group relative bg-gradient-to-br from-orange-50 via-orange-50/80 to-white dark:from-orange-950/20 dark:via-orange-900/10 dark:to-[#1a1a1a] border-2 border-orange-200 dark:border-orange-800 rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/20 dark:bg-orange-500/10 rounded-xl">
                          <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-xs text-orange-700 dark:text-orange-300 font-semibold uppercase tracking-wide">Upcoming</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">{upcomingBookings.length}</div>
                      <div className="text-sm text-orange-700/70 dark:text-orange-300/70">Sessions</div>
                    </div>
                  </Card>
                </div>

                {/* Pending Bookings - Priority Section */}
                {pendingBookings.length > 0 && (
                  <Card className="group relative bg-gradient-to-br from-yellow-50/90 via-yellow-50/70 to-white dark:from-yellow-950/30 dark:via-yellow-950/15 dark:to-[#1a1a1a] rounded-[32px] p-8 sm:p-10 border-2 border-yellow-200 dark:border-yellow-800 shadow-[0_8px_24px_rgba(234,179,8,0.15)] hover:shadow-[0_20px_48px_rgba(234,179,8,0.2)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-yellow-500/20 dark:bg-yellow-500/10 rounded-2xl">
                            <AlertCircle className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-black dark:text-white mb-2">
                              {tTutor("pendingBookings") || "Pending Bookings"}
                            </h2>
                            <p className="text-base text-[#666] dark:text-[#aaa] font-light">
                              {pendingBookings.length} {pendingBookings.length === 1 ? "booking" : "bookings"} awaiting your approval
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-500/50 rounded-full px-5 py-2 text-sm font-bold shadow-lg">
                          {pendingBookings.length}
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        {pendingBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className="group/booking p-5 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl hover:border-yellow-400 dark:hover:border-yellow-600 hover:shadow-lg transition-all duration-300"
                          >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {booking.student.image ? (
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-200 dark:border-yellow-800 flex-shrink-0">
                                  <Image
                                    src={booking.student.image}
                                    alt={booking.student.name || "Student"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border-2 border-yellow-200 dark:border-yellow-800 flex items-center justify-center flex-shrink-0">
                                  <User className="w-6 h-6 text-[#666] dark:text-[#aaa]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-black dark:text-white mb-1">
                                  {booking.student.name || "Student"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-[#666] dark:text-[#aaa] mb-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(booking.scheduledAt)}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(booking.scheduledAt)}
                                  </span>
                                  <span>•</span>
                                  <span>{booking.duration} {tBooking("min")}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-black dark:text-white">${booking.price.toFixed(2)}</span>
                                </div>
                                {booking.notes && (
                                  <p className="text-sm text-[#666] dark:text-[#aaa] line-clamp-2">
                                    <MessageSquare className="w-3 h-3 inline mr-1" />
                                    {booking.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleBookingAction(booking.id, "confirm")}
                                className="rounded-full bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-[0_8px_16px_rgba(22,163,74,0.3)] hover:-translate-y-0.5"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {tTutor("approve") || "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBookingAction(booking.id, "cancel")}
                                className="rounded-full border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {tTutor("reject") || "Reject"}
                              </Button>
                            </div>
                          </div>
                        </div>
                        ))}
                        {pendingBookings.length > 3 && (
                          <div className="text-center pt-4">
                            <p className="text-sm font-medium text-[#666] dark:text-[#aaa]">
                              +{pendingBookings.length - 3} more {pendingBookings.length - 3 === 1 ? "booking" : "bookings"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Today's Sessions - Prominent Section */}
                {todaysSessions.length > 0 && (
                  <Card className="group relative bg-gradient-to-br from-blue-50/90 via-blue-50/70 to-white dark:from-blue-950/30 dark:via-blue-950/15 dark:to-[#1a1a1a] rounded-[32px] p-8 sm:p-10 border-2 border-blue-200 dark:border-blue-800 shadow-[0_8px_24px_rgba(59,130,246,0.15)] hover:shadow-[0_20px_48px_rgba(59,130,246,0.2)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/20 dark:bg-blue-500/10 rounded-2xl">
                            <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-black dark:text-white mb-2">
                              {tTutor("todaysSessions") || "Today's Sessions"}
                            </h2>
                            <p className="text-base text-[#666] dark:text-[#aaa] font-light">
                              {todaysSessions.length} {todaysSessions.length === 1 ? "session" : "sessions"} scheduled for today
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500/50 rounded-full px-5 py-2 text-sm font-bold shadow-lg">
                          {todaysSessions.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {todaysSessions.map((booking) => (
                          <div
                            key={booking.id}
                            className="group/session p-6 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-2 border-blue-200 dark:border-blue-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300"
                          >
                          <div className="flex items-start gap-3">
                            {booking.student.image ? (
                              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-800 shrink-0">
                                <Image
                                  src={booking.student.image}
                                  alt={booking.student.name || "Student"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-[#666] dark:text-[#aaa]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-black dark:text-white mb-1">
                                {booking.student.name || "Student"}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#aaa] mb-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(booking.scheduledAt)}</span>
                                <span>•</span>
                                <span>{booking.duration} {tBooking("min")}</span>
                              </div>
                              {canJoinSession(booking.scheduledAt, booking.status) && (
                                <Link href={`/${locale}/sessions/${booking.id}`}>
                                  <Button
                                    size="sm"
                                    className="rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-[#222] dark:hover:bg-[#d4f89a] hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 inline-flex items-center gap-2"
                                  >
                                    <Video className="w-4 h-4" />
                                    {tVideoCall("joinSession")}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Stats and Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Earnings Chart */}
                  <Card className="group relative bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold tracking-[-0.02em] text-black dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 dark:bg-green-500/10 rounded-xl">
                              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            Earnings (Last 7 Days)
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={earningsChartData}>
                          <defs>
                            <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-[#262626]" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#666" 
                            className="dark:stroke-[#aaa]"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#666" 
                            className="dark:stroke-[#aaa]"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "1px solid #e5e5e5",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#earningsGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      </CardContent>
                    </div>
                  </Card>

                  {/* Sessions Chart */}
                  <Card className="group relative bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold tracking-[-0.02em] text-black dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 dark:bg-blue-500/10 rounded-xl">
                              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            Sessions (Last 7 Days)
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={sessionsChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-[#262626]" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#666" 
                            className="dark:stroke-[#aaa]"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#666" 
                            className="dark:stroke-[#aaa]"
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "1px solid #e5e5e5",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "sessions" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <span className="w-2 h-2 bg-[#ccf381] rounded-full animate-pulse" />
                    <span>Sessions</span>
                    <Sparkles className="w-3 h-3 text-[#ccf381] opacity-70" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.04em] text-black dark:text-white mb-3">
                    {tTutor("sections.sessions")}
                  </h1>
                  <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] font-light">
                    Manage your teaching sessions
                  </p>
                </div>

                {/* Upcoming Sessions */}
                {upcomingBookings.length > 0 ? (
                  <Card className="group relative bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl font-bold tracking-[-0.02em] text-black dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 dark:bg-green-500/10 rounded-xl">
                              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            {tTutor("upcomingSessions")}
                          </CardTitle>
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-2 border-green-500/50 rounded-full px-5 py-2 text-sm font-bold shadow-lg">
                            {upcomingBookings.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {upcomingBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="group/booking p-6 bg-gradient-to-br from-green-50/60 to-white dark:from-green-950/15 dark:to-[#0a0a0a]/60 backdrop-blur-md border-2 border-green-200 dark:border-green-800 rounded-2xl hover:border-green-400 dark:hover:border-green-600 hover:shadow-[0_12px_24px_rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300"
                            >
                            <div className="flex items-start gap-4">
                              {booking.student.image ? (
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-green-200 dark:border-green-800 shrink-0">
                                  <Image
                                    src={booking.student.image}
                                    alt={booking.student.name || tTutor("student")}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border-2 border-green-200 dark:border-green-800 flex items-center justify-center shrink-0">
                                  <User className="w-7 h-7 text-[#666] dark:text-[#aaa]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-black dark:text-white mb-2">
                                  {booking.student.name || tTutor("student")}
                                </h3>
                                <div className="space-y-1.5 mb-3">
                                  <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#aaa]">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(booking.scheduledAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#aaa]">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTime(booking.scheduledAt)}</span>
                                    <span>•</span>
                                    <span>{booking.duration} {tBooking("min")}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-300">
                                    <DollarSign className="w-4 h-4" />
                                    <span>${booking.price.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(booking.status)}
                                  {canJoinSession(booking.scheduledAt, booking.status) && (
                                    <Link href={`/${locale}/sessions/${booking.id}`}>
                                      <Button
                                        size="sm"
                                        className="rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-[#222] dark:hover:bg-[#d4f89a] hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 inline-flex items-center gap-2"
                                      >
                                        <Video className="w-4 h-4" />
                                        {tVideoCall("joinSession")}
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <CardContent className="py-16 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                        No Upcoming Sessions
                      </h3>
                      <p className="text-base text-[#666] dark:text-[#a1a1aa] font-light">
                        You don't have any upcoming sessions scheduled
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Past Sessions */}
                {pastBookings.length > 0 && (
                  <Card className="group relative bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl font-bold tracking-[-0.02em] text-black dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 dark:bg-blue-500/10 rounded-xl">
                              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            {tTutor("pastSessions")}
                          </CardTitle>
                          <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500/50 rounded-full px-5 py-2 text-sm font-bold shadow-lg">
                            {pastBookings.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {pastBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="group/past p-5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-2xl hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                            <div className="flex items-start gap-3 mb-3">
                              {booking.student.image ? (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#e5e5e5] dark:border-[#262626] shrink-0">
                                  <Image
                                    src={booking.student.image}
                                    alt={booking.student.name || tTutor("student")}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center shrink-0">
                                  <User className="w-5 h-5 text-[#666] dark:text-[#aaa]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                                  {booking.student.name || tTutor("student")}
                                </h3>
                                <div className="text-xs text-[#666] dark:text-[#aaa]">
                                  {formatDate(booking.scheduledAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-black dark:text-white">
                                ${booking.price.toFixed(2)}
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeSection === "calendar" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <span className="w-2 h-2 bg-[#ccf381] rounded-full animate-pulse" />
                    <span>Calendar</span>
                    <Sparkles className="w-3 h-3 text-[#ccf381] opacity-70" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.04em] text-black dark:text-white mb-3">
                    {tTutor("sections.calendar")}
                  </h1>
                  <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] font-light">
                    View all your sessions in calendar format
                  </p>
                </div>

                <Card className="group relative bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <CardContent className="p-8">
                      <AvailabilityCalendar
                        bookings={[...upcomingBookings, ...pastBookings]}
                      />
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {activeSection === "availability" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <span className="w-2 h-2 bg-[#ccf381] rounded-full animate-pulse" />
                    <span>Availability</span>
                    <Sparkles className="w-3 h-3 text-[#ccf381] opacity-70" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.04em] text-black dark:text-white mb-3">
                    {tTutor("sections.availability")}
                  </h1>
                  <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] font-light">
                    Set your weekly availability schedule
                  </p>
                </div>

                <Card className="group relative bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <CardContent className="p-8">
                      <AvailabilityManager locale={locale} />
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {activeSection === "reviews" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <span className="w-2 h-2 bg-[#ccf381] rounded-full animate-pulse" />
                    <span>Reviews</span>
                    <Sparkles className="w-3 h-3 text-[#ccf381] opacity-70" />
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.04em] text-black dark:text-white mb-3">
                        {tTutor("sections.reviews")}
                      </h1>
                      <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa] font-light">
                        What your students are saying about you
                      </p>
                    </div>
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 ${
                                i < Math.round(averageRating)
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="ml-2">
                          <div className="text-2xl font-bold text-black dark:text-white">
                            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                          </div>
                          <div className="text-xs text-[#666] dark:text-[#aaa]">
                            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                      <Card
                        key={review.id}
                        className="group relative bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10">
                          <CardContent className="p-6 sm:p-8">
                            <div className="flex items-start gap-4 mb-5">
                              {review.student.image ? (
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626] shrink-0">
                                  <Image
                                    src={review.student.image}
                                    alt={review.student.name || tTutor("student")}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center shrink-0">
                                <User className="w-7 h-7 text-[#666] dark:text-[#aaa]" />
                              </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-black dark:text-white mb-2">
                                  {review.student.name || tTutor("student")}
                                </h4>
                                <div className="flex items-center gap-1.5 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < review.rating
                                          ? "text-yellow-500 fill-current"
                                          : "text-gray-300 dark:text-gray-600"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-[#666] dark:text-[#aaa] font-light">
                                  {new Date(review.createdAt).toLocaleDateString(
                                    locale === "es" ? "es-ES" : "en-US",
                                    { year: "numeric", month: "long", day: "numeric" }
                                  )}
                                </p>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-base text-[#666] dark:text-[#aaa] leading-relaxed mb-4 font-light">
                                {review.comment}
                              </p>
                            )}
                            {review.tags && review.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {review.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-4 py-1.5 bg-[#ccf381]/20 text-[#ccf381] rounded-full text-sm font-medium border border-[#ccf381]/30"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[32px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <CardContent className="py-20 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-900/10 flex items-center justify-center border-2 border-yellow-200 dark:border-yellow-800">
                        <Star className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-black dark:text-white mb-3">
                        No Reviews Yet
                      </h3>
                      <p className="text-base text-[#666] dark:text-[#a1a1aa] max-w-md mx-auto font-light">
                        Reviews from your students will appear here once they complete sessions with you
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

