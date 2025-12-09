/**
 * Availability Checking Service
 * 
 * Production-ready availability checking:
 * - Check tutor availability for a time slot
 * - Get available time slots for a date range
 * - Handle timezones properly
 * - Consider existing bookings
 */

import type { Availability, Booking } from "@prisma/client";

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  reason?: string;
}

export interface AvailabilityCheckResult {
  available: boolean;
  reason?: string;
  conflictingBooking?: Booking;
}

/**
 * Check if a specific time slot is available
 */
export function checkTimeSlotAvailability(
  scheduledAt: Date,
  duration: number,
  tutorAvailability: Availability[],
  existingBookings: Booking[],
  tutorId: string
): AvailabilityCheckResult {
  // Check if tutor has availability for this day
  const dayOfWeek = scheduledAt.getUTCDay();
  const dayAvailability = tutorAvailability.find(
    (avail) => avail.dayOfWeek === dayOfWeek && avail.isActive
  );

  if (!dayAvailability) {
    return {
      available: false,
      reason: "Tutor is not available on this day",
    };
  }

  // Check time is within availability window
  const [startHour, startMinute] = dayAvailability.startTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = dayAvailability.endTime.split(":").map(Number);

  const bookingStart = scheduledAt;
  const bookingEnd = new Date(scheduledAt.getTime() + duration * 60 * 1000);

  const bookingStartMinutes =
    bookingStart.getUTCHours() * 60 + bookingStart.getUTCMinutes();
  const bookingEndMinutes =
    bookingEnd.getUTCHours() * 60 + bookingEnd.getUTCMinutes();
  const slotStartMinutes = startHour * 60 + startMinute;
  const slotEndMinutes = endHour * 60 + endMinute;

  if (
    bookingStartMinutes < slotStartMinutes ||
    bookingEndMinutes > slotEndMinutes
  ) {
    return {
      available: false,
      reason: `Time slot must be between ${dayAvailability.startTime} and ${dayAvailability.endTime} UTC`,
    };
  }

  // Check for conflicts with existing bookings
  const activeBookings = existingBookings.filter(
    (booking) =>
      booking.tutorId === tutorId &&
      booking.status !== "CANCELLED" &&
      booking.status !== "REFUNDED"
  );

  for (const booking of activeBookings) {
    const existingStart = booking.scheduledAt;
    const existingEnd = new Date(
      booking.scheduledAt.getTime() + booking.duration * 60 * 1000
    );

    // Check for overlap
    if (
      (bookingStart >= existingStart && bookingStart < existingEnd) ||
      (bookingEnd > existingStart && bookingEnd <= existingEnd) ||
      (bookingStart <= existingStart && bookingEnd >= existingEnd)
    ) {
      return {
        available: false,
        reason: "Time slot conflicts with an existing booking",
        conflictingBooking: booking,
      };
    }
  }

  return { available: true };
}

/**
 * Get available time slots for a specific date
 */
export function getAvailableTimeSlots(
  date: Date,
  duration: number,
  tutorAvailability: Availability[],
  existingBookings: Booking[],
  tutorId: string
): TimeSlot[] {
  const dayOfWeek = date.getUTCDay();
  const dayAvailability = tutorAvailability.find(
    (avail) => avail.dayOfWeek === dayOfWeek && avail.isActive
  );

  if (!dayAvailability) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = dayAvailability.startTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = dayAvailability.endTime.split(":").map(Number);

  const slotStartMinutes = startHour * 60 + startMinute;
  const slotEndMinutes = endHour * 60 + endMinute;
  const durationMinutes = duration;

  // Generate 30-minute interval slots
  for (
    let currentMinutes = slotStartMinutes;
    currentMinutes + durationMinutes <= slotEndMinutes;
    currentMinutes += 30
  ) {
    const slotStart = new Date(date);
    slotStart.setUTCHours(Math.floor(currentMinutes / 60));
    slotStart.setUTCMinutes(currentMinutes % 60);
    slotStart.setUTCSeconds(0);
    slotStart.setUTCMilliseconds(0);

    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

    // Check if this slot conflicts with existing bookings
    const activeBookings = existingBookings.filter(
      (booking) =>
        booking.tutorId === tutorId &&
        booking.status !== "CANCELLED" &&
        booking.status !== "REFUNDED"
    );

    let hasConflict = false;
    for (const booking of activeBookings) {
      const existingStart = booking.scheduledAt;
      const existingEnd = new Date(
        booking.scheduledAt.getTime() + booking.duration * 60 * 1000
      );

      if (
        (slotStart >= existingStart && slotStart < existingEnd) ||
        (slotEnd > existingStart && slotEnd <= existingEnd) ||
        (slotStart <= existingStart && slotEnd >= existingEnd)
      ) {
        hasConflict = true;
        break;
      }
    }

    slots.push({
      start: slotStart,
      end: slotEnd,
      available: !hasConflict,
      reason: hasConflict ? "Time slot is already booked" : undefined,
    });
  }

  return slots;
}

/**
 * Get available dates in a date range
 */
export function getAvailableDates(
  startDate: Date,
  endDate: Date,
  tutorAvailability: Availability[],
  existingBookings: Booking[],
  tutorId: string,
  duration: number
): Date[] {
  const availableDates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const slots = getAvailableTimeSlots(
      currentDate,
      duration,
      tutorAvailability,
      existingBookings,
      tutorId
    );

    // If there's at least one available slot, add the date
    if (slots.some((slot) => slot.available)) {
      availableDates.push(new Date(currentDate));
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    currentDate.setUTCHours(0, 0, 0, 0);
  }

  return availableDates;
}

