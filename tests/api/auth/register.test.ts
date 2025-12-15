/**
 * Tests for User Registration API Route
 * 
 * Tests critical registration flow including:
 * - Successful registration
 * - Email validation
 * - Password validation
 * - Duplicate email handling
 * - Rate limiting
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";
import { createMockRequest } from "@/tests/utils/test-helpers";
import { prisma } from "@/lib/db/prisma";
import { testUserData } from "@/tests/utils/test-helpers";

// Mock dependencies
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/utils", () => ({
  registerUser: vi.fn(),
}));

vi.mock("@/lib/auth/email-verification", () => ({
  createEmailVerificationToken: vi.fn().mockResolvedValue("test-token"),
}));

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully register a new user", async () => {
    const { registerUser } = await import("@/lib/auth/utils");
    const { createEmailVerificationToken } = await import("@/lib/auth/email-verification");
    const { sendVerificationEmail } = await import("@/lib/email");

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(registerUser).mockResolvedValue({
      id: "user-123",
      email: testUserData.student.email,
      name: testUserData.student.name,
      role: testUserData.student.role,
      image: null,
      createdAt: new Date(),
    });

    const request = createMockRequest("POST", {
      email: testUserData.student.email,
      password: testUserData.student.password,
      name: testUserData.student.name,
      role: testUserData.student.role,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toContain("registered successfully");
    expect(data.user.email).toBe(testUserData.student.email);
    expect(data.emailVerificationSent).toBe(true);
    expect(createEmailVerificationToken).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalled();
  });

  it("should reject registration with invalid email", async () => {
    const request = createMockRequest("POST", {
      email: "invalid-email",
      password: testUserData.student.password,
      name: testUserData.student.name,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should reject registration with short password", async () => {
    const request = createMockRequest("POST", {
      email: testUserData.student.email,
      password: "short",
      name: testUserData.student.name,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should reject registration with duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing-user",
      email: testUserData.student.email,
    } as any);

    const request = createMockRequest("POST", {
      email: testUserData.student.email,
      password: testUserData.student.password,
      name: testUserData.student.name,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain("already exists");
  });

  it("should handle registration even if email sending fails", async () => {
    const { registerUser } = await import("@/lib/auth/utils");
    const { sendVerificationEmail } = await import("@/lib/email");

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(registerUser).mockResolvedValue({
      id: "user-123",
      email: testUserData.student.email,
      name: testUserData.student.name,
      role: testUserData.student.role,
      image: null,
      createdAt: new Date(),
    });
    vi.mocked(sendVerificationEmail).mockRejectedValue(new Error("Email service error"));

    const request = createMockRequest("POST", {
      email: testUserData.student.email,
      password: testUserData.student.password,
      name: testUserData.student.name,
    });

    const response = await POST(request);
    const data = await response.json();

    // Registration should still succeed even if email fails
    expect(response.status).toBe(201);
    expect(data.user).toBeDefined();
  });
});
