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
    } catch {
      setError(t("signUpError"));
      setIsLoading(false);
    }
  };

  const isPasswordInvalid = password.length > 0 && password.length < 8;
  const isConfirmPasswordInvalid =
    confirmPassword.length > 0 && password !== confirmPassword;

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
            <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2 animate-pulse" />
            Join Us
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-4 text-black">
              {t("signUpTitle")}
            </h1>
            <p className="text-lg leading-relaxed text-[#555]">
              {t("createAccount")}
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                className="h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                className={`h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-black focus:ring-2 focus:ring-black/10 transition-all ${
                  isPasswordInvalid ? "border-red-300" : ""
                }`}
              />
              {isPasswordInvalid && (
                <p className="text-sm font-medium text-red-600">
                  {t("passwordMinLength")}
                </p>
              )}
              {!isPasswordInvalid && (
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
                className={`h-12 rounded-full border-[#e5e5e5] bg-white/80 backdrop-blur-sm focus:border-black focus:ring-2 focus:ring-black/10 transition-all ${
                  isConfirmPasswordInvalid ? "border-red-300" : ""
                }`}
              />
              {isConfirmPasswordInvalid && (
                <p className="text-sm font-medium text-red-600">
                  {t("passwordsDoNotMatch")}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-[#111] text-white font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] inline-flex items-center justify-center gap-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                t("creatingAccount") || "Creating account..."
              ) : (
                <>
                  {t("createAccount")}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-[#666] font-normal">
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
