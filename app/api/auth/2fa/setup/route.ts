/**
 * 2FA Setup API Route
 * 
 * POST /api/auth/2fa/setup
 * 
 * Generates a 2FA secret and QR code for admin accounts
 * Only available in production
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { generateSecret, generateQRCode, generateBackupCodes } from "@/lib/auth/two-factor";
import { Role } from "@prisma/client";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

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

    // Only admins can set up 2FA
    if (session.user.role !== Role.ADMIN) {
      return createErrorResponse(
        Errors.Forbidden("Only admin accounts can enable 2FA")
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, twoFactorEnabled: true },
    });

    if (!user || user.role !== Role.ADMIN) {
      return createErrorResponse(Errors.NotFound("User not found"));
    }

    // Generate secret and QR code
    const secret = generateSecret();
    const qrCode = await generateQRCode(secret, user.email!);
    const backupCodes = generateBackupCodes();

    // Store secret temporarily (not enabled yet - user needs to verify first)
    // We'll store it in a way that requires verification before enabling
    // For now, return the secret and QR code to the client
    // The client will call /api/auth/2fa/verify to enable it

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes,
      message: "Scan the QR code with your authenticator app and verify to enable 2FA",
    });
  } catch (error) {
    return createErrorResponse(
      error,
      "Failed to set up 2FA. Please try again."
    );
  }
}
