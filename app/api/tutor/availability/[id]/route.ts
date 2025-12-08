import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { Role } from "@prisma/client";
import { z } from "zod";

/**
 * Update Availability Schema
 */
const updateAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/tutor/availability/[id]
 * Update availability slot
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    const { id } = await params;

    // Verify user is a tutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tutorProfile: true },
    });

    if (!user || user.role !== Role.TUTOR || !user.tutorProfile) {
      return createErrorResponse(Errors.Forbidden());
    }

    // Verify availability belongs to this tutor
    const existing = await prisma.availability.findUnique({
      where: { id },
    });

    if (!existing || existing.tutorId !== user.tutorProfile.id) {
      return createErrorResponse(Errors.NotFound("Availability not found"));
    }

    const body = await request.json();
    const validated = updateAvailabilitySchema.parse(body);

    // If updating times, validate them
    if (validated.startTime || validated.endTime) {
      const startTime = validated.startTime || existing.startTime;
      const endTime = validated.endTime || existing.endTime;

      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return createErrorResponse(
          Errors.BadRequest("End time must be after start time")
        );
      }

      // Check for overlapping availability (excluding current slot)
      const dayOfWeek = validated.dayOfWeek ?? existing.dayOfWeek;
      const overlapping = await prisma.availability.findFirst({
        where: {
          tutorId: user.tutorProfile.id,
          dayOfWeek,
          isActive: true,
          id: { not: id },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        return createErrorResponse(
          Errors.Conflict("Availability slot overlaps with existing slot")
        );
      }
    }

    // Update availability
    const availability = await prisma.availability.update({
      where: { id },
      data: {
        ...(validated.dayOfWeek !== undefined && { dayOfWeek: validated.dayOfWeek }),
        ...(validated.startTime !== undefined && { startTime: validated.startTime }),
        ...(validated.endTime !== undefined && { endTime: validated.endTime }),
        ...(validated.timezone !== undefined && { timezone: validated.timezone }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    return NextResponse.json(
      { availability, message: "Availability updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.errors[0]?.message || "Invalid input")
      );
    }

    return createErrorResponse(error, "Failed to update availability");
  }
}

/**
 * DELETE /api/tutor/availability/[id]
 * Delete availability slot
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    const { id } = await params;

    // Verify user is a tutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tutorProfile: true },
    });

    if (!user || user.role !== Role.TUTOR || !user.tutorProfile) {
      return createErrorResponse(Errors.Forbidden());
    }

    // Verify availability belongs to this tutor
    const existing = await prisma.availability.findUnique({
      where: { id },
    });

    if (!existing || existing.tutorId !== user.tutorProfile.id) {
      return createErrorResponse(Errors.NotFound("Availability not found"));
    }

    // Delete availability
    await prisma.availability.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Availability deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to delete availability");
  }
}

