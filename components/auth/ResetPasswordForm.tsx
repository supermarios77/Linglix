"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * Reset Password Form Component
 * 
 * Allows users to reset their password using a token from email
 */
export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get token and email from URL params
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (tokenParam) {
      setToken(tokenParam);
    }
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (!token || !email) {
      setError(t("invalidResetToken"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("signInError"));
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/auth/signin`);
      }, 2000);
    } catch (err) {
      setError(t("signInError"));
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="relative w-full max-w-[480px] px-4 sm:px-0">
        <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a1a]/95 dark:to-[#0a0a0a]/90 backdrop-blur-2xl rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 border border-white/60 dark:border-[#262626]/80 shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <Alert
            variant="destructive"
            className="mb-5 sm:mb-6 rounded-xl sm:rounded-2xl border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">{t("invalidResetToken")}</AlertTitle>
            <AlertDescription className="text-sm">{t("invalidResetToken")}</AlertDescription>
          </Alert>
          <p className="text-center text-xs sm:text-sm text-[#666] dark:text-[#a1a1aa] font-normal">
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="font-semibold text-black dark:text-white hover:underline transition-colors"
            >
              {t("forgotPasswordTitle")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[480px] px-4 sm:px-0">
      {/* Glassmorphism Form Container */}
      <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a1a]/95 dark:to-[#0a0a0a]/90 backdrop-blur-2xl rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 border border-white/60 dark:border-[#262626]/80 shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.08)] dark:sm:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full opacity-20 dark:opacity-15 blur-[60px] bg-[radial-gradient(circle,rgb(255,143,112)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(204,243,129)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] rounded-full opacity-20 dark:opacity-15 blur-[60px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(255,235,59)_0%,rgba(0,0,0,0)_70%)]" />

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 dark:bg-[#0a0a0a]/80 border border-[#e5e5e5] dark:border-[#262626] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] text-black dark:text-white">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full mr-2" />
            Reset Password
          </div>

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-3 sm:mb-4 text-black dark:text-white">
              {t("resetPasswordTitle")}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa]">
              {t("resetPasswordDescription")}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="mb-5 sm:mb-6 rounded-xl sm:rounded-2xl border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/80 dark:bg-yellow-950/50 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-sm">{t("passwordResetSuccess")}</AlertTitle>
              <AlertDescription className="text-sm">{t("passwordResetSuccess")}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && !success && (
            <Alert
              variant="destructive"
              className="mb-5 sm:mb-6 rounded-xl sm:rounded-2xl border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">{error}</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {tCommon("email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={true}
                  className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm text-sm sm:text-base text-black dark:text-white opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm focus:border-[#999] dark:focus:border-accent focus:ring-2 focus:ring-[#999]/10 dark:focus:ring-accent/20 transition-all text-sm sm:text-base text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#999]/20 dark:focus:ring-accent/20 rounded-full"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("confirmNewPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm focus:border-[#999] dark:focus:border-accent focus:ring-2 focus:ring-[#999]/10 dark:focus:ring-accent/20 transition-all text-sm sm:text-base text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#999]/20 dark:focus:ring-accent/20 rounded-full"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 rounded-full bg-[#111] dark:bg-accent text-white dark:text-black font-semibold text-sm sm:text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_20px_rgba(255,230,0,0.3)] hover:bg-[#222] dark:hover:bg-brand-primary-light active:scale-[0.98] inline-flex items-center justify-center gap-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>{t("resettingPassword")}</span>
                ) : (
                  <>
                    <span>{t("resetPassword")}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
