/**
 * Email Service
 * 
 * Centralized email sending functionality
 * Exports all email templates and utilities
 */

export { resend, sendEmail, FROM_EMAIL, FROM_NAME } from "./resend";
export {
  emailVerificationTemplate,
  welcomeEmailTemplate,
  tutorApprovalTemplate,
  passwordResetTemplate,
} from "./templates";

/**
 * Send email verification email
 */
export async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
  locale,
}: {
  email: string;
  name?: string;
  verificationUrl: string;
  locale?: string;
}) {
  return sendEmail({
    to: email,
    subject: "Verify your email address - Linglix",
    html: emailVerificationTemplate({ name, verificationUrl, locale }),
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail({
  email,
  name,
  role,
  locale,
}: {
  email: string;
  name?: string;
  role: "STUDENT" | "TUTOR";
  locale?: string;
}) {
  return sendEmail({
    to: email,
    subject: `Welcome to Linglix${name ? `, ${name}` : ""}!`,
    html: welcomeEmailTemplate({ name, role, locale }),
  });
}

/**
 * Send tutor approval/rejection email
 */
export async function sendTutorApprovalEmail({
  email,
  name,
  approved,
  rejectionReason,
  locale,
}: {
  email: string;
  name?: string;
  approved: boolean;
  rejectionReason?: string;
  locale?: string;
}) {
  return sendEmail({
    to: email,
    subject: approved
      ? "Your tutor profile has been approved! - Linglix"
      : "Tutor profile review update - Linglix",
    html: tutorApprovalTemplate({ name, approved, rejectionReason, locale }),
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
  locale,
}: {
  email: string;
  name?: string;
  resetUrl: string;
  locale?: string;
}) {
  return sendEmail({
    to: email,
    subject: "Reset your password - Linglix",
    html: passwordResetTemplate({ name, resetUrl, locale }),
  });
}

