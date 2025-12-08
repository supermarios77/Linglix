"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

/**
 * Sign In Form Component
 *
 * Modern, beautiful sign in form with glassmorphism design
 * Production-ready with proper error handling and mobile responsiveness
 */
export function SignInForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      // Error handling - don't leak details
      setError(t("signInError"));
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google") => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn(provider, {
        callbackUrl,
      });
    } catch (err) {
      // Error handling - don't leak details
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
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#10b981] dark:bg-[#ccf381] rounded-full mr-2" />
            Welcome Back
          </div>

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-3 sm:mb-4 text-black dark:text-white">
              {t("signInTitle")}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa]">
              {t("signInWith")} Google {t("or")} {tCommon("email")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-5 sm:mb-6 rounded-xl sm:rounded-2xl border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">{error}</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Button */}
          <div className="mb-5 sm:mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 sm:h-12 rounded-full border border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#0a0a0a] hover:border-[#d4d4d4] dark:hover:border-[#333] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-[0.98] text-black dark:text-white"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm sm:text-base">{t("signInWith")} Google</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-5 sm:mb-6">
            <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-3 sm:px-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm text-[#666] dark:text-[#a1a1aa] text-xs sm:text-sm font-medium rounded-full border border-[#e5e5e5] dark:border-[#262626]">
                {t("or")}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
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
                className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm focus:border-[#999] dark:focus:border-[#ccf381] focus:ring-2 focus:ring-[#999]/10 dark:focus:ring-[#ccf381]/20 transition-all text-sm sm:text-base text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {tCommon("password")}
                </Label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-xs sm:text-sm text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
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
                  autoComplete="current-password"
                  className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm focus:border-[#999] dark:focus:border-[#ccf381] focus:ring-2 focus:ring-[#999]/10 dark:focus:ring-[#ccf381]/20 transition-all text-sm sm:text-base text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#999]/20 dark:focus:ring-[#ccf381]/20 rounded-full"
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

            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isLoading}
                className="border-[#e5e5e5] dark:border-[#262626]"
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-normal text-[#666] dark:text-[#a1a1aa] cursor-pointer"
              >
                {t("rememberMe")}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black font-semibold text-sm sm:text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_20px_rgba(204,243,129,0.3)] hover:bg-[#222] dark:hover:bg-[#d4f89a] active:scale-[0.98] inline-flex items-center justify-center gap-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>{t("signingIn") || "Signing in..."}</span>
              ) : (
                <>
                  <span>{t("signInTitle")}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#666] dark:text-[#a1a1aa] font-normal">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/auth/signup`}
              className="font-semibold text-black dark:text-white hover:underline transition-colors"
            >
              {t("signUpTitle")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
