/**
 * Tests for Password Reset API Routes
 * 
 * Tests password reset flow including:
 * - Forgot password request
 * - Password reset with token
 * - Invalid token handling
 * - Expired token handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as forgotPasswordPOST } from "@/app/api/auth/forgot-password/route";
import { POST as resetPasswordPOST } from "@/app/api/auth/reset-password/route";
import { createMockRequest } from "@/tests/utils/test-helpers";
import { prisma } from "@/lib/db/prisma";
import { createPasswordResetToken, verifyPasswordResetToken } from "@/lib/auth/password-reset";

// Mock dependencies
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/password-reset", () => ({
  createPasswordResetToken: vi.fn(),
  verifyPasswordResetToken: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send password reset email for existing user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      password: "hashed-password",
    } as any);
    vi.mocked(createPasswordResetToken).mockResolvedValue("reset-token-123");

    const request = createMockRequest("POST", {
      email: "test@example.com",
    });

    const response = await forgotPasswordPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBeDefined();
    expect(createPasswordResetToken).toHaveBeenCalledWith("test@example.com");
  });

  it("should return success even for non-existent user (prevent enumeration)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const request = createMockRequest("POST", {
      email: "nonexistent@example.com",
    });

    const response = await forgotPasswordPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBeDefined();
    // Should not reveal that user doesn't exist
  });
});

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully reset password with valid token", async () => {
    vi.mocked(verifyPasswordResetToken).mockResolvedValue(true);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      password: "old-hashed-password",
    } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    } as any);

    const request = createMockRequest("POST", {
      email: "test@example.com",
      token: "valid-token",
      password: "newpassword123",
    });

    const response = await resetPasswordPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain("reset successfully");
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it("should reject invalid token", async () => {
    vi.mocked(verifyPasswordResetToken).mockResolvedValue(false);

    const request = createMockRequest("POST", {
      email: "test@example.com",
      token: "invalid-token",
      password: "newpassword123",
    });

    const response = await resetPasswordPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid or expired");
  });

  it("should reject short password", async () => {
    const request = createMockRequest("POST", {
      email: "test@example.com",
      token: "valid-token",
      password: "short", // Too short
    });

    const response = await resetPasswordPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
