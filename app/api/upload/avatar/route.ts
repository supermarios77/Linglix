import { auth } from "@/config/auth";
import { put } from "@vercel/blob";
import { createErrorResponse, Errors } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

/**
 * Upload Avatar API Route
 * 
 * POST /api/upload/avatar
 * 
 * Uploads a user's profile picture to Vercel Blob Storage
 * Returns the URL of the uploaded image
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Check if Vercel Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return createErrorResponse(
        Errors.InternalServerError("Image upload is not configured. Please contact support.")
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createErrorResponse(Errors.BadRequest("No file provided"));
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse(
        Errors.BadRequest("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.")
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return createErrorResponse(
        Errors.BadRequest("File size too large. Please upload an image smaller than 5MB.")
      );
    }

    // Generate a unique filename
    const filename = `avatars/${session.user.id}-${Date.now()}-${file.name}`;

    // Upload to Vercel Blob
    // Note: @vercel/blob v2 automatically uses BLOB_READ_WRITE_TOKEN from environment
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json(
      {
        url: blob.url,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      error,
      "Failed to upload image. Please try again."
    );
  }
}
