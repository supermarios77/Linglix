/**
 * Tests for Booking Creation API Route
 * 
 * Tests booking creation flow including:
 * - Successful booking creation
 * - Availability validation
 * - Conflict detection
 * - Penalty checks
 * - Price calculation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/bookings/route";
import { createMockRequest } from "@/tests/utils/test-helpers";
import { prisma } from "@/lib/db/prisma";
import { Role, BookingStatus, TutorApprovalStatus } from "@prisma/client";
import { futureDate } from "@/tests/utils/test-helpers";

// Mock dependencies
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    tutorProfile: {
      findUnique: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/booking/validation", () => ({
  createBookingSchema: {
    parse: vi.fn((data) => data),
  },
  validateBookingTime: vi.fn().mockReturnValue({ valid: true }),
  validateAvailability: vi.fn().mockReturnValue({ valid: true }),
  checkConflicts: vi.fn().mockReturnValue({ hasConflict: false }),
  calculatePrice: vi.fn().mockReturnValue(30.0),
  isUserPenalized: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/booking/availability", () => ({
  checkTimeSlotAvailability: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("POST /api/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully create a booking", async () => {
    const { requireRole } = await import("@/lib/auth");
    const scheduledAt = futureDate(24); // 24 hours from now

    vi.mocked(requireRole).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: Role.STUDENT,
    });
    vi.mocked(prisma.tutorProfile.findUnique).mockResolvedValue({
      id: "tutor-123",
      userId: "tutor-user-123",
      hourlyRate: 30.0,
      isActive: true,
      approvalStatus: TutorApprovalStatus.APPROVED,
      availability: [],
      user: {
        id: "tutor-user-123",
        email: "tutor@test.com",
        name: "Test Tutor",
      },
    } as any);
    vi.mocked(prisma.booking.findMany).mockResolvedValue([]); // No conflicts
    vi.mocked(prisma.booking.create).mockResolvedValue({
      id: "booking-123",
      studentId: "student-123",
      tutorId: "tutor-123",
      scheduledAt,
      duration: 60,
      price: 30.0,
      status: BookingStatus.PENDING,
    } as any);

    const request = createMockRequest("POST", {
      tutorId: "tutor-123",
      scheduledAt: scheduledAt.toISOString(),
      duration: 60,
      notes: "Test booking",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.booking).toBeDefined();
    expect(data.booking.tutorId).toBe("tutor-123");
    expect(data.booking.price).toBe(30.0);
  });

  it("should reject booking from penalized user", async () => {
    const { requireRole } = await import("@/lib/auth");
    const { isUserPenalized } = await import("@/lib/booking/validation");

    vi.mocked(requireRole).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: Role.STUDENT,
    });
    vi.mocked(isUserPenalized).mockResolvedValue(true);

    const request = createMockRequest("POST", {
      tutorId: "tutor-123",
      scheduledAt: futureDate(24).toISOString(),
      duration: 60,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("penalized");
  });

  it("should reject booking for inactive tutor", async () => {
    const { requireRole } = await import("@/lib/auth");

    vi.mocked(requireRole).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: Role.STUDENT,
    });
    vi.mocked(prisma.tutorProfile.findUnique).mockResolvedValue({
      id: "tutor-123",
      userId: "tutor-user-123",
      hourlyRate: 30.0,
      isActive: false, // Inactive
      approvalStatus: TutorApprovalStatus.APPROVED,
      user: {
        id: "tutor-user-123",
        email: "tutor@test.com",
        name: "Test Tutor",
      },
    } as any);

    const request = createMockRequest("POST", {
      tutorId: "tutor-123",
      scheduledAt: futureDate(24).toISOString(),
      duration: 60,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("not active");
  });

  it("should reject booking for unapproved tutor", async () => {
    const { requireRole } = await import("@/lib/auth");

    vi.mocked(requireRole).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: Role.STUDENT,
    });
    vi.mocked(prisma.tutorProfile.findUnique).mockResolvedValue({
      id: "tutor-123",
      userId: "tutor-user-123",
      hourlyRate: 30.0,
      isActive: true,
      approvalStatus: TutorApprovalStatus.PENDING, // Not approved
      user: {
        id: "tutor-user-123",
        email: "tutor@test.com",
        name: "Test Tutor",
      },
    } as any);

    const request = createMockRequest("POST", {
      tutorId: "tutor-123",
      scheduledAt: futureDate(24).toISOString(),
      duration: 60,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("not approved");
  });

  it("should reject booking with invalid time", async () => {
    const { requireRole } = await import("@/lib/auth");
    const { validateBookingTime } = await import("@/lib/booking/validation");

    vi.mocked(requireRole).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: Role.STUDENT,
    });
    vi.mocked(validateBookingTime).mockReturnValue({
      valid: false,
      error: "Booking must be at least 24 hours in advance",
    });

    const request = createMockRequest("POST", {
      tutorId: "tutor-123",
      scheduledAt: futureDate(12).toISOString(), // Too soon
      duration: 60,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("24 hours");
  });

  it("should reject booking with conflicts", async () => {
    const { requireRole } = await import("@/lib/auth");
    const { checkConflicts } = await import("@/lib/booking/validation");

    vi.mocked(requireRole).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: Role.STUDENT,
    });
    vi.mocked(prisma.tutorProfile.findUnique).mockResolvedValue({
      id: "tutor-123",
      userId: "tutor-user-123",
      hourlyRate: 30.0,
      isActive: true,
      approvalStatus: TutorApprovalStatus.APPROVED,
      user: {
        id: "tutor-user-123",
        email: "tutor@test.com",
        name: "Test Tutor",
      },
    } as any);
    vi.mocked(checkConflicts).mockReturnValue({
      hasConflict: true,
      conflictingBooking: { id: "conflict-123" },
    });

    const request = createMockRequest("POST", {
      tutorId: "tutor-123",
      scheduledAt: futureDate(24).toISOString(),
      duration: 60,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("conflict");
  });
});
