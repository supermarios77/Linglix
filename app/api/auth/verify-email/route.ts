/**
 * Email Verification API Route
 * 
 * POST /api/auth/verify-email
 * 
 * Verifies a user's email address using a token
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyEmailVerificationToken } from "@/lib/auth/email-verification";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Token is required"),
});

/**
 * POST /api/auth/verify-email
 * 
 * Verify email with token
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
    const validatedData = verifyEmailSchema.safeParse(body);

    if (!validatedData.success) {
      return createErrorResponse(
        Errors.BadRequest(validatedData.error.errors[0]?.message || "Invalid request data")
      );
    }

    const { email, token } = validatedData.data;
    const emailLower = email.toLowerCase();

    // Verify token
    const isValidToken = await verifyEmailVerificationToken(emailLower, token);
    
    if (!isValidToken) {
      return createErrorResponse(
        Errors.BadRequest("Invalid or expired verification token. Please request a new verification email.")
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return createErrorResponse(
        Errors.NotFound("User not found")
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "Email is already verified.",
        verified: true,
      });
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    logger.info("Email verified successfully", {
      userId: user.id,
      email: emailLower,
    });

    return NextResponse.json({
      message: "Email has been verified successfully.",
      verified: true,
    });
  } catch (error) {
    logger.error("Failed to verify email", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to verify email. Please try again."
    );
  }
}
