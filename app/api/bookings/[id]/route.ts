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
  isLateCancellation,
  isUserPenalized,
  countLateCancellations,
} from "@/lib/booking/validation";
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
} from "@/lib/email";
import { getBaseUrl, getBookingUrl } from "@/lib/utils/url";

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
      const origin = request.headers.get("origin");
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

      // If tutor is rejecting/cancelling a PENDING booking, process refund
      if (newStatus === BookingStatus.CANCELLED && booking.status === BookingStatus.PENDING && isTutor) {
        const { processRefundWithBookingUpdate } = await import("@/lib/stripe/refunds");
        const refundResult = await processRefundWithBookingUpdate(
          booking.id,
          "tutor_rejected_booking"
        );

        if (refundResult.success && !refundResult.alreadyRefunded) {
          logger.info("Refund processed when tutor rejected booking", {
            bookingId: booking.id,
            refundId: refundResult.refund?.id,
            amount: refundResult.refund?.amount ? refundResult.refund.amount / 100 : undefined,
            tutorId: booking.tutor.userId,
            studentId: booking.studentId,
          });
        } else if (!refundResult.success && !refundResult.alreadyRefunded) {
          logger.error("Failed to process refund when tutor rejected booking", {
            bookingId: booking.id,
            error: refundResult.error,
            bookingNotFound: refundResult.bookingNotFound,
            noPayment: refundResult.noPayment,
            tutorId: booking.tutor.userId,
            studentId: booking.studentId,
          });
          // Continue with cancellation even if refund fails - admin can handle manually
          // This ensures the booking is cancelled even if refund processing has issues
        } else if (refundResult.alreadyRefunded) {
          logger.info("Booking already refunded when tutor rejected (idempotency)", {
            bookingId: booking.id,
          });
        }
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

      // Send confirmation email when tutor confirms booking
      if (newStatus === BookingStatus.CONFIRMED && booking.status === BookingStatus.PENDING) {
        const baseUrl = getBaseUrl(request.headers.get("origin"));
        const bookingUrl = getBookingUrl(id, "en", baseUrl); // TODO: Get locale from user
        
        // Send to student
        if (updatedBooking.student.email) {
          sendBookingConfirmationEmail({
            email: updatedBooking.student.email,
            name: updatedBooking.student.name || undefined,
            tutorName: updatedBooking.tutor.user.name || "Tutor",
            scheduledAt: updatedBooking.scheduledAt,
            duration: updatedBooking.duration,
            price: updatedBooking.price,
            bookingUrl,
            locale: "en", // Default to English - can be enhanced with user preferences later
          }).catch((error) => {
            logger.error("Failed to send booking confirmation email to student", {
              bookingId: id,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }

        // Send to tutor (tutorName should be student's name for tutor's email)
        if (updatedBooking.tutor.user.email) {
          sendBookingConfirmationEmail({
            email: updatedBooking.tutor.user.email,
            name: updatedBooking.tutor.user.name || undefined,
            tutorName: updatedBooking.student.name || "Student",
            scheduledAt: updatedBooking.scheduledAt,
            duration: updatedBooking.duration,
            price: updatedBooking.price,
            bookingUrl,
            locale: "en", // Default to English - can be enhanced with user preferences later
          }).catch((error) => {
            logger.error("Failed to send booking confirmation email to tutor", {
              bookingId: id,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }
      }

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
  const origin = request.headers.get("origin");
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

    // Check if user is penalized (only for students)
    if (isStudent) {
      const penalized = await isUserPenalized(user.id, prisma);
      if (penalized) {
        return createErrorResponse(
          Errors.BadRequest(
            "You are currently penalized and cannot cancel bookings. Please submit an appeal if you believe this is an error."
          )
        );
      }
    }

    // Check if this is a late cancellation (less than 12 hours before)
    const isLate = isLateCancellation(booking);
    const cancelledBy = isStudent ? user.id : booking.tutor.userId;

    // Cancel booking with cancellation details
    const cancelledBooking = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy,
          isLateCancellation: isLate,
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

      // If student cancelled late, check penalty threshold
      if (isStudent && isLate) {
        const lateCancellationCount = await countLateCancellations(user.id, tx);
        
        // If more than 2 late cancellations, apply penalty (1 week ban)
        if (lateCancellationCount > 2) {
          const penaltyUntil = new Date();
          penaltyUntil.setDate(penaltyUntil.getDate() + 7); // 1 week from now

          await tx.user.update({
            where: { id: user.id },
            data: { penaltyUntil },
          });

          logger.warn("Penalty applied to user for late cancellations", {
            userId: user.id,
            lateCancellationCount,
            penaltyUntil: penaltyUntil.toISOString(),
          });
        }
      }

      return updatedBooking;
    });

    logger.info("Booking cancelled", {
      bookingId: id,
      cancelledBy: user.id,
      role: user.role,
    });

    // Process refund if tutor cancelled
    const isTutorCancelling = cancelledBooking.tutor.userId === user.id;
    let refundAmount: number | undefined;
    
    // If tutor cancelled a paid booking, process automatic refund
    if (isTutorCancelling && cancelledBooking.paymentId) {
      const { processRefundWithBookingUpdate } = await import("@/lib/stripe/refunds");
      const refundResult = await processRefundWithBookingUpdate(
        cancelledBooking.id,
        "tutor_cancelled_session"
      );
      
      if (refundResult.success && !refundResult.alreadyRefunded && refundResult.refund) {
        refundAmount = refundResult.refund.amount / 100; // Convert from cents
        
        logger.info("Refund processed for tutor cancellation", {
          bookingId: cancelledBooking.id,
          refundId: refundResult.refund.id,
          amount: refundAmount,
          tutorId: cancelledBooking.tutor.userId,
          studentId: cancelledBooking.studentId,
        });
        
        // Note: Status is already updated to REFUNDED by processRefund function
        // No need to update again here
      } else if (refundResult.alreadyRefunded) {
        // Booking was already refunded (idempotency)
        refundAmount = cancelledBooking.price;
        logger.info("Booking already refunded when tutor cancelled (idempotency)", {
          bookingId: cancelledBooking.id,
        });
      } else {
        // Refund processing failed - log for admin review
        logger.error("Failed to process refund for tutor cancellation", {
          bookingId: cancelledBooking.id,
          error: refundResult.error,
          bookingNotFound: refundResult.bookingNotFound,
          noPayment: refundResult.noPayment,
          tutorId: cancelledBooking.tutor.userId,
          studentId: cancelledBooking.studentId,
        });
        // Still show refund amount in email - admin will need to process manually
        refundAmount = cancelledBooking.price;
      }
    } else if (cancelledBooking.paymentId && !isTutorCancelling) {
      // Student cancelled - show refund amount in email
      // Note: Student cancellations don't auto-refund (they may be penalized)
      refundAmount = cancelledBooking.price;
    }

    // Send to student
    if (cancelledBooking.student.email) {
      sendBookingCancellationEmail({
        email: cancelledBooking.student.email,
        name: cancelledBooking.student.name || undefined,
        tutorName: cancelledBooking.tutor.user.name || undefined,
        scheduledAt: cancelledBooking.scheduledAt,
        refundAmount,
        isTutor: false,
        locale: "en", // Default to English - can be enhanced with user preferences later
      }).catch((error) => {
        logger.error("Failed to send cancellation email to student", {
          bookingId: id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

    // Send to tutor
    if (cancelledBooking.tutor.user.email) {
      sendBookingCancellationEmail({
        email: cancelledBooking.tutor.user.email,
        name: cancelledBooking.tutor.user.name || undefined,
        studentName: cancelledBooking.student.name || undefined,
        scheduledAt: cancelledBooking.scheduledAt,
        refundAmount: undefined, // Tutors don't get refunds
        isTutor: true,
        locale: "en", // Default to English - can be enhanced with user preferences later
      }).catch((error) => {
        logger.error("Failed to send cancellation email to tutor", {
          bookingId: id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

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

