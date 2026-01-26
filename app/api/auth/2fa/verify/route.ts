/**
 * 2FA Verify and Enable API Route
 * 
 * POST /api/auth/2fa/verify
 * 
 * Verifies a 2FA token and enables 2FA for the admin account
 * Only available in production
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { createValidationErrorResponse } from "@/lib/errors/validation";
import { verifyToken } from "@/lib/auth/two-factor";
import { Role } from "@prisma/client";
import { z } from "zod";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const verify2FASchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Token must be 6 digits"),
  backupCodes: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Only enable 2FA in production
    if (process.env.NODE_ENV !== "production") {
      return createErrorResponse(
        Errors.BadRequest("2FA is only available in production")
      );
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(request, "GENERAL");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Only admins can enable 2FA
    if (session.user.role !== Role.ADMIN) {
      return createErrorResponse(
        Errors.Forbidden("Only admin accounts can enable 2FA")
      );
    }

    const body = await request.json();
    const validationResult = verify2FASchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(createValidationErrorResponse(validationResult.error));
    }

    const { secret, token, backupCodes } = validationResult.data;

    // Verify the token
    const isValid = await verifyToken(secret, token);

    if (!isValid) {
      return createErrorResponse(
        Errors.BadRequest("Invalid verification code. Please try again.")
      );
    }

    // Enable 2FA and store the secret
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret, // In production, you should encrypt this
        twoFactorBackupCodes: backupCodes || [],
      },
    });

    return NextResponse.json({
      message: "2FA has been enabled successfully",
      backupCodes: backupCodes || [],
    });
  } catch (error) {
    return createErrorResponse(
      error,
      "Failed to enable 2FA. Please try again."
    );
  }
}
