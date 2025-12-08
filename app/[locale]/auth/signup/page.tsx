import { getTranslations } from "next-intl/server";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { redirect } from "next/navigation";
import { auth } from "@/config/auth";

/**
 * Sign Up Page
 * 
 * Production-ready sign up page with:
 * - Localization
 * - Redirect if already authenticated
 * - SEO metadata
 * - Accessible layout
 */
export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("signUpTitle"),
    description: t("createAccount"),
  };
}

export default async function SignUpPage() {
  const session = await auth();

  // Redirect if already authenticated
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  );
}
