"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
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

/**
 * Availability Manager Component
 * 
 * Comprehensive availability management with:
 * - Add new availability slots
 * - Edit existing slots
 * - Delete slots
 * - Toggle active/inactive
 * - Beautiful, responsive UI
 */
interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

interface AvailabilityManagerProps {
  locale: string;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function AvailabilityManager({ locale }: AvailabilityManagerProps) {
  const t = useTranslations("dashboard.tutor.availability");
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Fetch availability
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tutor/availability");
      if (!response.ok) throw new Error("Failed to fetch availability");
      const data = await response.json();
      setAvailability(data.availability || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Open dialog for adding new availability
  const handleAdd = () => {
    setEditingId(null);
    setDayOfWeek("");
    setStartTime("");
    setEndTime("");
    setIsActive(true);
    setIsDialogOpen(true);
    setError(null);
  };

  // Open dialog for editing
  const handleEdit = (item: Availability) => {
    setEditingId(item.id);
    setDayOfWeek(item.dayOfWeek.toString());
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setIsActive(item.isActive);
    setIsDialogOpen(true);
    setError(null);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/tutor/availability/${deletingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete availability");
      }

      await fetchAvailability();
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete availability");
    }
  };

  // Handle submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        isActive,
      };

      const url = editingId
        ? `/api/tutor/availability/${editingId}`
        : "/api/tutor/availability";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save availability");
      }

      await fetchAvailability();
      setIsDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tutor/availability/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      await fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update availability");
    }
  };

  // Group availability by day
  const groupedAvailability = availability.reduce((acc, item) => {
    if (!acc[item.dayOfWeek]) {
      acc[item.dayOfWeek] = [];
    }
    acc[item.dayOfWeek].push(item);
    return acc;
  }, {} as Record<number, Availability[]>);

  // Sort each day's availability by start time
  Object.keys(groupedAvailability).forEach((day) => {
    groupedAvailability[parseInt(day)].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  });

  return (
    <>
      <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[24px] sm:rounded-[32px] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                {t("title")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#a1a1aa] text-base mt-1">
                {t("description")}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAdd}
                  className="rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[24px] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                    {editingId ? t("edit") : t("add")} {t("availability")}
                  </DialogTitle>
                  <DialogDescription className="text-[#666] dark:text-[#a1a1aa]">
                    {editingId ? t("editDescription") : t("addDescription")}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50/80 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                      {t("day")}
                    </Label>
                    <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
                      <SelectTrigger className="rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80">
                        <SelectValue placeholder={t("selectDay")} />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                        {t("startTime")}
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                        {t("endTime")}
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#fafafa]/80 dark:bg-[#0a0a0a]/80 border border-[#e5e5e5] dark:border-[#262626]">
                    <div>
                      <Label htmlFor="isActive" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                        {t("active")}
                      </Label>
                      <p className="text-xs text-[#666] dark:text-[#a1a1aa] mt-1">
                        {t("activeDescription")}
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="rounded-full"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        t("save")
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#666] dark:text-[#a1a1aa]" />
            </div>
          ) : availability.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-[#999] dark:text-[#666] mb-4" />
              <p className="text-[#666] dark:text-[#a1a1aa] mb-4">{t("noAvailability")}</p>
              <Button
                onClick={handleAdd}
                variant="outline"
                className="rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("addFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS.map((day) => {
                const dayAvailability = groupedAvailability[day.value] || [];
                if (dayAvailability.length === 0) return null;

                return (
                  <div
                    key={day.value}
                    className="p-4 sm:p-6 bg-gradient-to-br from-white/60 to-[#fafafa]/60 dark:from-[#0a0a0a]/60 dark:to-[#1a1a1a]/60 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-[20px]"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-4">
                      {day.label}
                    </h3>
                    <div className="space-y-3">
                      {dayAvailability.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-white/80 dark:bg-[#0a0a0a]/80 rounded-xl border border-[#e5e5e5] dark:border-[#262626]"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#666] dark:text-[#a1a1aa]" />
                              <span className="text-sm sm:text-base font-medium text-black dark:text-white">
                                {item.startTime} - {item.endTime}
                              </span>
                            </div>
                            <Badge
                              variant={item.isActive ? "default" : "outline"}
                              className={`rounded-full ${
                                item.isActive
                                  ? "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50"
                                  : "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/50"
                              }`}
                            >
                              {item.isActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {t("active")}
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  {t("inactive")}
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isActive}
                              onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                              className="mr-2"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="rounded-full h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="rounded-full h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-2 border-[#e5e5e5] dark:border-[#262626] rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              {t("deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666] dark:text-[#a1a1aa]">
              {t("deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

