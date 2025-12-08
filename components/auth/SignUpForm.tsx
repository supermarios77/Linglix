"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  Button,
  TextField,
  Input,
  Label,
  Description,
  FieldError,
  Alert,
  Link,
} from "@heroui/react";

/**
 * Sign Up Form Component
 * 
 * Built with HeroUI v3 components for:
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
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          {t("signUpTitle")}
        </h1>
        <p className="text-[15px] text-gray-600 font-medium">
          {t("createAccount")}
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          name="name"
          type="text"
          isRequired
          minLength={2}
          value={name}
          onChange={setName}
          isDisabled={isLoading}
          className="w-full"
        >
          <Label>{tCommon("name")}</Label>
          <Input placeholder="John Doe" autoComplete="name" />
        </TextField>

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
          minLength={8}
          value={password}
          onChange={setPassword}
          isInvalid={isPasswordInvalid}
          isDisabled={isLoading}
          className="w-full"
        >
          <Label>{tCommon("password")}</Label>
          <Input placeholder="••••••••" autoComplete="new-password" />
          {isPasswordInvalid ? (
            <FieldError>{t("passwordMinLength")}</FieldError>
          ) : (
            <Description className="text-xs">{t("passwordMinLength")}</Description>
          )}
        </TextField>

        <TextField
          name="confirmPassword"
          type="password"
          isRequired
          minLength={8}
          value={confirmPassword}
          onChange={setConfirmPassword}
          isInvalid={isConfirmPasswordInvalid}
          isDisabled={isLoading}
          className="w-full"
        >
          <Label>{t("confirmPassword")}</Label>
          <Input placeholder="••••••••" autoComplete="new-password" />
          {isConfirmPasswordInvalid && (
            <FieldError>{t("passwordsDoNotMatch")}</FieldError>
          )}
        </TextField>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isPending={isLoading}
          isDisabled={isLoading}
        >
          {t("createAccount")}
        </Button>
      </form>

      {/* Sign In Link */}
      <p className="mt-6 text-center text-[14px] text-gray-600 font-medium">
        {t("hasAccount")}{" "}
        <Link
          href={`/${locale}/auth/signin`}
          underline="hover"
          className="font-semibold"
        >
          {t("signInTitle")}
        </Link>
      </p>
    </div>
  );
}
