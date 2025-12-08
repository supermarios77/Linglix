import { getTranslations } from "next-intl/server";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { PublicNav } from "@/components/navigation/PublicNav";
import { redirect } from "next/navigation";
import { auth } from "@/config/auth";

/**
 * Sign Up Page
 *
 * Modern, beautiful sign up page with:
 * - Ambient background blobs
 * - Glassmorphism design
 * - Smooth animations
 * - Production-ready
 * - Mobile responsive
 */
export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("signUpTitle"),
    description: t("createAccount"),
  };
}

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  // Redirect if already authenticated
  if (session) {
    redirect(`/${locale}`);
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
      <PublicNav locale={locale} session={null} />
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      {/* Decorative blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] sm:w-[800px] sm:h-[400px] rounded-full opacity-30 blur-[100px] bg-[radial-gradient(circle,rgb(255,200,220)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <SignUpForm />
      </div>
    </div>
  );
}
