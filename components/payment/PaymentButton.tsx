"use client";

/**
 * Payment Button Component
 * 
 * Handles Stripe Checkout Session creation and redirect
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaymentButtonProps {
  bookingId: string;
  disabled?: boolean;
}

export function PaymentButton({ bookingId, disabled }: PaymentButtonProps) {
  const router = useRouter();
  const t = useTranslations("payment");
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment session");
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error("No checkout URL received");
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Payment error:", error);
      }
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start payment. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t("processing")}
        </>
      ) : (
        t("payNow")
      )}
    </Button>
  );
}
