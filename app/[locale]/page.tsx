import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, Target, DollarSign, Video, Headphones } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { auth } from "@/config/auth";

/**
 * Landing Page
 *
 * Modern, beautiful landing page with:
 * - Glassmorphism design
 * - Ambient background blobs
 * - Smooth animations
 * - Production-ready
 * - Mobile responsive
 * - Fully localized
 */
export async function generateMetadata() {
  const t = await getTranslations("landing.hero");

  return {
    title: "Linglix - Learn Languages with Native Tutors",
    description: t("subtitle"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");
  const session = await auth();

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#111] text-[#111] dark:text-[#fafafa] overflow-x-hidden">
      {/* Ambient Background Blobs */}
      <div
        className="blob blob-1 fixed top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-60 blur-[60px] md:blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(50,50,100,0.5)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />
      <div
        className="blob blob-2 fixed bottom-0 right-[-10%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-60 blur-[60px] md:blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(100,50,50,0.5)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav className="relative z-20 border-b border-[#e5e5e5] dark:border-[#333] bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href={`/${locale}`} className="text-2xl font-bold text-black dark:text-white">
              Linglix
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeSwitcher />
              {session ? (
                <Link href={`/${locale}/dashboard`}>
                  <Button variant="outline" className="rounded-full">
                    {tCommon("dashboard")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href={`/${locale}/auth/signin`}>
                    <Button variant="ghost" className="rounded-full">
                      {tAuth("signInTitle")}
                    </Button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`}>
                    <Button className="rounded-full bg-[#111] text-white dark:bg-white dark:text-black">
                      {tAuth("signUpTitle")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] mb-6 md:mb-8 text-black dark:text-white leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[#555] dark:text-[#aaa] mb-8 md:mb-12 leading-relaxed max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`}>
                <Button
                  size="lg"
                  className="rounded-full bg-[#111] text-white dark:bg-white dark:text-black font-semibold text-base md:text-lg px-8 md:px-10 h-12 md:h-14 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-[#eee] inline-flex items-center justify-center gap-2.5 active:scale-[0.98]"
                >
                  {t("hero.ctaPrimary")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/tutors`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-[#e5e5e5] dark:border-[#333] bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black hover:border-[#d4d4d4] dark:hover:border-[#666] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)] active:scale-[0.98] font-semibold text-base md:text-lg px-8 md:px-10 h-12 md:h-14"
                >
                  {t("hero.ctaSecondary")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4 md:mb-6 text-black dark:text-white">
              {t("features.title")}
            </h2>
            <p className="text-lg md:text-xl text-[#555] dark:text-[#aaa] max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1: Native Speakers */}
            <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-300 hover:translate-y-[-4px]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mb-4 md:mb-6">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-black" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-black dark:text-white">
                {t("features.items.native.title")}
              </h3>
              <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                {t("features.items.native.description")}
              </p>
            </div>

            {/* Feature 2: Flexible Scheduling */}
            <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-300 hover:translate-y-[-4px]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mb-4 md:mb-6">
                <Clock className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-black" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-black dark:text-white">
                {t("features.items.flexible.title")}
              </h3>
              <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                {t("features.items.flexible.description")}
              </p>
            </div>

            {/* Feature 3: Personalized Learning */}
            <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-300 hover:translate-y-[-4px]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mb-4 md:mb-6">
                <Target className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-black" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-black dark:text-white">
                {t("features.items.personalized.title")}
              </h3>
              <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                {t("features.items.personalized.description")}
              </p>
            </div>

            {/* Feature 4: Affordable Pricing */}
            <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-300 hover:translate-y-[-4px]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mb-4 md:mb-6">
                <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-black" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-black dark:text-white">
                {t("features.items.affordable.title")}
              </h3>
              <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                {t("features.items.affordable.description")}
              </p>
            </div>

            {/* Feature 5: Session Recordings */}
            <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-300 hover:translate-y-[-4px]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mb-4 md:mb-6">
                <Video className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-black" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-black dark:text-white">
                {t("features.items.recordings.title")}
              </h3>
              <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                {t("features.items.recordings.description")}
              </p>
            </div>

            {/* Feature 6: 24/7 Support */}
            <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-300 hover:translate-y-[-4px]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mb-4 md:mb-6">
                <Headphones className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-black" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-black dark:text-white">
                {t("features.items.support.title")}
              </h3>
              <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                {t("features.items.support.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4 md:mb-6 text-black dark:text-white">
              {t("howItWorks.title")}
            </h2>
            <p className="text-lg md:text-xl text-[#555] dark:text-[#aaa] max-w-2xl mx-auto">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-8 md:p-10 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mx-auto mb-6 md:mb-8 text-2xl md:text-3xl font-bold text-white dark:text-black">
                  1
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-black dark:text-white">
                  {t("howItWorks.steps.1.title")}
                </h3>
                <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                  {t("howItWorks.steps.1.description")}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-8 md:p-10 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mx-auto mb-6 md:mb-8 text-2xl md:text-3xl font-bold text-white dark:text-black">
                  2
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-black dark:text-white">
                  {t("howItWorks.steps.2.title")}
                </h3>
                <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                  {t("howItWorks.steps.2.description")}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-8 md:p-10 border border-white/60 dark:border-black/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#111] dark:bg-white flex items-center justify-center mx-auto mb-6 md:mb-8 text-2xl md:text-3xl font-bold text-white dark:text-black">
                  3
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-black dark:text-white">
                  {t("howItWorks.steps.3.title")}
                </h3>
                <p className="text-[#555] dark:text-[#aaa] text-sm md:text-base leading-relaxed">
                  {t("howItWorks.steps.3.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-black/90 dark:to-black/70 backdrop-blur-2xl rounded-[32px] md:rounded-[48px] p-8 md:p-12 lg:p-16 border border-white/60 dark:border-black/60 shadow-[0_40px_80px_rgba(0,0,0,0.08)] text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4 md:mb-6 text-black dark:text-white">
              {t("cta.title")}
            </h2>
            <p className="text-lg md:text-xl text-[#555] dark:text-[#aaa] mb-8 md:mb-12 max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <Link href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`}>
              <Button
                size="lg"
                className="rounded-full bg-[#111] text-white dark:bg-white dark:text-black font-semibold text-base md:text-lg px-8 md:px-10 h-12 md:h-14 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-[#eee] inline-flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                {t("cta.button")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#e5e5e5] dark:border-[#333] bg-white/80 dark:bg-black/80 backdrop-blur-xl py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#666] dark:text-[#999] text-sm md:text-base">
            © {new Date().getFullYear()} Linglix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
