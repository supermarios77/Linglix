"use client";

/**
 * Booking Client Component
 * 
 * Production-ready booking interface with:
 * - Calendar date selection
 * - Time slot selection
 * - Duration selection
 * - Price calculation
 * - Real-time availability checking
 * - Form validation
 * - Error handling
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { User } from "lucide-react";

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface Tutor {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  hourlyRate: number;
  specialties: string[];
  availability: Availability[];
}

interface BookingClientProps {
  tutor: Tutor;
  locale: string;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
}

export function BookingClient({ tutor, locale }: BookingClientProps) {
  const t = useTranslations("booking");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<"30" | "60" | "90">("60");
  const [notes, setNotes] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate price
  const price = Math.round((tutor.hourlyRate * (parseInt(duration) / 60)) * 100) / 100;

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      setSelectedTime("");
      return;
    }

    const fetchTimeSlots = async () => {
      setLoadingSlots(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/bookings/availability?tutorId=${tutor.id}&date=${selectedDate}&duration=${duration}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch availability");
        }

        const data = await response.json();
        setTimeSlots(data.slots || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load available time slots"
        );
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, duration, tutor.id]);

  // Handle booking submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time");
      setSubmitting(false);
      return;
    }

    try {
      // Combine date and time
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00Z`).toISOString();

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: tutor.id,
          scheduledAt,
          duration,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Redirect to dashboard
      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking. Please try again."
      );
      setSubmitting(false);
    }
  };

  // Get minimum date (24 hours from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split("T")[0];

  // Get maximum date (90 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateString = maxDate.toISOString().split("T")[0];

  const availableSlots = timeSlots.filter((slot) => slot.available);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/tutors/${tutor.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="inline-flex items-center gap-2 text-sm text-[#666] dark:text-[#aaa] hover:text-[#111] dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon("back")}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-[#666] dark:text-[#aaa]">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tutor Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {tutor.image ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626]">
                      <Image
                        src={tutor.image}
                        alt={tutor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#f5f5f5] dark:bg-[#262626] border-2 border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center">
                      <User className="w-8 h-8 text-[#666] dark:text-[#aaa]" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg font-semibold text-black dark:text-white">
                      {tutor.name}
                    </CardTitle>
                    <p className="text-sm text-[#666] dark:text-[#aaa]">
                      ${tutor.hourlyRate}/hour
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#666] dark:text-[#aaa] mb-1">
                      {t("specialties")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#f5f5f5] dark:bg-[#262626] rounded text-xs text-black dark:text-white"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">
                  {t("selectTime")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Duration Selection */}
                  <div>
                    <Label className="text-sm font-medium text-black dark:text-white mb-2 block">
                      {t("duration")}
                    </Label>
                    <Select
                      value={duration}
                      onValueChange={(value) => {
                        setDuration(value as "30" | "60" | "90");
                        setSelectedTime(""); // Reset time when duration changes
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 {t("minutes")} - ${calculatePrice(30, tutor.hourlyRate).toFixed(2)}</SelectItem>
                        <SelectItem value="60">60 {t("minutes")} - ${calculatePrice(60, tutor.hourlyRate).toFixed(2)}</SelectItem>
                        <SelectItem value="90">90 {t("minutes")} - ${calculatePrice(90, tutor.hourlyRate).toFixed(2)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label
                      htmlFor="date"
                      className="text-sm font-medium text-black dark:text-white mb-2 block"
                    >
                      {t("selectDate")}
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] dark:text-[#aaa]" />
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime(""); // Reset time when date changes
                        }}
                        min={minDateString}
                        max={maxDateString}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-[#666] dark:text-[#aaa] mt-1">
                      {t("dateHint")}
                    </p>
                  </div>

                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div>
                      <Label className="text-sm font-medium text-black dark:text-white mb-2 block">
                        {t("selectTime")}
                      </Label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-[#ccf381]" />
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="p-4 bg-[#f5f5f5] dark:bg-[#262626] rounded-lg text-center text-sm text-[#666] dark:text-[#aaa]">
                          {t("noSlotsAvailable")}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                          {availableSlots.map((slot, idx) => {
                            const timeString = new Date(slot.start).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            });

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedTime(slot.start.split("T")[1].slice(0, 5))}
                                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                  selectedTime === slot.start.split("T")[1].slice(0, 5)
                                    ? "border-[#ccf381] bg-[#ccf381]/10 text-[#ccf381]"
                                    : "border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:border-[#ccf381]/50"
                                }`}
                              >
                                {timeString}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium text-black dark:text-white mb-2 block"
                    >
                      {t("notes")} ({t("optional")})
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("notesPlaceholder")}
                      maxLength={1000}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-[#666] dark:text-[#aaa] mt-1">
                      {notes.length}/1000 {t("characters")}
                    </p>
                  </div>

                  {/* Price Summary */}
                  <div className="p-4 bg-[#f5f5f5] dark:bg-[#262626] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#ccf381]" />
                        <span className="text-sm font-medium text-black dark:text-white">
                          {t("totalPrice")}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-black dark:text-white">
                        ${price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[#666] dark:text-[#aaa] mt-1">
                      {t("priceNote")}
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={submitting || !selectedDate || !selectedTime || availableSlots.length === 0}
                      className="flex-1 bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] rounded-full py-6 text-base font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("creating")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t("confirmBooking")}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate price
function calculatePrice(duration: number, hourlyRate: number): number {
  return Math.round((hourlyRate * (duration / 60)) * 100) / 100;
}

