"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState<string>("en");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("loading");
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    if (token && email) {
      verifyEmail();
    } else {
      setStatus("idle");
      setMessage("Missing verification token or email. Please check your email for the verification link.");
    }
  }, [token, email]);

  async function verifyEmail() {
    if (!token || !email) return;

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push(`/${locale}/dashboard`);
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to verify email. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while verifying your email. Please try again.");
    }
  }

  async function resendVerification() {
    if (!email) return;

    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
        setStatus("idle");
      } else {
        setMessage(data.error || "Failed to resend verification email. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />}
            {status === "success" && <CheckCircle2 className="h-6 w-6 text-yellow-600" />}
            {status === "error" && <XCircle className="h-6 w-6 text-red-600" />}
            {status === "idle" && <Mail className="h-6 w-6 text-gray-600" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "idle" && "Email Verification"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address."}
            {status === "success" && "Your email has been successfully verified."}
            {status === "error" && "We couldn't verify your email address."}
            {status === "idle" && "Please verify your email address to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "success" ? "default" : status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <p className="text-center text-sm text-gray-600">
              Redirecting to dashboard...
            </p>
          )}

          {(status === "error" || status === "idle") && (
            <div className="space-y-3">
              <Button
                onClick={resendVerification}
                disabled={resending || !email}
                className="w-full"
                variant="outline"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              <Button
                onClick={() => router.push(`/${locale}/auth/signin`)}
                variant="ghost"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          )}

          {email && (
            <p className="text-center text-xs text-gray-500">
              Verification email will be sent to: <span className="font-medium">{email}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
