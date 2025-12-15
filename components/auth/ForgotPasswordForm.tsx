"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Forgot Password Form Component
 * 
 * Allows users to request a password reset email
 */
export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("signInError"));
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError(t("signInError"));
      setIsLoading(false);
    }
  };

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
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent dark:bg-accent rounded-full mr-2" />
            Password Reset
          </div>

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-3 sm:mb-4 text-black dark:text-white">
              {t("forgotPasswordTitle")}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa]">
              {t("forgotPasswordDescription")}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="mb-5 sm:mb-6 rounded-xl sm:rounded-2xl border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/80 dark:bg-yellow-950/50 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-sm">{t("resetLinkSent")}</AlertTitle>
              <AlertDescription className="text-sm">{t("resetLinkSent")}</AlertDescription>
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
                  disabled={isLoading}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm focus:border-[#999] dark:focus:border-accent focus:ring-2 focus:ring-[#999]/10 dark:focus:ring-accent/20 transition-all text-sm sm:text-base text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555]"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 rounded-full bg-[#111] dark:bg-accent text-white dark:text-black font-semibold text-sm sm:text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_20px_rgba(255,230,0,0.3)] hover:bg-[#222] dark:hover:bg-brand-primary-light active:scale-[0.98] inline-flex items-center justify-center gap-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>{t("sendingResetLink")}</span>
                ) : (
                  <>
                    <span>{t("sendResetLink")}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Back to Sign In Link */}
          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#666] dark:text-[#a1a1aa] font-normal">
            <Link
              href={`/${locale}/auth/signin`}
              className="font-semibold text-black dark:text-white hover:underline transition-colors inline-flex items-center gap-2"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              {t("backToSignIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
