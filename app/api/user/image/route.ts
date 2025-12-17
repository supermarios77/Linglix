import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// Allowed image URL patterns (SSRF protection)
const ALLOWED_IMAGE_DOMAINS = [
  "*.public.blob.vercel-storage.com",
  "lh3.googleusercontent.com",
  "*.googleusercontent.com",
];

function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS
    if (urlObj.protocol !== "https:") {
      return false;
    }
    
    // Check against allowed domains
    return ALLOWED_IMAGE_DOMAINS.some((pattern) => {
      if (pattern.startsWith("*.")) {
        const domain = pattern.slice(2);
        return urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`);
      }
      return urlObj.hostname === pattern;
    });
  } catch {
    return false;
  }
}

const updateImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL").refine(
    (url) => isValidImageUrl(url),
    "Image URL must be from an allowed domain (Vercel Blob Storage or Google)"
  ),
});

/**
 * Update User Image API Route
 * 
 * PATCH /api/user/image
 * 
 * Updates the user's profile picture URL in the database
 */
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, "GENERAL");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    const body = await request.json();
    const { imageUrl } = updateImageSchema.parse(body);

    // Update user image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json(
      {
        message: "Profile picture updated successfully",
        imageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(Errors.BadRequest("Invalid image URL"));
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return createErrorResponse(
          Errors.NotFound("User not found. Please sign in again.")
        );
      }
    }

    return createErrorResponse(
      error,
      "Failed to update profile picture. Please try again."
    );
  }
}
