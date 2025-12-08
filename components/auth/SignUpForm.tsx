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
import { AlertCircle } from "lucide-react";

/**
 * Sign Up Form Component
 * 
 * Built with shadcn/ui components for:
 * - Beautiful, accessible UI
 * - Built-in form validation
 * - Smooth animations
 * - Production-ready design
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
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight leading-tight">
          {t("signUpTitle")}
        </h1>
        <p className="text-base text-muted-foreground font-normal leading-relaxed">
          {t("createAccount")}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">{tCommon("name")}</Label>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{tCommon("email")}</Label>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{tCommon("password")}</Label>
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
            className={isPasswordInvalid ? "border-destructive" : ""}
          />
          {isPasswordInvalid && (
            <p className="text-sm font-medium text-destructive">
              {t("passwordMinLength")}
            </p>
          )}
          {!isPasswordInvalid && (
            <p className="text-xs text-muted-foreground">
              {t("passwordMinLength")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
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
            className={isConfirmPasswordInvalid ? "border-destructive" : ""}
          />
          {isConfirmPasswordInvalid && (
            <p className="text-sm font-medium text-destructive">
              {t("passwordsDoNotMatch")}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t("creatingAccount") || "Creating account..." : t("createAccount")}
        </Button>
      </form>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-sm text-muted-foreground font-normal">
        {t("hasAccount")}{" "}
        <Link
          href={`/${locale}/auth/signin`}
          className="font-medium text-primary hover:underline"
        >
          {t("signInTitle")}
        </Link>
      </p>
    </div>
  );
}
