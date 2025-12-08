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
import { AlertCircle, ArrowRight } from "lucide-react";

/**
 * Sign In Form Component
 * 
 * Modern, beautiful sign in form with glassmorphism design
 */
export function SignInForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    } catch {
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
    } catch {
      setError(t("signInError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[480px]">
      {/* Glassmorphism Form Container */}
      <div className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-2xl rounded-[40px] p-10 border border-white/60 shadow-[0_40px_80px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(255,143,112)_0%,rgba(255,255,255,0)_70%)]" />
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/80 border border-[#e5e5e5] rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2" />
            Welcome Back
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-4 text-black">
              {t("signInTitle")}
            </h1>
            <p className="text-lg leading-relaxed text-[#555]">
              {t("signInWith")} Google {t("or")} {tCommon("email")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-2xl border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{error}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Button */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-full border border-[#e5e5e5] bg-white/80 backdrop-blur-sm hover:bg-white hover:border-black transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              {t("signInWith")} Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <Separator className="bg-[#e5e5e5]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-4 bg-white/90 backdrop-blur-sm text-[#666] text-sm font-medium rounded-full border border-[#e5e5e5]">
                {t("or")}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#444]">
                  {tCommon("password")}
                </Label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-sm text-[#666] hover:text-black transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isLoading}
                className="border-[#e5e5e5]"
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-normal text-[#666] cursor-pointer"
              >
                {t("rememberMe")}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-[#111] text-white font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] inline-flex items-center justify-center gap-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                t("signingIn") || "Signing in..."
              ) : (
                <>
                  {t("signInTitle")}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-[#666] font-normal">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/auth/signup`}
              className="font-semibold text-black hover:underline transition-colors"
            >
              {t("signUpTitle")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
