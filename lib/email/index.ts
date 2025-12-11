/**
 * Email Service
 * 
 * Centralized email sending functionality
 * Exports all email templates and utilities
 */

import { sendEmail } from "./resend";
import {
  emailVerificationTemplate,
  welcomeEmailTemplate,
  tutorApprovalTemplate,
  passwordResetTemplate,
  bookingConfirmationTemplate,
  paymentReceiptTemplate,
  sessionReminderTemplate,
  bookingCancellationTemplate,
} from "./templates";

export { resend, sendEmail, FROM_EMAIL, FROM_NAME } from "./resend";
export {
  emailVerificationTemplate,
  welcomeEmailTemplate,
  tutorApprovalTemplate,
  passwordResetTemplate,
  bookingConfirmationTemplate,
  paymentReceiptTemplate,
  sessionReminderTemplate,
  bookingCancellationTemplate,
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

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail({
  email,
  name,
  tutorName,
  scheduledAt,
  duration,
  price,
  bookingUrl,
  locale,
}: {
  email: string;
  name?: string;
  tutorName: string;
  scheduledAt: Date;
  duration: number;
  price: number;
  bookingUrl?: string;
  locale?: string;
}) {
  return sendEmail({
    to: email,
    subject: `Booking confirmed with ${tutorName} - Linglix`,
    html: bookingConfirmationTemplate({
      name,
      tutorName,
      scheduledAt,
      duration,
      price,
      bookingUrl,
      locale,
    }),
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail({
  email,
  name,
  amount,
  currency,
  bookingId,
  tutorName,
  scheduledAt,
  receiptUrl,
  locale,
}: {
  email: string;
  name?: string;
  amount: number;
  currency: string;
  bookingId: string;
  tutorName: string;
  scheduledAt: Date;
  receiptUrl?: string;
  locale?: string;
}) {
  return sendEmail({
    to: email,
    subject: `Payment receipt - Booking ${bookingId} - Linglix`,
    html: paymentReceiptTemplate({
      name,
      amount,
      currency,
      bookingId,
      tutorName,
      scheduledAt,
      receiptUrl,
      locale,
    }),
  });
}

/**
 * Send session reminder email
 */
export async function sendSessionReminderEmail({
  email,
  name,
  tutorName,
  scheduledAt,
  duration,
  sessionUrl,
  hoursUntil,
  locale,
}: {
  email: string;
  name?: string;
  tutorName: string;
  scheduledAt: Date;
  duration: number;
  sessionUrl: string;
  hoursUntil: number;
  locale?: string;
}) {
  const timeText = hoursUntil === 24 ? "24 hours" : hoursUntil === 1 ? "1 hour" : `${hoursUntil} hours`;
  
  return sendEmail({
    to: email,
    subject: `Session reminder: Your session starts in ${timeText} - Linglix`,
    html: sessionReminderTemplate({
      name,
      tutorName,
      scheduledAt,
      duration,
      sessionUrl,
      hoursUntil,
      locale,
    }),
  });
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellationEmail({
  email,
  name,
  tutorName,
  studentName,
  scheduledAt,
  refundAmount,
  isTutor,
  locale,
}: {
  email: string;
  name?: string;
  tutorName?: string;
  studentName?: string;
  scheduledAt: Date;
  refundAmount?: number;
  isTutor: boolean;
  locale?: string;
}) {
  return sendEmail({
    to: email,
    subject: "Booking cancelled - Linglix",
    html: bookingCancellationTemplate({
      name,
      tutorName,
      studentName,
      scheduledAt,
      refundAmount,
      isTutor,
      locale,
    }),
  });
}

