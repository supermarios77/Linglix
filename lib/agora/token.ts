/**
 * Agora RTC Token Generator
 * 
 * Generates secure tokens for Agora video calls using the RtcTokenBuilder.
 * Tokens are generated server-side to prevent exposing app certificates.
 * 
 * @see https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web
 */

import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export interface AgoraTokenParams {
  channelName: string;
  uid: number | string;
  role?: "publisher" | "subscriber";
  expirationTimeInSeconds?: number;
}

/**
 * Generate an Agora RTC token for video calling
 * 
 * @param params Token generation parameters
 * @returns RTC token string
 */
export function generateAgoraToken(params: AgoraTokenParams): string {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error(
      "Agora credentials not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables."
    );
  }

  const {
    channelName,
    uid,
    role = "publisher",
    expirationTimeInSeconds = 3600, // Default 1 hour
  } = params;

  // Convert string UID to number if needed
  const numericUid = typeof uid === "string" ? parseInt(uid, 10) : uid;

  // Determine RTC role
  const rtcRole =
    role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  // Calculate expiration timestamp (current time + expiration in seconds)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // Generate token
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    numericUid,
    rtcRole,
    privilegeExpiredTs
  );

  return token;
}

/**
 * Generate a unique channel name for a booking
 * Format: booking-{bookingId}
 */
export function generateChannelName(bookingId: string): string {
  return `booking-${bookingId}`;
}

/**
 * Generate a unique UID for a user in a session
 * Uses a deterministic hash of userId to ensure same user gets same UID
 */
export function generateUid(userId: string): number {
  // Simple hash function to convert userId to a number
  // This ensures the same user always gets the same UID in the same session
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Ensure positive number and within Agora's UID range
  return Math.abs(hash) % 2147483647;
}

