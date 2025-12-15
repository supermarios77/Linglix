/**
 * Forgot Password API Route
 * 
 * POST /api/auth/forgot-password
 * 
 * Sends a password reset email to the user
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils/url";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * POST /api/auth/forgot-password
 * 
 * Request a password reset email
 * Rate limited: 5 requests per 15 minutes
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimit = await checkRateLimit(request, "AUTH");
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
  }

  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return createErrorResponse(
        Errors.BadRequest(validatedData.error.errors[0]?.message || "Invalid email address")
      );
    }

    const { email } = validatedData.data;
    const emailLower = email.toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // Check if user has a password (not OAuth-only)
      },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists and has a password
    if (user && user.password) {
      try {
        // Generate reset token
        const token = await createPasswordResetToken(emailLower);
        
        // Generate reset URL
        const baseUrl = getBaseUrl(request.headers.get("origin"));
        const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(emailLower)}`;
        
        // Send reset email
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name || undefined,
          resetUrl,
          locale: "en", // Default to English - can be enhanced with user preferences later
        });

        logger.info("Password reset email sent", {
          userId: user.id,
          email: emailLower,
        });
      } catch (error) {
        // Log error but don't reveal to user
        logger.error("Failed to send password reset email", {
          email: emailLower,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      // Log attempt for non-existent user or OAuth-only user (for security monitoring)
      logger.info("Password reset requested for non-existent or OAuth-only user", {
        email: emailLower,
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    logger.error("Failed to process password reset request", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to process password reset request. Please try again."
    );
  }
}
