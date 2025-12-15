import { NextRequest, NextResponse } from "next/server";
import { registerUser, registerSchema } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";
import { createEmailVerificationToken } from "@/lib/auth/email-verification";
import { sendVerificationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils/url";
import { logger } from "@/lib/logger";
import { captureAuthError } from "@/lib/monitoring/sentry-alerts";

/**
 * User Registration API Route
 * 
 * POST /api/auth/register
 * 
 * Registers a new user with email/password
 * 
 * Production considerations:
 * - Input validation with Zod
 * - Password hashing with bcrypt
 * - Email uniqueness check
 * - Error handling
 * - Rate limiting (5 requests per 15 minutes)
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimit = await checkRateLimit(request, "AUTH");
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
  }
  let body: unknown = null;
  
  try {
    body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw Errors.Conflict("User with this email already exists");
    }

    // Register user
    const user = await registerUser(validatedData);

    // Send verification email (non-blocking)
    try {
      const token = await createEmailVerificationToken(user.email);
      const baseUrl = getBaseUrl(request.headers.get("origin"));
      const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
      
      await sendVerificationEmail({
        email: user.email,
        name: user.name || undefined,
        verificationUrl,
        locale: "en", // Default to English - can be enhanced with user preferences later
      });

      logger.info("Verification email sent after registration", {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      // Log error but don't fail registration
      logger.error("Failed to send verification email after registration", {
        userId: user.id,
        email: user.email,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return NextResponse.json(
      {
        message: "User registered successfully. Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        emailVerificationSent: true,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors - don't leak validation details
    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(
        Errors.BadRequest("Invalid input. Please check your email and password.")
      );
    }

    // Handle Prisma unique constraint errors (email already exists)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return createErrorResponse(
        Errors.Conflict("User with this email already exists")
      );
    }

    // Handle HttpError (from requireAuth, etc.)
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    // Log error to Sentry in production
    if (process.env.NODE_ENV === "production") {
      const { captureException } = await import("@sentry/nextjs");
      captureException(error, {
        tags: {
          route: "/api/auth/register",
          method: "POST",
        },
        extra: {
          hasEmail: body && typeof body === "object" && "email" in body ? "***" : undefined, // Don't log actual email
        },
      });
    } else {
      // In development, log using logger; in production, Sentry handles it
      logger.error("Registration error", error instanceof Error ? error : new Error(String(error)));
    }

    // Generic error message - don't leak internal details
    return createErrorResponse(
      error,
      "Failed to register user. Please try again."
    );
  }
}
