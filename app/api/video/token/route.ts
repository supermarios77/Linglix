/**
 * Stream Video Token Generation API Route
 * 
 * Generates secure tokens for Stream Video SDK authentication.
 * Tokens are generated server-side to keep API credentials secure.
 */

import { NextRequest, NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";

// Mark as dynamic since it uses authentication headers
export const dynamic = "force-dynamic";

/**
 * GET /api/video/token
 * 
 * Generates a Stream Video token for the authenticated user.
 * Token is used to authenticate with Stream Video SDK on the client side.
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get Stream credentials from environment
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET_KEY;

    // Validate environment variables (check for empty strings too)
    if (!apiKey || !apiKey.trim() || !apiSecret || !apiSecret.trim()) {
      logger.error("Stream credentials not configured", {
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
      });
      return createErrorResponse(
        Errors.InternalServerError("Stream video service is not configured")
      );
    }

    // Validate user ID
    if (!user.id || typeof user.id !== "string") {
      logger.error("Invalid user ID for token generation", {
        userId: user.id,
      });
      return createErrorResponse(
        Errors.BadRequest("Invalid user authentication")
      );
    }

    // Initialize Stream client
    let client: StreamClient;
    try {
      client = new StreamClient(apiKey.trim(), apiSecret.trim());
    } catch (error) {
      logger.error("Failed to initialize Stream client", {
        error: error instanceof Error ? error.message : String(error),
      });
      return createErrorResponse(
        Errors.InternalServerError("Failed to initialize video service")
      );
    }

    // Generate token for the user
    let token: string;
    try {
      token = client.createToken(user.id);
    } catch (error) {
      logger.error("Failed to generate Stream token", {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return createErrorResponse(
        Errors.InternalServerError("Failed to generate video token")
      );
    }

    // Validate token was generated
    if (!token || typeof token !== "string") {
      logger.error("Invalid token generated", {
        userId: user.id,
      });
      return createErrorResponse(
        Errors.InternalServerError("Failed to generate valid video token")
      );
    }

    logger.info("Stream token generated successfully", {
      userId: user.id,
    });

    return NextResponse.json({ token });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    logger.error("Failed to generate Stream token", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return createErrorResponse(
      error,
      "Failed to generate video token. Please try again."
    );
  }
}
