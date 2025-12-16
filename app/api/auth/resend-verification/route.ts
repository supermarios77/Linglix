/**
 * Resend Email Verification API Route
 * 
 * POST /api/auth/resend-verification
 * 
 * Resends an email verification email to the user
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createEmailVerificationToken } from "@/lib/auth/email-verification";
import { sendVerificationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils/url";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth";
import { createValidationErrorResponse } from "@/lib/errors/validation";

export const dynamic = "force-dynamic";

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
});

/**
 * POST /api/auth/resend-verification
 * 
 * Resend verification email
 * Rate limited: 5 requests per 15 minutes
 * 
 * Can be called:
 * - With email in body (for unauthenticated users)
 * - Without email (uses authenticated user's email)
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimit = await checkRateLimit(request, "AUTH");
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const validatedData = resendVerificationSchema.safeParse(body);

    if (!validatedData.success) {
      return createErrorResponse(
        createValidationErrorResponse(validatedData.error)
      );
    }

    let email: string;

    // Try to get email from authenticated user first
    try {
      const user = await requireAuth();
      email = user.email;
    } catch {
      // If not authenticated, use email from body
      if (!validatedData.data.email) {
        return createErrorResponse(
          Errors.Unauthorized("Authentication required or email must be provided")
        );
      }
      email = validatedData.data.email;
    }

    const emailLower = email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // Always return success to prevent email enumeration
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a verification email.",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "Email is already verified.",
        verified: true,
      });
    }

    // Generate verification token
    const token = await createEmailVerificationToken(emailLower);
    
    // Generate verification URL
    const baseUrl = getBaseUrl(request.headers.get("origin"));
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(emailLower)}`;
    
    // Send verification email
    await sendVerificationEmail({
      email: user.email,
      name: user.name || undefined,
      verificationUrl,
      locale: "en", // Default to English - can be enhanced with user preferences later
    });

    logger.info("Verification email sent", {
      userId: user.id,
      email: emailLower,
    });

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists and is not verified, we've sent a verification email.",
    });
  } catch (error) {
    logger.error("Failed to resend verification email", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to resend verification email. Please try again."
    );
  }
}
