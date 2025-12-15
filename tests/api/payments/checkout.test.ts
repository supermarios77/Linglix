/**
 * Tests for Payment Checkout API Route
 * 
 * Tests payment checkout flow including:
 * - Successful checkout session creation
 * - Booking validation
 * - Authorization checks
 * - Stripe integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/payments/checkout/route";
import { createMockRequest } from "@/tests/utils/test-helpers";
import { prisma } from "@/lib/db/prisma";
import { getStripeClient } from "@/lib/stripe/client";
import { BookingStatus } from "@prisma/client";

// Mock dependencies
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: vi.fn(),
  isStripeConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("POST /api/payments/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create checkout session for valid booking", async () => {
    const { requireAuth } = await import("@/lib/auth");
    const mockStripe = {
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/test",
          }),
        },
      },
    };

    vi.mocked(requireAuth).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: "STUDENT" as any,
    });
    vi.mocked(getStripeClient).mockReturnValue(mockStripe as any);
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({
      id: "booking-123",
      studentId: "student-123",
      tutorId: "tutor-123",
      scheduledAt: new Date(),
      duration: 60,
      price: 30.0,
      status: BookingStatus.CONFIRMED,
      student: {
        id: "student-123",
        email: "student@test.com",
        name: "Test Student",
      },
      tutor: {
        user: {
          id: "tutor-123",
          email: "tutor@test.com",
          name: "Test Tutor",
        },
      },
    } as any);

    const request = createMockRequest("POST", {
      bookingId: "booking-123",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.checkoutUrl).toBe("https://checkout.stripe.com/test");
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          bookingId: "booking-123",
        }),
      })
    );
  });

  it("should reject checkout for non-existent booking", async () => {
    const { requireAuth } = await import("@/lib/auth");

    vi.mocked(requireAuth).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: "STUDENT" as any,
    });
    vi.mocked(prisma.booking.findUnique).mockResolvedValue(null);

    const request = createMockRequest("POST", {
      bookingId: "non-existent",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("not found");
  });

  it("should reject checkout for booking not owned by user", async () => {
    const { requireAuth } = await import("@/lib/auth");

    vi.mocked(requireAuth).mockResolvedValue({
      id: "other-student-123",
      email: "other@test.com",
      name: "Other Student",
      role: "STUDENT" as any,
    });
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({
      id: "booking-123",
      studentId: "student-123", // Different student
      tutorId: "tutor-123",
      scheduledAt: new Date(),
      duration: 60,
      price: 30.0,
      status: BookingStatus.CONFIRMED,
    } as any);

    const request = createMockRequest("POST", {
      bookingId: "booking-123",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("own bookings");
  });

  it("should reject checkout for booking not in CONFIRMED status", async () => {
    const { requireAuth } = await import("@/lib/auth");

    vi.mocked(requireAuth).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: "STUDENT" as any,
    });
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({
      id: "booking-123",
      studentId: "student-123",
      tutorId: "tutor-123",
      scheduledAt: new Date(),
      duration: 60,
      price: 30.0,
      status: BookingStatus.PENDING, // Not confirmed
    } as any);

    const request = createMockRequest("POST", {
      bookingId: "booking-123",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("confirmed");
  });

  it("should handle Stripe service not configured", async () => {
    const { requireAuth } = await import("@/lib/auth");
    const { isStripeConfigured } = await import("@/lib/stripe/client");

    vi.mocked(requireAuth).mockResolvedValue({
      id: "student-123",
      email: "student@test.com",
      name: "Test Student",
      role: "STUDENT" as any,
    });
    vi.mocked(isStripeConfigured).mockReturnValue(false);

    const request = createMockRequest("POST", {
      bookingId: "booking-123",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("not configured");
  });
});
