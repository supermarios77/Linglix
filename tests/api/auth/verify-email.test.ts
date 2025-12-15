/**
 * Tests for Email Verification API Route
 * 
 * Tests email verification flow including:
 * - Successful verification
 * - Invalid token handling
 * - Expired token handling
 * - Already verified email
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/verify-email/route";
import { createMockRequest } from "@/tests/utils/test-helpers";
import { prisma } from "@/lib/db/prisma";
import { verifyEmailVerificationToken } from "@/lib/auth/email-verification";

// Mock dependencies
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/email-verification", () => ({
  verifyEmailVerificationToken: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("POST /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully verify email with valid token", async () => {
    vi.mocked(verifyEmailVerificationToken).mockResolvedValue(true);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      emailVerified: null,
    } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      emailVerified: new Date(),
    } as any);

    const request = createMockRequest("POST", {
      email: "test@example.com",
      token: "valid-token",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.verified).toBe(true);
    expect(data.message).toContain("verified successfully");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { emailVerified: expect.any(Date) },
    });
  });

  it("should reject invalid token", async () => {
    vi.mocked(verifyEmailVerificationToken).mockResolvedValue(false);

    const request = createMockRequest("POST", {
      email: "test@example.com",
      token: "invalid-token",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid or expired");
  });

  it("should handle already verified email", async () => {
    vi.mocked(verifyEmailVerificationToken).mockResolvedValue(true);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      emailVerified: new Date(),
    } as any);

    const request = createMockRequest("POST", {
      email: "test@example.com",
      token: "valid-token",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.verified).toBe(true);
    expect(data.message).toContain("already verified");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("should reject request with missing email", async () => {
    const request = createMockRequest("POST", {
      token: "valid-token",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should reject request with missing token", async () => {
    const request = createMockRequest("POST", {
      email: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
