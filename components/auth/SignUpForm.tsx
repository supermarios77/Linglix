"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";

/**
 * Sign Up Form Component
 *
 * Modern, beautiful sign up form with glassmorphism design
 * Production-ready with proper error handling and mobile responsiveness
 */
export function SignUpForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("already exists")) {
          setError(t("emailExists"));
        } else {
          setError(data.error || t("signUpError"));
        }
        setIsLoading(false);
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(`/${locale}/auth/signin`);
        return;
      }

      router.push(`/${locale}`);
      router.refresh();
    } catch (err) {
      // Error handling - don't leak details
      setError(t("signUpError"));
      setIsLoading(false);
    }
  };

  const isPasswordInvalid = password.length > 0 && password.length < 8;
  const isConfirmPasswordInvalid =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="relative w-full max-w-[480px] px-4 sm:px-0">
      {/* Glassmorphism Form Container */}
      <div className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-2xl rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.06)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(255,143,112)_0%,rgba(255,255,255,0)_70%)]" />
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 border border-[#e5e5e5] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#10b981] rounded-full mr-2 animate-pulse" />
            Join Us
          </div>

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-3 sm:mb-4 text-black">
              {t("signUpTitle")}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#555]">
              {t("createAccount")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-5 sm:mb-6 rounded-xl sm:rounded-2xl border-red-200 bg-red-50/80 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">{error}</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-[#444]">
                {tCommon("name")}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="John Doe"
                autoComplete="name"
                className="h-11 sm:h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-[#999] focus:ring-2 focus:ring-[#999]/10 transition-all text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-[#444]">
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
                className="h-11 sm:h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-[#999] focus:ring-2 focus:ring-[#999]/10 transition-all text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-[#444]">
                {tCommon("password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`h-11 sm:h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-[#999] focus:ring-2 focus:ring-[#999]/10 transition-all text-sm sm:text-base ${
                  isPasswordInvalid ? "border-red-300 focus:border-red-400" : ""
                }`}
              />
              {isPasswordInvalid && (
                <p className="text-xs sm:text-sm font-medium text-red-600">
                  {t("passwordMinLength")}
                </p>
              )}
              {!isPasswordInvalid && password.length === 0 && (
                <p className="text-xs text-[#888]">
                  {t("passwordMinLength")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#444]">
                {t("confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`h-11 sm:h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-[#999] focus:ring-2 focus:ring-[#999]/10 transition-all text-sm sm:text-base ${
                  isConfirmPasswordInvalid ? "border-red-300 focus:border-red-400" : ""
                }`}
              />
              {isConfirmPasswordInvalid && (
                <p className="text-xs sm:text-sm font-medium text-red-600">
                  {t("passwordsDoNotMatch")}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 rounded-full bg-[#111] text-white font-semibold text-sm sm:text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] active:scale-[0.98] inline-flex items-center justify-center gap-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>{t("creatingAccount") || "Creating account..."}</span>
              ) : (
                <>
                  <span>{t("createAccount")}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#666] font-normal">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/auth/signin`}
              className="font-semibold text-black hover:underline transition-colors"
            >
              {t("signInTitle")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
