/**
 * Test Setup File
 * 
 * This file runs before all tests to set up the testing environment
 */

import { afterEach, vi } from "vitest";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.NEXTAUTH_SECRET = "test-secret-key-for-testing-only";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://test:test@localhost:5432/test";

// Mock external services (these can be overridden in individual test files)
vi.mock("@/lib/email", async () => {
  const actual = await vi.importActual("@/lib/email");
  return {
    ...actual,
    sendVerificationEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
    sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
    sendPaymentReceiptEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
  };
});

vi.mock("@/lib/stripe/client", async () => {
  const actual = await vi.importActual("@/lib/stripe/client");
  return {
    ...actual,
    getStripeClient: vi.fn(),
    isStripeConfigured: vi.fn().mockReturnValue(true),
  };
});

vi.mock("@/lib/rate-limit", async () => {
  const actual = await vi.importActual("@/lib/rate-limit");
  return {
    ...actual,
    checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
    createRateLimitResponse: vi.fn(),
  };
});

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
