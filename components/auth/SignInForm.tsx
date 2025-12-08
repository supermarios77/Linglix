"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  Button,
  TextField,
  Input,
  Label,
  Alert,
  Separator,
  Checkbox,
  Link,
} from "@heroui/react";

/**
 * Sign In Form Component
 * 
 * Built with HeroUI v3 components for:
 * - Beautiful, accessible UI
 * - Built-in form validation
 * - Smooth animations
 * - Production-ready design
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
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight leading-tight">
          {t("signInTitle")}
        </h1>
        <p className="text-base text-muted font-normal leading-relaxed">
          {t("signInWith")} Google {t("or")} {tCommon("email")}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert status="danger" className="mb-5">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-2.5 mb-5">
        <Button
          variant="tertiary"
          className="w-full"
          onPress={() => handleOAuthSignIn("google")}
          isDisabled={isLoading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-3 bg-background text-muted text-sm font-normal">
            {t("or")}
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          name="email"
          type="email"
          isRequired
          value={email}
          onChange={setEmail}
          isDisabled={isLoading}
          className="w-full"
        >
          <Label>{tCommon("email")}</Label>
          <Input placeholder="you@example.com" autoComplete="email" />
        </TextField>

        <TextField
          name="password"
          type="password"
          isRequired
          value={password}
          onChange={setPassword}
          isDisabled={isLoading}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-1">
            <Label>{tCommon("password")}</Label>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-sm"
              underline="hover"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <Input placeholder="••••••••" autoComplete="current-password" />
        </TextField>

        <Checkbox
          name="remember-me"
          isSelected={rememberMe}
          onChange={setRememberMe}
          isDisabled={isLoading}
        >
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>{t("rememberMe")}</Label>
          </Checkbox.Content>
        </Checkbox>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isPending={isLoading}
          isDisabled={isLoading}
        >
          {t("signInTitle")}
        </Button>
      </form>

      {/* Sign Up Link */}
      <p className="mt-6 text-center text-[14px] text-muted font-medium">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/auth/signup`}
          underline="hover"
          className="font-semibold"
        >
          {t("signUpTitle")}
        </Link>
      </p>
    </div>
  );
}
