"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Shield,
} from "lucide-react";
import type { TutorApprovalStatus } from "@prisma/client";

/**
 * Admin Dashboard Client Component
 * 
 * Production-ready admin dashboard with:
 * - Landing page style design
 * - Real-time statistics
 * - Tutor approval/rejection
 * - Search and filtering
 * - Proper error handling
 * - Loading states
 */
interface Stats {
  totalTutors: number;
  pendingTutors: number;
  approvedTutors: number;
  rejectedTutors: number;
  totalStudents: number;
  totalBookings: number;
}

interface Tutor {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  tutorProfile: {
    id: string;
    specialties: string[];
    hourlyRate: number;
    rating: number;
    totalSessions: number;
    approvalStatus: TutorApprovalStatus;
    rejectionReason: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  createdAt: Date;
}

interface TutorsResponse {
  tutors: Tutor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminDashboardClientProps {
  locale: string;
}

export function AdminDashboardClient({ locale }: AdminDashboardClientProps) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [stats, setStats] = useState<Stats | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    tutorId: string | null;
    tutorName: string | null;
  }>({ open: false, tutorId: null, tutorName: null });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    tutorId: string | null;
    tutorName: string | null;
    reason: string;
  }>({ open: false, tutorId: null, tutorName: null, reason: "" });
  const [processing, setProcessing] = useState(false);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch tutors
  const fetchTutors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/tutors?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tutors");
      const data: TutorsResponse = await response.json();
      setTutors(data.tutors);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchTutors();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchTutors();
  }, [statusFilter, searchQuery]);

  // Refetch when page changes
  useEffect(() => {
    fetchTutors();
  }, [page]);

  // Handle approve
  const handleApprove = async () => {
    if (!approveDialog.tutorId) return;

    try {
      setProcessing(true);
      const response = await fetch(
        `/api/admin/tutors/${approveDialog.tutorId}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve tutor");
      }

      // Refresh data
      await Promise.all([fetchStats(), fetchTutors()]);
      setApproveDialog({ open: false, tutorId: null, tutorName: null });
    } catch (error) {
      console.error("Failed to approve tutor:", error);
      alert(error instanceof Error ? error.message : "Failed to approve tutor");
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectDialog.tutorId) return;

    try {
      setProcessing(true);
      const response = await fetch(
        `/api/admin/tutors/${rejectDialog.tutorId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: rejectDialog.reason || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject tutor");
      }

      // Refresh data
      await Promise.all([fetchStats(), fetchTutors()]);
      setRejectDialog({
        open: false,
        tutorId: null,
        tutorName: null,
        reason: "",
      });
    } catch (error) {
      console.error("Failed to reject tutor:", error);
      alert(error instanceof Error ? error.message : "Failed to reject tutor");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: TutorApprovalStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50/80 dark:bg-yellow-950/80 backdrop-blur-sm text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 rounded-full px-3 py-1"
          >
            <Clock className="w-3 h-3 mr-1.5" />
            {t("tutors.pending")}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50/80 dark:bg-green-950/80 backdrop-blur-sm text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 rounded-full px-3 py-1"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {t("tutors.approved")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 rounded-full px-3 py-1"
          >
            <XCircle className="w-3 h-3 mr-1.5" />
            {t("tutors.rejected")}
          </Badge>
        );
    }
  };

  return (
    <div className="relative min-h-screen pt-16 sm:pt-20">
      {/* Navigation Bar */}
      <header className="fixed top-0 z-[1000] w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-[rgba(250,250,250,0.85)] dark:bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] dark:border-[#262626]">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-sm font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{tCommon("back")} to Home</span>
        </Link>

        <Link
          href={`/${locale}`}
          className="font-bold text-lg sm:text-xl md:text-2xl tracking-[-0.03em] text-black dark:text-white hover:opacity-80 transition-opacity"
        >
          Linglix<span className="text-[#111] dark:text-[#ccf381]">.</span>
        </Link>

        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full">
          <Shield className="w-4 h-4 text-[#ccf381]" />
          <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">
            Admin
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ccf381] rounded-full mr-2 sm:mr-2.5 animate-pulse" />
            <span>Admin Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.04em] mb-4 text-black dark:text-white">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#555] dark:text-[#a1a1aa] max-w-2xl mx-auto font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#666] dark:text-[#aaa]">
                {t("stats.totalTutors")}
              </CardTitle>
              <Users className="h-4 w-4 text-[#666] dark:text-[#aaa]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.totalTutors ?? 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#666] dark:text-[#aaa]">
                {t("stats.pendingApprovals")}
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.pendingTutors ?? 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#666] dark:text-[#aaa]">
                {t("stats.approvedTutors")}
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.approvedTutors ?? 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#666] dark:text-[#aaa]">
                {t("stats.rejectedTutors")}
              </CardTitle>
              <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.rejectedTutors ?? 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#666] dark:text-[#aaa]">
                {t("stats.totalStudents")}
              </CardTitle>
              <Users className="h-4 w-4 text-[#666] dark:text-[#aaa]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.totalStudents ?? 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#666] dark:text-[#aaa]">
                {t("stats.totalBookings")}
              </CardTitle>
              <Users className="h-4 w-4 text-[#666] dark:text-[#aaa]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.totalBookings ?? 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutors Management */}
        <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              {t("tutors.title")}
            </CardTitle>
            <CardDescription className="text-[#666] dark:text-[#aaa]">
              {t("tutors.title")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666] dark:text-[#aaa]" />
                  <Input
                    placeholder={t("tutors.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full">
                  <SelectValue placeholder={t("tutors.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("tutors.all")}</SelectItem>
                  <SelectItem value="PENDING">{t("tutors.pending")}</SelectItem>
                  <SelectItem value="APPROVED">{t("tutors.approved")}</SelectItem>
                  <SelectItem value="REJECTED">{t("tutors.rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tutors Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#666] dark:text-[#aaa]" />
              </div>
            ) : tutors.length === 0 ? (
              <div className="text-center py-12 text-[#666] dark:text-[#aaa]">
                {t("tutors.noTutors")}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e5e5e5] dark:border-[#262626]">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black dark:text-white">
                          {t("tutors.name")}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black dark:text-white">
                          {t("tutors.email")}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black dark:text-white">
                          {t("tutors.specialties")}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black dark:text-white">
                          {t("tutors.hourlyRate")}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black dark:text-white">
                          {t("tutors.status")}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black dark:text-white">
                          {t("tutors.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tutors.map((tutor) => (
                        <tr
                          key={tutor.id}
                          className="border-b border-[#e5e5e5] dark:border-[#262626] hover:bg-white/50 dark:hover:bg-[#0a0a0a]/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-black dark:text-white">
                              {tutor.name || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-[#666] dark:text-[#aaa]">
                            {tutor.email}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {tutor.tutorProfile?.specialties.slice(0, 2).map((spec, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
                                >
                                  {spec}
                                </Badge>
                              ))}
                              {tutor.tutorProfile &&
                                tutor.tutorProfile.specialties.length > 2 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
                                  >
                                    +{tutor.tutorProfile.specialties.length - 2}
                                  </Badge>
                                )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-black dark:text-white">
                            ${tutor.tutorProfile?.hourlyRate.toFixed(2)}/hr
                          </td>
                          <td className="py-3 px-4">
                            {tutor.tutorProfile &&
                              getStatusBadge(tutor.tutorProfile.approvalStatus)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {tutor.tutorProfile?.approvalStatus === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      setApproveDialog({
                                        open: true,
                                        tutorId: tutor.id,
                                        tutorName: tutor.name,
                                      })
                                    }
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {t("tutors.approve")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      setRejectDialog({
                                        open: true,
                                        tutorId: tutor.id,
                                        tutorName: tutor.name,
                                        reason: "",
                                      })
                                    }
                                    className="rounded-full"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    {t("tutors.reject")}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-[#666] dark:text-[#aaa]">
                      {t("tutors.showing")} {(pagination.page - 1) * pagination.limit + 1} -{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} {t("tutors.of")}{" "}
                      {pagination.total}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
                      >
                        {tCommon("previous")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
                        disabled={page === pagination.totalPages || loading}
                        className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
                      >
                        {tCommon("next")}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <AlertDialog
        open={approveDialog.open}
        onOpenChange={(open) =>
          setApproveDialog({ open, tutorId: null, tutorName: null })
        }
      >
        <AlertDialogContent className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-[#e5e5e5] dark:border-[#262626]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">
              {t("tutors.approve")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666] dark:text-[#aaa]">
              {t("tutors.approveConfirm")}
              {approveDialog.tutorName && (
                <span className="font-semibold text-black dark:text-white">
                  {" "}
                  {approveDialog.tutorName}
                </span>
              )}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={processing}
              className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
            >
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("tutors.approve")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          setRejectDialog({ open, tutorId: null, tutorName: null, reason: "" })
        }
      >
        <AlertDialogContent className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-[#e5e5e5] dark:border-[#262626]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">
              {t("tutors.reject")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666] dark:text-[#aaa]">
              {t("tutors.rejectConfirm")}
              {rejectDialog.tutorName && (
                <span className="font-semibold text-black dark:text-white">
                  {" "}
                  {rejectDialog.tutorName}
                </span>
              )}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason" className="text-black dark:text-white">
              {t("tutors.rejectionReason")}
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder={t("tutors.rejectionReasonPlaceholder")}
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog({ ...rejectDialog, reason: e.target.value })
              }
              className="mt-2 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-lg"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={processing}
              className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border-[#e5e5e5] dark:border-[#262626] rounded-full"
            >
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("tutors.reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
