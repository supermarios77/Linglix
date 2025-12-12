"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  X,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { slugify } from "@/lib/utils/slug";
import type { Booking, BookingStatus } from "@prisma/client";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { isMobilePhone } from "@/lib/utils/mobile-detection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Monitor } from "lucide-react";

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
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPenalty, setUserPenalty] = useState<{ penaltyUntil: Date | null } | null>(null);
  
  // Mobile phone detection for warning popup
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // Check if user is on a mobile phone and show warning
  useEffect(() => {
    if (isMobilePhone()) {
      setShowMobileWarning(true);
    }
  }, []);

  // Fetch user penalty status on mount
  useEffect(() => {
    const fetchPenaltyStatus = async () => {
      try {
        const response = await fetch("/api/user/penalty-status");
        if (response.ok) {
          const data = await response.json();
          setUserPenalty(data);
        }
      } catch (err) {
        // Silently fail - penalty status is optional
      }
    };
    fetchPenaltyStatus();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;

    setCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${cancellingBookingId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Refresh the page to show updated bookings
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel booking. Please try again."
      );
      setCancelling(false);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim() || appealReason.length < 10) {
      setError("Please provide a reason (at least 10 characters)");
      return;
    }

    setSubmittingAppeal(true);
    setError(null);

    try {
      const response = await fetch("/api/appeals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: appealReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit appeal");
      }

      setShowAppealDialog(false);
      setAppealReason("");
      // Refresh to update penalty status
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit appeal. Please try again."
      );
      setSubmittingAppeal(false);
    }
  };

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
    
    // Allow joining 5 minutes before session starts, during the session, but not after
    const fiveMinutesBefore = new Date(sessionStart.getTime() - 5 * 60 * 1000);
    return now >= fiveMinutesBefore && now <= sessionEnd;
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
            className="bg-warning/10 backdrop-blur-sm text-warning border-warning/30 rounded-full px-3 py-1"
          >
            <Clock className="w-3 h-3 mr-1.5" />
            Waiting for tutor confirmation
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="bg-success/10 backdrop-blur-sm text-success border-success/30 rounded-full px-3 py-1"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {isPast ? tBooking("past") : tBooking("upcoming")}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-info/10 backdrop-blur-sm text-info border-info/30 rounded-full px-3 py-1"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {tBooking("past")}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-error/10 backdrop-blur-sm text-error border-error/30 rounded-full px-3 py-1"
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
      {/* Mobile Phone Warning Dialog */}
      <Dialog open={showMobileWarning} onOpenChange={setShowMobileWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-primary/20 rounded-lg">
                <Monitor className="w-6 h-6 text-brand-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Best Experience on Larger Devices
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-muted-foreground pt-2">
              Linglix works best on iPads, Laptops and Desktops. Some features may be limited on mobile phones.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setShowMobileWarning(false)}
              className="bg-primary text-primary-foreground"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation Bar */}
      <header className="fixed top-0 z-50 w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <Link
          href={`/${locale}`}
          className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          Linglix<span className="text-brand-primary">.</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/${locale}/tutors`}>
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border rounded-full"
            >
              <Search className="w-4 h-4" />
              {t("browseTutors")}
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {user.name || user.email}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSignOutDialog(true)}
            className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border rounded-full hover:border-error hover:text-error transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{tCommon("signOut")}</span>
          </Button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
        {/* Penalty Warning Banner */}
        {userPenalty?.penaltyUntil && new Date(userPenalty.penaltyUntil) > new Date() && (
          <Card className="mb-6 border-2 border-warning/50 bg-warning/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    Account Penalty Active
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You are currently penalized and cannot create or cancel bookings until{" "}
                    {new Date(userPenalty.penaltyUntil).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    . This penalty was applied due to multiple late cancellations.
                  </p>
                  <Button
                    onClick={() => setShowAppealDialog(true)}
                    variant="outline"
                    className="border-warning text-warning hover:bg-warning/10"
                  >
                    Submit Appeal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section - Enhanced Design */}
        <div className="mb-16 sm:mb-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
            {/* Left: Welcome Text */}
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-success/10 backdrop-blur-md border border-success/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-lg group hover:scale-105 transition-transform">
                <span className="w-2 h-2 bg-success rounded-full mr-2.5 animate-pulse" />
                <span className="mr-2">{t("welcome")}</span>
                <Sparkles className="w-3 h-3 text-success opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-foreground">
                {t("title")}
                <br />
                <span className="relative inline-block mt-2">
                  <span className="inline-block bg-brand-primary text-black px-4 py-2 -rotate-2 transform origin-center font-bold shadow-lg relative z-10">
                    {user.name?.split(" ")[0] || "there"}!
                  </span>
                  <span className="absolute inset-0 bg-brand-primary/30 blur-xl -rotate-2 transform origin-center" aria-hidden="true" />
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-muted-foreground max-w-2xl mb-8 font-light">
                {t("subtitle")}
              </p>

              {/* Quick Stats Pills */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-card/90 backdrop-blur-sm border-2 border-success/20 rounded-xl text-sm font-bold text-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="p-1.5 bg-success/20 rounded-lg">
                    <BookOpen className="w-4 h-4 text-success" />
                  </div>
                  <span>{totalBookings}</span>
                  <span className="text-xs font-medium text-muted-foreground ml-1">{t("totalBookings")}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-card/90 backdrop-blur-sm border-2 border-info/20 rounded-xl text-sm font-bold text-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="p-1.5 bg-info/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-info" />
                  </div>
                  <span>{upcomingBookings.length}</span>
                  <span className="text-xs font-medium text-muted-foreground ml-1">{t("upcomingSessions")}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-card/90 backdrop-blur-sm border-2 border-warning/20 rounded-xl text-sm font-bold text-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="p-1.5 bg-warning/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-warning" />
                  </div>
                  <span>{completedSessions}</span>
                  <span className="text-xs font-medium text-muted-foreground ml-1">{t("completedSessions")}</span>
                </div>
              </div>
            </div>

            {/* Right: User Avatar/Profile Card */}
            <div className="lg:w-80">
              <Card className="group relative overflow-hidden bg-card border-2 border-border rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative z-10 p-8 text-center">
                  {user.image ? (
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-success/20 shadow-xl ring-2 ring-success/10">
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-success/20 border-2 border-success/20 flex items-center justify-center shadow-xl ring-2 ring-success/10">
                      <User className="w-12 h-12 text-success" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {user.name || "Student"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {user.email}
                  </p>
                  <Link href={`/${locale}/tutors`}>
                    <Button
                      size="lg"
                      className="w-full rounded-xl bg-primary text-primary-foreground px-6 py-6 text-base font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 inline-flex items-center justify-center gap-3 group/btn"
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
          <Card className="group relative overflow-hidden bg-card border-2 border-border rounded-3xl shadow-xl hover:shadow-2xl hover:border-success/50 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success/20 rounded-xl">
                  <BookOpen className="w-6 h-6 text-success" />
                </div>
                <Badge className="bg-success/20 text-success border-2 border-success/30 rounded-full px-3 py-1 text-xs font-bold">
                  Total
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("totalBookings")}</p>
                <p className="text-4xl font-bold text-foreground">{totalBookings}</p>
                <p className="text-xs text-muted-foreground">All time bookings</p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="group relative overflow-hidden bg-card border-2 border-border rounded-3xl shadow-xl hover:shadow-2xl hover:border-info/50 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-info" />
                </div>
                <Badge className="bg-info/20 text-info border-2 border-info/30 rounded-full px-3 py-1 text-xs font-bold">
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("upcomingSessions")}</p>
                <p className="text-4xl font-bold text-info">{upcomingBookings.length}</p>
                <p className="text-xs text-muted-foreground">Scheduled sessions</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Sessions */}
          <Card className="group relative overflow-hidden bg-card border-2 border-border rounded-3xl shadow-xl hover:shadow-2xl hover:border-warning/50 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-warning" />
                </div>
                <Badge className="bg-warning/20 text-warning border-2 border-warning/30 rounded-full px-3 py-1 text-xs font-bold">
                  Done
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("completedSessions")}</p>
                <p className="text-4xl font-bold text-warning">{completedSessions}</p>
                <p className="text-xs text-muted-foreground">Finished sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings - Enhanced Design */}
        {upcomingBookings.length > 0 && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <div className="p-2.5 bg-success/20 rounded-xl backdrop-blur-sm">
                    <Calendar className="w-6 h-6 text-success" />
                  </div>
                  {t("upcomingBookings")}
                </h2>
                <p className="text-sm text-muted-foreground ml-14">
                  {t("upcomingBookingsDescription")}
                </p>
              </div>
              <Badge className="bg-success/20 text-success border-2 border-success/30 rounded-full px-6 py-2.5 text-base font-bold shadow-lg backdrop-blur-sm">
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
                    className="group relative overflow-hidden bg-card border-2 border-border rounded-3xl shadow-xl hover:shadow-2xl hover:border-success/50 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Time indicator badge */}
                    {isToday && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-success text-white border-0 rounded-full px-3 py-1 text-xs font-bold shadow-lg animate-pulse">
                          Today
                        </Badge>
                      </div>
                    )}
                    
                    <CardContent className="relative z-10 p-6">
                      <div className="flex items-start gap-5 mb-5">
                        {/* Tutor Avatar */}
                        <div className="relative shrink-0">
                          {booking.tutor.user.image ? (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-success/20 shadow-lg ring-2 ring-success/10 bg-muted">
                              <Image
                                src={booking.tutor.user.image}
                                alt={booking.tutor.user.name || t("tutorFallback")}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-success/20 border-2 border-success/20 flex items-center justify-center shadow-lg ring-2 ring-success/10">
                              <User className="w-10 h-10 text-success" />
                            </div>
                          )}
                          {canJoinSession(booking.scheduledAt, booking.status, booking.duration, booking.callEndedAt) && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-card animate-pulse" />
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
                            <p className="text-xs font-medium text-success mb-2">
                              Starts in {hoursUntil === 0 ? "less than an hour" : `${hoursUntil} ${hoursUntil === 1 ? "hour" : "hours"}`}
                            </p>
                          )}
                          {getStatusBadge(booking.status, booking.scheduledAt, booking.duration)}
                        </div>
                      </div>

                      {/* Session Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="flex items-center gap-2.5 p-3 bg-muted/60 backdrop-blur-sm rounded-xl border border-border">
                          <div className="p-1.5 bg-success/20 rounded-lg">
                            <Calendar className="w-4 h-4 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Date</p>
                            <p className="text-sm font-bold text-foreground">{formatDate(booking.scheduledAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 bg-muted/60 backdrop-blur-sm rounded-xl border border-border">
                          <div className="p-1.5 bg-info/20 rounded-lg">
                            <Clock className="w-4 h-4 text-info" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Time</p>
                            <p className="text-sm font-bold text-foreground">{formatTime(booking.scheduledAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 bg-muted/60 backdrop-blur-sm rounded-xl border border-border">
                          <div className="p-1.5 bg-warning/20 rounded-lg">
                            <Clock3 className="w-4 h-4 text-warning" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Duration</p>
                            <p className="text-sm font-bold text-foreground">{booking.duration} {tBooking("min")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 bg-muted/60 backdrop-blur-sm rounded-xl border border-border">
                          <div className="p-1.5 bg-brand-primary/20 rounded-lg">
                            <DollarSign className="w-4 h-4 text-brand-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Price</p>
                            <p className="text-sm font-bold text-foreground">${booking.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Waiting for tutor confirmation message */}
                      {booking.status === "PENDING" && (
                        <div className="mb-4 p-4 bg-warning/10 border border-warning/30 rounded-xl">
                          <p className="text-sm text-warning font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Waiting for tutor to confirm your booking. You'll be notified once they respond.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {booking.status === "CONFIRMED" && !booking.paymentId && (
                          <PaymentButton bookingId={booking.id} />
                        )}
                        {canJoinSession(booking.scheduledAt, booking.status, booking.duration, booking.callEndedAt) && (
                          <Link href={`/${locale}/sessions/${booking.id}`} className="flex-1">
                            <Button
                              size="lg"
                              className="w-full rounded-xl bg-primary text-primary-foreground px-6 py-6 text-base font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 inline-flex items-center justify-center gap-3 group/btn"
                            >
                              <Video className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                              {tVideoCall("joinSession")}
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                        {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && booking.status !== "PENDING" && (
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => {
                              setCancellingBookingId(booking.id);
                              setShowCancelDialog(true);
                            }}
                            className="rounded-xl bg-card/80 backdrop-blur-sm border-2 border-error/50 hover:border-error hover:text-error transition-all font-semibold"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                        <Link href={`/${locale}/tutors/${slugify(booking.tutor.user.name || "")}`} className="flex-1">
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full rounded-xl bg-card/80 backdrop-blur-sm border-2 border-border hover:border-primary transition-all font-semibold"
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
                <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <div className="p-2.5 bg-info/20 rounded-xl backdrop-blur-sm">
                    <BookOpen className="w-6 h-6 text-info" />
                  </div>
                  {t("pastSessions")}
                </h2>
                <p className="text-sm text-muted-foreground ml-14">
                  {t("pastSessionsDescription")}
                </p>
              </div>
              <Badge className="bg-info/20 text-info border-2 border-info/30 rounded-full px-6 py-2.5 text-base font-bold shadow-lg backdrop-blur-sm">
                {pastBookings.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastBookings.slice(0, 6).map((booking) => (
                <Card
                  key={booking.id}
                  className="group relative overflow-hidden bg-card border-2 border-border rounded-2xl shadow-lg hover:shadow-xl hover:border-info/50 transition-all duration-500 hover:-translate-y-1.5"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="relative z-10 p-5">
                    <div className="flex items-start gap-4 mb-4">
                      {booking.tutor.user.image ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-info/20 shadow-md ring-1 ring-info/10 shrink-0">
                          <Image
                            src={booking.tutor.user.image}
                            alt={booking.tutor.user.name || t("tutorFallback")}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-info/20 border-2 border-info/20 flex items-center justify-center shadow-md ring-1 ring-info/10 shrink-0">
                          <User className="w-6 h-6 text-info" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-foreground mb-1.5 truncate">
                          {booking.tutor.user.name || t("tutorFallback")}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(booking.scheduledAt)}</span>
                        </div>
                        {getStatusBadge(booking.status, booking.scheduledAt, booking.duration)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Price</p>
                        <p className="text-lg font-bold text-info">
                          ${booking.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Duration</p>
                        <p className="text-sm font-semibold text-foreground">
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
        <AlertDialogContent className="bg-card/95 backdrop-blur-md border-2 border-border rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-error/20 rounded-xl">
                <LogOut className="w-6 h-6 text-error" />
              </div>
              <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                {t("signOutConfirmTitle")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-muted-foreground pt-2">
              {t("signOutConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="w-full sm:w-auto bg-error hover:bg-error/90 text-white rounded-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {tCommon("signOut")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-md border-2 border-border rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-error/20 rounded-xl">
                <X className="w-6 h-6 text-error" />
              </div>
              <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                Cancel Booking
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-muted-foreground pt-2">
              Are you sure you want to cancel this booking?
              {cancellingBookingId && (() => {
                const booking = upcomingBookings.find(b => b.id === cancellingBookingId);
                if (booking) {
                  const hoursUntil = Math.floor((new Date(booking.scheduledAt).getTime() - new Date().getTime()) / (1000 * 60 * 60));
                  if (hoursUntil < 12) {
                    return " This is a late cancellation (less than 12 hours before the session). Multiple late cancellations may result in a penalty.";
                  }
                }
                return "";
              })()}
            </AlertDialogDescription>
            {error && (
              <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
            <AlertDialogCancel disabled={cancelling}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="bg-error hover:bg-error/90 text-white"
            >
              {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Appeal Submission Dialog */}
      <AlertDialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-md border-2 border-border rounded-3xl shadow-2xl max-w-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-warning/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                Submit Appeal
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-muted-foreground pt-2">
              Please explain why you believe this penalty should be removed. An admin will review your appeal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Reason for Appeal
              </Label>
              <Textarea
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                placeholder="Please provide a detailed explanation (minimum 10 characters)..."
                className="w-full min-h-[120px] resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {appealReason.length}/1000 characters
              </p>
            </div>
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}
          </div>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
            <AlertDialogCancel disabled={submittingAppeal}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitAppeal}
              disabled={submittingAppeal || appealReason.length < 10}
            >
              {submittingAppeal ? "Submitting..." : "Submit Appeal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
