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

