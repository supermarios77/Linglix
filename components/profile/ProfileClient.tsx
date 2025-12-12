"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "./AvatarUpload";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ProfileClientProps {
  locale: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: string;
  };
}

export function ProfileClient({ locale, user }: ProfileClientProps) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageUpdate = async (imageUrl: string) => {
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/user/image", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile picture");
      }

      // Refresh the page to get updated session data
      router.refresh();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update image:", error);
      throw error; // Re-throw to let AvatarUpload handle it
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505]">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <Link
          href={`/${locale}`}
          className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          Linglix<span className="text-brand-primary">.</span>
        </Link>

        <Link href={`/${locale}/dashboard`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 pt-24 sm:pt-28">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {t("description")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("profilePicture")}</CardTitle>
            <CardDescription>{t("profilePictureDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <AvatarUpload
              currentImage={user.image}
              onImageUpdate={handleImageUpdate}
            />
            {success && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 justify-center">
                <CheckCircle2 className="w-4 h-4" />
                {t("updateSuccess")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("accountInfo")}</CardTitle>
            <CardDescription>{t("accountInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("name")}
              </label>
              <p className="text-base font-medium mt-1">
                {user.name || t("notSet")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("email")}
              </label>
              <p className="text-base font-medium mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("role")}
              </label>
              <p className="text-base font-medium mt-1 capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
