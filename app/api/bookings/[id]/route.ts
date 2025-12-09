/**
 * Booking Detail API Route
 * 
 * Handles individual booking operations:
 * - GET: Fetch booking details
 * - PATCH: Update booking (status, reschedule)
 * - DELETE: Cancel booking
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { BookingStatus } from "@prisma/client";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  rescheduleBookingSchema,
  validateBookingTime,
  validateAvailability,
  checkConflicts,
  canCancelBooking,
  canRescheduleBooking,
  validateStatusTransition,
} from "@/lib/booking/validation";

/**
 * GET /api/bookings/[id]
 * 
 * Get booking details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return createErrorResponse(Errors.NotFound("Booking not found"));
    }

    // Verify user has access
    const isStudent = booking.studentId === user.id;
    const isTutor = booking.tutor.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTutor && !isAdmin) {
      return createErrorResponse(
        Errors.Forbidden("You don't have access to this booking")
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to fetch booking", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to fetch booking. Please try again."
    );
  }
}

/**
 * PATCH /api/bookings/[id]
 * 
 * Update booking (reschedule or status change)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tutor: {
          include: {
            user: true,
            availability: {
              where: { isActive: true },
            },
          },
        },
        student: true,
      },
    });

    if (!booking) {
      return createErrorResponse(Errors.NotFound("Booking not found"));
    }

    // Verify user has access
    const isStudent = booking.studentId === user.id;
    const isTutor = booking.tutor.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTutor && !isAdmin) {
      return createErrorResponse(
        Errors.Forbidden("You don't have access to this booking")
      );
    }

    // Handle rescheduling
    if (body.scheduledAt) {
      // Only students can reschedule their own bookings
      if (!isStudent) {
        return createErrorResponse(
          Errors.Forbidden("Only students can reschedule bookings")
        );
      }

      const rescheduleValidation = canRescheduleBooking(booking);
      if (!rescheduleValidation.canReschedule) {
        return createErrorResponse(
          Errors.BadRequest(
            rescheduleValidation.error || "Cannot reschedule this booking"
          )
        );
      }

      const validatedData = rescheduleBookingSchema.parse(body);
      const newScheduledAt = new Date(validatedData.scheduledAt);

      // Validate new booking time
      const timeValidation = validateBookingTime(newScheduledAt);
      if (!timeValidation.valid) {
        return createErrorResponse(
          Errors.BadRequest(timeValidation.error || "Invalid booking time")
        );
      }

      // Validate availability
      const availabilityValidation = validateAvailability(
        newScheduledAt,
        booking.duration,
        booking.tutor.availability
      );
      if (!availabilityValidation.valid) {
        return createErrorResponse(
          Errors.BadRequest(
            availabilityValidation.error || "Time slot not available"
          )
        );
      }

      // Check for conflicts
      const existingBookings = await prisma.booking.findMany({
        where: {
          tutorId: booking.tutorId,
          status: {
            notIn: ["CANCELLED", "REFUNDED"],
          },
        },
      });

      const conflictCheck = checkConflicts(
        newScheduledAt,
        booking.duration,
        booking.tutorId,
        existingBookings,
        booking.id // Exclude current booking
      );

      if (conflictCheck.hasConflict) {
        return createErrorResponse(
          Errors.Conflict(
            "This time slot is already booked. Please choose another time."
          )
        );
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          scheduledAt: newScheduledAt,
          status: BookingStatus.PENDING, // Reset to pending for tutor confirmation
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tutor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      logger.info("Booking rescheduled", {
        bookingId: id,
        oldTime: booking.scheduledAt.toISOString(),
        newTime: newScheduledAt.toISOString(),
      });

      return NextResponse.json({
        message: "Booking rescheduled successfully",
        booking: updatedBooking,
      });
    }

    // Handle status change (tutors/admins can confirm/complete)
    if (body.status) {
      // Only tutors and admins can change status
      if (!isTutor && !isAdmin) {
        return createErrorResponse(
          Errors.Forbidden("Only tutors can change booking status")
        );
      }

      const newStatus = body.status as BookingStatus;
      const statusValidation = validateStatusTransition(
        booking.status,
        newStatus
      );

      if (!statusValidation.valid) {
        return createErrorResponse(
          Errors.BadRequest(
            statusValidation.error || "Invalid status transition"
          )
        );
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: newStatus },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tutor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      logger.info("Booking status updated", {
        bookingId: id,
        oldStatus: booking.status,
        newStatus,
      });

      return NextResponse.json({
        message: "Booking status updated successfully",
        booking: updatedBooking,
      });
    }

    return createErrorResponse(
      Errors.BadRequest("No valid update fields provided")
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.issues[0]?.message || "Invalid request")
      );
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to update booking", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to update booking. Please try again."
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 * 
 * Cancel a booking
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        student: true,
        tutor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) {
      return createErrorResponse(Errors.NotFound("Booking not found"));
    }

    // Verify user has access
    const isStudent = booking.studentId === user.id;
    const isTutor = booking.tutor.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTutor && !isAdmin) {
      return createErrorResponse(
        Errors.Forbidden("You don't have access to this booking")
      );
    }

    // Validate cancellation
    const cancelValidation = canCancelBooking(booking);
    if (!cancelValidation.canCancel) {
      return createErrorResponse(
        Errors.BadRequest(
          cancelValidation.error || "Cannot cancel this booking"
        )
      );
    }

    // Cancel booking
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    logger.info("Booking cancelled", {
      bookingId: id,
      cancelledBy: user.id,
      role: user.role,
    });

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to cancel booking", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to cancel booking. Please try again."
    );
  }
}

