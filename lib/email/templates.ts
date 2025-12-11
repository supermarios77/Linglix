/**
 * Email Templates
 * 
 * Production-ready email templates for Linglix
 * All templates are responsive and work in both light and dark mode email clients
 */

interface EmailVerificationProps {
  name?: string;
  verificationUrl: string;
  locale?: string;
}

interface WelcomeEmailProps {
  name?: string;
  role: "STUDENT" | "TUTOR";
  locale?: string;
}

interface TutorApprovalProps {
  name?: string;
  approved: boolean;
  rejectionReason?: string;
  locale?: string;
}

interface PasswordResetProps {
  name?: string;
  resetUrl: string;
  locale?: string;
}

interface BookingConfirmationProps {
  name?: string;
  tutorName: string;
  scheduledAt: Date;
  duration: number;
  price: number;
  bookingUrl?: string;
  locale?: string;
}

interface PaymentReceiptProps {
  name?: string;
  amount: number;
  currency: string;
  bookingId: string;
  tutorName: string;
  scheduledAt: Date;
  receiptUrl?: string;
  locale?: string;
}

interface SessionReminderProps {
  name?: string;
  tutorName: string;
  scheduledAt: Date;
  duration: number;
  sessionUrl: string;
  hoursUntil: number;
  locale?: string;
}

interface BookingCancellationProps {
  name?: string;
  tutorName?: string;
  studentName?: string;
  scheduledAt: Date;
  refundAmount?: number;
  isTutor: boolean;
  locale?: string;
}

/**
 * Base email template wrapper
 */
function baseTemplate(content: string, locale: string = "en") {
  const isRTL = locale === "ar" || locale === "he";
  
  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${isRTL ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Linglix</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #111;
      background-color: #fafafa;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #111 0%, #222 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #111;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .button:hover {
      background-color: #222;
    }
    .footer {
      padding: 24px;
      text-align: center;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #e5e5e5;
    }
    .footer a {
      color: #111;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Linglix</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Linglix. All rights reserved.</p>
      <p>
        <a href="https://linglix.com">Visit our website</a> | 
        <a href="https://linglix.com/support">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email verification template
 */
export function emailVerificationTemplate({
  name,
  verificationUrl,
  locale = "en",
}: EmailVerificationProps): string {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const content = `
    <h2 style="margin-top: 0; color: #111;">Verify Your Email</h2>
    <p>${greeting}</p>
    <p>Thank you for signing up for Linglix! Please verify your email address by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email</a>
    </div>
    <p style="color: #666; font-size: 14px; margin-top: 24px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verificationUrl}" style="color: #111; word-break: break-all;">${verificationUrl}</a>
    </p>
    <p style="color: #666; font-size: 14px;">
      This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
  `;
  
  return baseTemplate(content, locale);
}

/**
 * Welcome email template
 */
export function welcomeEmailTemplate({
  name,
  role,
  locale = "en",
}: WelcomeEmailProps): string {
  const greeting = name ? `Welcome to Linglix, ${name}!` : "Welcome to Linglix!";
  const roleMessage =
    role === "STUDENT"
      ? "Start your language learning journey by browsing our expert tutors and booking your first session."
      : "Your tutor profile is being reviewed. We'll notify you once it's approved so you can start teaching!";
  
  const content = `
    <h2 style="margin-top: 0; color: #111;">${greeting}</h2>
    <p>We're excited to have you on board!</p>
    <p>${roleMessage}</p>
    <div style="text-align: center;">
      <a href="https://linglix.com/dashboard" class="button">Go to Dashboard</a>
    </div>
    <p style="color: #666; font-size: 14px;">
      If you have any questions, feel free to reach out to our support team.
    </p>
  `;
  
  return baseTemplate(content, locale);
}

/**
 * Tutor approval/rejection email template
 */
export function tutorApprovalTemplate({
  name,
  approved,
  rejectionReason,
  locale = "en",
}: TutorApprovalProps): string {
  const greeting = name ? `Hello ${name},` : "Hello,";
  
  const content = approved
    ? `
      <h2 style="margin-top: 0; color: #10b981;">Your Tutor Profile Has Been Approved!</h2>
      <p>${greeting}</p>
      <p>Great news! Your tutor profile has been reviewed and approved. You can now start accepting bookings from students.</p>
      <div style="text-align: center;">
        <a href="https://linglix.com/dashboard" class="button">Go to Dashboard</a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Start by setting your availability and creating your profile. Good luck with your teaching journey!
      </p>
    `
    : `
      <h2 style="margin-top: 0; color: #ef4444;">Tutor Profile Review Update</h2>
      <p>${greeting}</p>
      <p>Thank you for your interest in becoming a tutor on Linglix. Unfortunately, your tutor profile was not approved at this time.</p>
      ${rejectionReason ? `<p style="background-color: #fef2f2; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444;"><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
      <p>You can update your profile and resubmit for review, or contact our support team if you have any questions.</p>
      <div style="text-align: center;">
        <a href="https://linglix.com/dashboard" class="button">Update Profile</a>
      </div>
    `;
  
  return baseTemplate(content, locale);
}

/**
 * Password reset email template
 */
export function passwordResetTemplate({
  name,
  resetUrl,
  locale = "en",
}: PasswordResetProps): string {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const content = `
    <h2 style="margin-top: 0; color: #111;">Reset Your Password</h2>
    <p>${greeting}</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px; margin-top: 24px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #111; word-break: break-all;">${resetUrl}</a>
    </p>
    <p style="color: #666; font-size: 14px;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
  `;
  
  return baseTemplate(content, locale);
}

/**
 * Booking confirmation email template
 */
export function bookingConfirmationTemplate({
  name,
  tutorName,
  scheduledAt,
  duration,
  price,
  bookingUrl,
  locale = "en",
}: BookingConfirmationProps): string {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const dateTime = new Date(scheduledAt).toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  
  const content = `
    <h2 style="margin-top: 0; color: #10b981;">Booking Confirmed!</h2>
    <p>${greeting}</p>
    <p>Your session with <strong>${tutorName}</strong> has been confirmed.</p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Date & Time:</strong> ${dateTime}</p>
      <p style="margin: 0 0 8px 0;"><strong>Duration:</strong> ${duration} minutes</p>
      <p style="margin: 0;"><strong>Price:</strong> $${price.toFixed(2)}</p>
    </div>
    ${bookingUrl ? `
      <div style="text-align: center;">
        <a href="${bookingUrl}" class="button">View Booking</a>
      </div>
    ` : ""}
    <p style="color: #666; font-size: 14px;">
      You'll receive a reminder 24 hours and 1 hour before your session. We look forward to seeing you!
    </p>
  `;
  
  return baseTemplate(content, locale);
}

/**
 * Payment receipt email template
 */
export function paymentReceiptTemplate({
  name,
  amount,
  currency,
  bookingId,
  tutorName,
  scheduledAt,
  receiptUrl,
  locale = "en",
}: PaymentReceiptProps): string {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const dateTime = new Date(scheduledAt).toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  
  const content = `
    <h2 style="margin-top: 0; color: #111;">Payment Receipt</h2>
    <p>${greeting}</p>
    <p>Thank you for your payment. Your receipt is below:</p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
      <p style="margin: 0 0 8px 0;"><strong>Tutor:</strong> ${tutorName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Session Date:</strong> ${dateTime}</p>
      <p style="margin: 0 0 16px 0;"><strong>Amount:</strong> ${currency.toUpperCase()} $${amount.toFixed(2)}</p>
      <div style="border-top: 1px solid #e5e5e5; padding-top: 16px; margin-top: 16px;">
        <p style="margin: 0; font-size: 18px; font-weight: 700;">Total Paid: ${currency.toUpperCase()} $${amount.toFixed(2)}</p>
      </div>
    </div>
    ${receiptUrl ? `
      <div style="text-align: center;">
        <a href="${receiptUrl}" class="button">Download Receipt</a>
      </div>
    ` : ""}
    <p style="color: #666; font-size: 14px;">
      This receipt confirms your payment. If you have any questions, please contact our support team.
    </p>
  `;
  
  return baseTemplate(content, locale);
}

/**
 * Session reminder email template
 */
export function sessionReminderTemplate({
  name,
  tutorName,
  scheduledAt,
  duration,
  sessionUrl,
  hoursUntil,
  locale = "en",
}: SessionReminderProps): string {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const dateTime = new Date(scheduledAt).toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  
  const timeText = hoursUntil === 24 ? "24 hours" : hoursUntil === 1 ? "1 hour" : `${hoursUntil} hours`;
  
  const content = `
    <h2 style="margin-top: 0; color: #111;">Session Reminder</h2>
    <p>${greeting}</p>
    <p>This is a reminder that your session with <strong>${tutorName}</strong> starts in ${timeText}.</p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Date & Time:</strong> ${dateTime}</p>
      <p style="margin: 0;"><strong>Duration:</strong> ${duration} minutes</p>
    </div>
    <div style="text-align: center;">
      <a href="${sessionUrl}" class="button">Join Session</a>
    </div>
    <p style="color: #666; font-size: 14px;">
      Make sure you have a stable internet connection and your camera/microphone ready. See you soon!
    </p>
  `;
  
  return baseTemplate(content, locale);
}

/**
 * Booking cancellation email template
 */
export function bookingCancellationTemplate({
  name,
  tutorName,
  studentName,
  scheduledAt,
  refundAmount,
  isTutor,
  locale = "en",
}: BookingCancellationProps): string {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const dateTime = new Date(scheduledAt).toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  
  const cancellationMessage = isTutor
    ? `Your session with ${studentName} scheduled for ${dateTime} has been cancelled.`
    : `Your session with ${tutorName} scheduled for ${dateTime} has been cancelled.`;
  
  const content = `
    <h2 style="margin-top: 0; color: #ef4444;">Booking Cancelled</h2>
    <p>${greeting}</p>
    <p>${cancellationMessage}</p>
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ef4444;">
      <p style="margin: 0 0 8px 0;"><strong>Original Session Date:</strong> ${dateTime}</p>
      ${refundAmount !== undefined ? `
        <p style="margin: 0;"><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
          Your refund will be processed within 5-10 business days.
        </p>
      ` : ""}
    </div>
    ${!isTutor && refundAmount !== undefined ? `
      <p style="color: #666; font-size: 14px;">
        If you'd like to book another session, you can browse our tutors and schedule a new session.
      </p>
    ` : ""}
    <div style="text-align: center;">
      <a href="https://linglix.com/dashboard" class="button">Go to Dashboard</a>
    </div>
  `;
  
  return baseTemplate(content, locale);
}
