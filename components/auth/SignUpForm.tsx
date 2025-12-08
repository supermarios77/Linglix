"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useLocale } from "next-intl";

/**
 * Sign Up Form Component
 * 
 * Beautiful, refined design with:
 * - Balanced typography and spacing
 * - Elegant rounded inputs
 * - Clean visual hierarchy
 * - Smooth interactions
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
        <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3.5">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-900 mb-1.5"
          >
            {tCommon("name")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-[15px] rounded-full border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white font-medium shadow-sm hover:border-gray-300"
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-900 mb-1.5"
          >
            {tCommon("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-[15px] rounded-full border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white font-medium shadow-sm hover:border-gray-300"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-900 mb-1.5"
          >
            {tCommon("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-[15px] rounded-full border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white font-medium shadow-sm hover:border-gray-300"
            placeholder="••••••••"
            disabled={isLoading}
          />
          <p className="mt-1.5 text-xs text-gray-500 font-medium">
            {t("passwordMinLength")}
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-gray-900 mb-1.5"
          >
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 text-[15px] rounded-full border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white font-medium shadow-sm hover:border-gray-300"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3.5 px-5 border border-transparent rounded-full text-[15px] font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.01]"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("signingUp")}
            </>
          ) : (
            t("createAccount")
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="mt-6 text-center text-[14px] text-gray-600 font-medium">
        {t("hasAccount")}{" "}
        <Link
          href={`/${locale}/auth/signin`}
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {t("signInTitle")}
        </Link>
      </p>
    </div>
  );
}