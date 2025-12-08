"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking } from "@prisma/client";

/**
 * Availability Calendar Component
 * 
 * Beautiful, responsive calendar view showing:
 * - Monthly calendar with bookings highlighted
 * - Availability slots
 * - Easy navigation between months
 */
interface AvailabilityCalendarProps {
  bookings: Booking[];
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function AvailabilityCalendar({ bookings }: AvailabilityCalendarProps) {
  const t = useTranslations("dashboard.tutor.calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.scheduledAt);
      const bookingDateStr = bookingDate.toISOString().split("T")[0];
      return bookingDateStr === dateStr;
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [year, month, startingDayOfWeek, daysInMonth]);

  return (
    <Card className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-black dark:text-white">
              {t("title")}
            </CardTitle>
            <p className="text-sm sm:text-base font-medium text-[#666] dark:text-[#a1a1aa] mt-1">
              {MONTHS[month]} {year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="rounded-full h-8 w-8 p-0 border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 hover:bg-white dark:hover:bg-[#0a0a0a]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="rounded-full px-3 h-8 text-xs border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 hover:bg-white dark:hover:bg-[#0a0a0a]"
            >
              {t("today")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="rounded-full h-8 w-8 p-0 border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 hover:bg-white dark:hover:bg-[#0a0a0a]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Day Headers */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-semibold text-[#666] dark:text-[#a1a1aa] py-2 px-1"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateBookings = getBookingsForDate(date);
            const isTodayDate = isToday(date);
            const isPastDate = isPast(date);

            return (
              <div
                key={date.toISOString()}
                className={`aspect-square p-1.5 sm:p-2 rounded-lg border transition-all ${
                  isTodayDate
                    ? "bg-[#ccf381]/20 dark:bg-[#ccf381]/10 border-[#ccf381] dark:border-[#ccf381]/50 shadow-sm"
                    : isPastDate
                    ? "border-[#e5e5e5]/50 dark:border-[#262626]/50 bg-[#fafafa]/50 dark:bg-[#0a0a0a]/50"
                    : "border-[#e5e5e5] dark:border-[#262626] bg-white/60 dark:bg-[#0a0a0a]/60 hover:border-[#ccf381] dark:hover:border-[#ccf381]/50 hover:shadow-sm"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-xs sm:text-sm font-bold mb-1 ${
                      isTodayDate
                        ? "text-[#ccf381] dark:text-[#ccf381]"
                        : isPastDate
                        ? "text-[#999] dark:text-[#666]"
                        : "text-black dark:text-white"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  {dateBookings.length > 0 && (
                    <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                      {dateBookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking.id}
                          className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-[#ccf381]/25 dark:bg-[#ccf381]/15 text-[#111] dark:text-[#ccf381] font-semibold truncate border border-[#ccf381]/30 dark:border-[#ccf381]/20"
                          title={`${new Date(booking.scheduledAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${booking.duration}min`}
                        >
                          {new Date(booking.scheduledAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ))}
                      {dateBookings.length > 2 && (
                        <div className="text-[8px] sm:text-[10px] text-[#666] dark:text-[#a1a1aa] font-medium px-1">
                          +{dateBookings.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-[#e5e5e5] dark:border-[#262626] flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-[#ccf381]/20 dark:bg-[#ccf381]/10 border border-[#ccf381] dark:border-[#ccf381]/50" />
            <span className="text-[#666] dark:text-[#a1a1aa]">{t("today")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-[#ccf381]/20 dark:bg-[#ccf381]/10" />
            <span className="text-[#666] dark:text-[#a1a1aa]">{t("hasBookings")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

