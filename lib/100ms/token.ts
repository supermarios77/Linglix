/**
 * 100ms Token Generation Utility
 * 
 * Production-ready server-side token generation for 100ms video calls.
 * Tokens must be generated on the server for security.
 */

import crypto from "crypto";

export interface HMS100TokenParams {
  roomId: string;
  userId: string;
  role: string; // e.g., "teacher", "student", "viewer"
  appId: string;
  appSecret: string;
}

/**
 * Generate a 100ms authentication token
 * 
 * @param params Token generation parameters
 * @returns JWT token string
 */
export function generateHMS100Token(params: HMS100TokenParams): string {
  const { roomId, userId, role, appId, appSecret } = params;

  if (!appId || !appSecret) {
    throw new Error(
      "100ms credentials not configured. Please set HMS100_APP_ID and HMS100_APP_SECRET environment variables."
    );
  }

  // JWT Header
  const header = {
    alg: "HS256",
    typ: "JWT",
    access_token: true,
    version: 2,
    iat: Math.floor(Date.now() / 1000),
  };

  // JWT Payload
  const payload = {
    access_key: appId,
    room_id: roomId,
    user_id: userId,
    role: role,
    type: "app",
    jti: crypto.randomUUID(),
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  };

  // Create JWT
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", appSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Base64 URL encode (JWT format)
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generate a unique room ID for a booking
 * Format: booking-{bookingId}
 */
export function generateRoomId(bookingId: string): string {
  return `booking-${bookingId}`;
}

/**
 * Generate a unique user ID for the session
 * Combines user ID and booking ID for uniqueness
 */
export function generateUserId(userId: string, bookingId: string): string {
  return `${userId}-${bookingId}`;
}

