/**
 * Booking Validation Utilities
 * 
 * Production-ready validation logic for bookings:
 * - Availability checking
 * - Conflict detection
 * - Timezone handling
 * - Business rules enforcement
 */

import { z } from "zod";
import type { Booking, Availability, TutorProfile } from "@prisma/client";

/**
 * Valid booking duration options (in minutes)
 */
export const VALID_DURATIONS = [30, 60, 90] as const;

/**
 * Minimum advance booking time (24 hours)
 */
export const MIN_ADVANCE_BOOKING_HOURS = 24;

/**
 * Maximum advance booking time (90 days)
 */
export const MAX_ADVANCE_BOOKING_DAYS = 90;

/**
 * Booking creation schema
 */
export const createBookingSchema = z.object({
  tutorId: z.string().min(1, "Tutor ID is required"),
  scheduledAt: z.string().datetime({ message: "Invalid date format" }),
  duration: z.enum(["30", "60", "90"], {
    message: "Duration must be 30, 60, or 90 minutes",
  }),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

/**
 * Reschedule booking schema
 */
export const rescheduleBookingSchema = z.object({
  scheduledAt: z.string().datetime({ message: "Invalid date format" }),
});

/**
 * Calculate booking price based on duration and hourly rate
 */
export function calculatePrice(
  duration: number,
  hourlyRate: number
): number {
  return Math.round((hourlyRate * (duration / 60)) * 100) / 100;
}

/**
 * Validate booking time is in the future
 */
export function validateBookingTime(scheduledAt: Date): {
  valid: boolean;
  error?: string;
} {
  const now = new Date();
  const minTime = new Date(now.getTime() + MIN_ADVANCE_BOOKING_HOURS * 60 * 60 * 1000);
  const maxTime = new Date(now.getTime() + MAX_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000);

  if (scheduledAt <= minTime) {
    return {
      valid: false,
      error: `Booking must be at least ${MIN_ADVANCE_BOOKING_HOURS} hours in advance`,
    };
  }

  if (scheduledAt > maxTime) {
    return {
      valid: false,
      error: `Booking cannot be more than ${MAX_ADVANCE_BOOKING_DAYS} days in advance`,
    };
  }

  return { valid: true };
}

/**
 * Validate booking time is within tutor's availability
 */
export function validateAvailability(
  scheduledAt: Date,
  duration: number,
  availability: Availability[]
): {
  valid: boolean;
  error?: string;
} {
  if (availability.length === 0) {
    return {
      valid: false,
      error: "Tutor has no available time slots",
    };
  }

  const dayOfWeek = scheduledAt.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const timeSlot = availability.find(
    (avail) => avail.dayOfWeek === dayOfWeek && avail.isActive
  );

  if (!timeSlot) {
    return {
      valid: false,
      error: "Tutor is not available on this day",
    };
  }

  // Parse time strings (HH:mm format)
  const [startHour, startMinute] = timeSlot.startTime.split(":").map(Number);
  const [endHour, endMinute] = timeSlot.endTime.split(":").map(Number);

  const bookingStart = new Date(scheduledAt);
  const bookingStartHour = bookingStart.getUTCHours();
  const bookingStartMinute = bookingStart.getUTCMinutes();
  const bookingEnd = new Date(scheduledAt.getTime() + duration * 60 * 1000);
  const bookingEndHour = bookingEnd.getUTCHours();
  const bookingEndMinute = bookingEnd.getUTCMinutes();

  // Convert to minutes for easier comparison
  const slotStartMinutes = startHour * 60 + startMinute;
  const slotEndMinutes = endHour * 60 + endMinute;
  const bookingStartMinutes = bookingStartHour * 60 + bookingStartMinute;
  const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute;

  if (
    bookingStartMinutes < slotStartMinutes ||
    bookingEndMinutes > slotEndMinutes
  ) {
    return {
      valid: false,
      error: `Booking time must be between ${timeSlot.startTime} and ${timeSlot.endTime} UTC`,
    };
  }

  return { valid: true };
}

/**
 * Check for booking conflicts (overlapping bookings)
 */
export function checkConflicts(
  scheduledAt: Date,
  duration: number,
  tutorId: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): {
  hasConflict: boolean;
  conflictingBooking?: Booking;
} {
  const bookingStart = scheduledAt;
  const bookingEnd = new Date(scheduledAt.getTime() + duration * 60 * 1000);

  // Filter out cancelled/refunded bookings and the booking being updated
  const activeBookings = existingBookings.filter(
    (booking) =>
      booking.id !== excludeBookingId &&
      booking.status !== "CANCELLED" &&
      booking.status !== "REFUNDED" &&
      booking.tutorId === tutorId
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
        hasConflict: true,
        conflictingBooking: booking,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Validate booking can be cancelled
 */
export function canCancelBooking(booking: Booking): {
  canCancel: boolean;
  error?: string;
} {
  if (booking.status === "CANCELLED") {
    return {
      canCancel: false,
      error: "Booking is already cancelled",
    };
  }

  if (booking.status === "COMPLETED") {
    return {
      canCancel: false,
      error: "Cannot cancel a completed booking",
    };
  }

  if (booking.status === "REFUNDED") {
    return {
      canCancel: false,
      error: "Booking has already been refunded",
    };
  }

  // Allow cancellation but track if it's late (less than 12 hours before)
  // Late cancellations will be tracked for penalty purposes
  return { canCancel: true };
}

/**
 * Check if cancellation is late (less than 12 hours before session)
 */
export function isLateCancellation(booking: Booking): boolean {
  const now = new Date();
  const bookingTime = booking.scheduledAt;
  const hoursUntilBooking =
    (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilBooking < 12;
}

/**
 * Check if user is currently penalized
 */
export async function isUserPenalized(userId: string, prisma: any): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { penaltyUntil: true },
  });

  if (!user || !user.penaltyUntil) {
    return false;
  }

  return new Date() < new Date(user.penaltyUntil);
}

/**
 * Count late cancellations in the last period (for penalty calculation)
 */
export async function countLateCancellations(
  userId: string,
  prisma: any,
  sinceDate?: Date
): Promise<number> {
  const cutoffDate = sinceDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

  const lateCancellations = await prisma.booking.count({
    where: {
      studentId: userId,
      status: "CANCELLED",
      isLateCancellation: true,
      cancelledAt: {
        gte: cutoffDate,
      },
    },
  });

  return lateCancellations;
}

/**
 * Validate booking can be rescheduled
 */
export function canRescheduleBooking(booking: Booking): {
  canReschedule: boolean;
  error?: string;
} {
  if (booking.status === "CANCELLED") {
    return {
      canReschedule: false,
      error: "Cannot reschedule a cancelled booking",
    };
  }

  if (booking.status === "COMPLETED") {
    return {
      canReschedule: false,
      error: "Cannot reschedule a completed booking",
    };
  }

  // Check if booking is too close to start time (within 4 hours)
  const now = new Date();
  const bookingTime = booking.scheduledAt;
  const hoursUntilBooking =
    (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilBooking < 4) {
    return {
      canReschedule: false,
      error: "Cannot reschedule booking less than 4 hours before start time",
    };
  }

  return { canReschedule: true };
}

/**
 * Get booking status transitions
 */
export function getValidStatusTransitions(
  currentStatus: Booking["status"]
): Booking["status"][] {
  const transitions: Record<Booking["status"], Booking["status"][]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
    COMPLETED: [], // Terminal state
    CANCELLED: [], // Terminal state
    REFUNDED: [], // Terminal state
  };

  return transitions[currentStatus] || [];
}

/**
 * Validate status transition
 */
export function validateStatusTransition(
  currentStatus: Booking["status"],
  newStatus: Booking["status"]
): {
  valid: boolean;
  error?: string;
} {
  const validTransitions = getValidStatusTransitions(currentStatus);

  if (!validTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { valid: true };
}

