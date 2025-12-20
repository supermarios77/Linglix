"use client";

/**
 * 2FA Setup Form Component
 * 
 * Allows admins to set up 2FA by scanning a QR code
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, CheckCircle2, AlertCircle, Copy, Download } from "lucide-react";
import Image from "next/image";

interface Setup2FAFormProps {
  locale: string;
  twoFactorEnabled?: boolean;
}

export function Setup2FAForm({ locale, twoFactorEnabled: initialEnabled }: Setup2FAFormProps) {
  const t = useTranslations("auth.setup2fa");
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(initialEnabled || false);

  useEffect(() => {
    // Only fetch setup in production
    if (process.env.NODE_ENV === "production" && step === "setup") {
      fetchSetup();
    }
  }, [step]);

  const fetchSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up 2FA");
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set up 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          token,
          backupCodes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccess(true);
      setBackupCodes(data.backupCodes || backupCodes);
      setTwoFactorEnabled(true);
      
      // Refresh after a moment
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linglix-2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDisable = async () => {
    const password = prompt("Enter your password to disable 2FA:");
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disable 2FA");
      }

      setTwoFactorEnabled(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  // In development, show a message
  if (process.env.NODE_ENV !== "production") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>2FA Setup</CardTitle>
          <CardDescription>
            2FA is only available in production environment
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If 2FA is already enabled, show disable option
  if (twoFactorEnabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <CardTitle>2FA Enabled</CardTitle>
          </div>
          <CardDescription>
            Your account is protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disabling...
              </>
            ) : (
              "Disable 2FA"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <CardTitle>2FA Enabled Successfully</CardTitle>
          </div>
          <CardDescription>
            Your account is now protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Save your backup codes!</strong> These codes can be used to access your account if you lose your authenticator device.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label>Backup Codes</Label>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              {backupCodes.map((code, idx) => (
                <div key={idx}>{code}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Codes
              </Button>
              <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "setup" && qrCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <Image
                src={qrCode}
                alt="2FA QR Code"
                width={200}
                height={200}
                className="w-[200px] h-[200px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Or enter this code manually:</Label>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm text-center">
              {secret}
            </div>
          </div>

          <Button
            onClick={() => setStep("verify")}
            className="w-full"
            disabled={loading}
          >
            I've scanned the QR code
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify 2FA Setup</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="token">Verification Code</Label>
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
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("setup")}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || token.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Enable"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
