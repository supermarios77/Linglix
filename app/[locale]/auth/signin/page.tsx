import { getTranslations } from "next-intl/server";
import { SignInForm } from "@/components/auth/SignInForm";
import { redirect } from "next/navigation";
import { auth } from "@/config/auth";

/**
 * Sign In Page
 * 
 * Production-ready sign in page with:
 * - Localization
 * - Redirect if already authenticated
 * - SEO metadata
 * - Accessible layout
 */
export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("signInTitle"),
    description: t("signInWith") + " " + t("or") + " " + t("signInWith") + " OAuth",
  };
}

export default async function SignInPage() {
  const session = await auth();

  // Redirect if already authenticated
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
