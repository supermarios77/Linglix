/**
 * Two-Factor Authentication Utilities
 * 
 * Provides TOTP (Time-based One-Time Password) functionality for admin accounts
 * Only enabled in production environment
 */

import { generateSecret as otplibGenerateSecret, generate, verify, generateURI } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

// Only enable 2FA in production
const is2FAEnabled = process.env.NODE_ENV === "production";

/**
 * Generate a secret for TOTP
 */
export function generateSecret(): string {
  if (!is2FAEnabled) {
    throw new Error("2FA is only available in production");
  }
  return otplibGenerateSecret();
}

/**
 * Generate a QR code data URL for the secret
 */
export async function generateQRCode(
  secret: string,
  email: string,
  issuer: string = "Linglix"
): Promise<string> {
  if (!is2FAEnabled) {
    throw new Error("2FA is only available in production");
  }

  const otpauth = generateURI({
    issuer,
    label: email,
    secret,
  });
  return QRCode.toDataURL(otpauth);
}

/**
 * Verify a TOTP token
 */
export async function verifyToken(secret: string, token: string): Promise<boolean> {
  if (!is2FAEnabled) {
    // In development, always return true to bypass 2FA
    return true;
  }

  try {
    const result = await verify({ secret, token });
    return result.valid;
  } catch (error) {
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 8): string[] {
  if (!is2FAEnabled) {
    return [];
  }

  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-digit backup codes
    const code = crypto.randomInt(10000000, 99999999).toString();
    codes.push(code);
  }
  return codes;
}

/**
 * Verify a backup code
 */
export function verifyBackupCode(
  code: string,
  backupCodes: string[]
): { valid: boolean; remainingCodes: string[] } {
  if (!is2FAEnabled) {
    return { valid: true, remainingCodes: backupCodes };
  }

  const index = backupCodes.indexOf(code);
  if (index === -1) {
    return { valid: false, remainingCodes: backupCodes };
  }

  // Remove used backup code
  const remainingCodes = backupCodes.filter((_, i) => i !== index);
  return { valid: true, remainingCodes };
}

/**
 * Check if 2FA is required for a user
 */
export function is2FARequired(role: string, twoFactorEnabled: boolean): boolean {
  if (!is2FAEnabled) {
    return false;
  }

  // Only admins require 2FA
  return role === "ADMIN" && twoFactorEnabled;
}
