import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { Role } from "@prisma/client";
import { z } from "zod";

/**
 * Availability Schema
 */
const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
  timezone: z.string().optional().default("UTC"),
  isActive: z.boolean().optional().default(true),
});

/**
 * GET /api/tutor/availability
 * Get tutor's availability
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Verify user is a tutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tutorProfile: true },
    });

    if (!user || user.role !== Role.TUTOR || !user.tutorProfile) {
      return createErrorResponse(Errors.Forbidden());
    }

    // Get all availability for this tutor
    const availability = await prisma.availability.findMany({
      where: {
        tutorId: user.tutorProfile.id,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch availability");
  }
}

/**
 * POST /api/tutor/availability
 * Create new availability slot
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Verify user is a tutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tutorProfile: true },
    });

    if (!user || user.role !== Role.TUTOR || !user.tutorProfile) {
      return createErrorResponse(Errors.Forbidden());
    }

    const body = await request.json();
    const validated = availabilitySchema.parse(body);

    // Validate time range
    const [startHour, startMin] = validated.startTime.split(":").map(Number);
    const [endHour, endMin] = validated.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return createErrorResponse(
        Errors.BadRequest("End time must be after start time")
      );
    }

    // Check for overlapping availability on the same day
    const existing = await prisma.availability.findFirst({
      where: {
        tutorId: user.tutorProfile.id,
        dayOfWeek: validated.dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: validated.startTime } },
              { endTime: { gt: validated.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: validated.endTime } },
              { endTime: { gte: validated.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: validated.startTime } },
              { endTime: { lte: validated.endTime } },
            ],
          },
        ],
      },
    });

    if (existing) {
      return createErrorResponse(
        Errors.Conflict("Availability slot overlaps with existing slot")
      );
    }

    // Create availability
    const availability = await prisma.availability.create({
      data: {
        tutorId: user.tutorProfile.id,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        timezone: validated.timezone || "UTC",
        isActive: validated.isActive ?? true,
      },
    });

    return NextResponse.json(
      { availability, message: "Availability created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        Errors.BadRequest(error.errors[0]?.message || "Invalid input")
      );
    }

    return createErrorResponse(error, "Failed to create availability");
  }
}

