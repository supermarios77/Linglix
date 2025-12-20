"use client";

/**
 * 2FA Verification Form Component
 * 
 * Allows admins to enter their 2FA token to complete login
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, AlertCircle } from "lucide-react";

interface Verify2FAFormProps {
  locale: string;
  callbackUrl?: string;
}

export function Verify2FAForm({ locale, callbackUrl }: Verify2FAFormProps) {
  const t = useTranslations("auth.verify2fa");
  const router = useRouter();
  const [token, setToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: useBackupCode ? undefined : token,
          backupCode: useBackupCode ? backupCode : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Redirect to callback URL or dashboard
      const redirectUrl = callbackUrl || `/${locale}/dashboard`;
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] p-8 shadow-lg border border-[#e5e5e5] dark:border-[#262626]">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
          <Shield className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-[#666] dark:text-[#a1a1aa]">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!useBackupCode ? (
          <div className="space-y-2">
            <Label htmlFor="token">{t("tokenLabel")}</Label>
            <Input
              id="token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest font-mono"
              required
              disabled={loading}
            />
            <p className="text-xs text-[#666] dark:text-[#a1a1aa] text-center">
              {t("tokenHint")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="backupCode">{t("backupCodeLabel")}</Label>
            <Input
              id="backupCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{8}"
              maxLength={8}
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.replace(/\D/g, ""))}
              placeholder="00000000"
              className="text-center text-lg tracking-wider font-mono"
              required
              disabled={loading}
            />
            <p className="text-xs text-[#666] dark:text-[#a1a1aa] text-center">
              {t("backupCodeHint")}
            </p>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={() => {
            setUseBackupCode(!useBackupCode);
            setToken("");
            setBackupCode("");
            setError(null);
          }}
          disabled={loading}
        >
          {useBackupCode ? t("useToken") : t("useBackupCode")}
        </Button>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || (!token && !backupCode)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("verifying")}
            </>
          ) : (
            t("verify")
          )}
        </Button>
      </form>
    </div>
  );
}
