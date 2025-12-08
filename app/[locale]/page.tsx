import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Clock } from "lucide-react";
import { auth } from "@/config/auth";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

/**
 * Landing Page
 *
 * Modern, beautiful landing page matching the provided design style
 * Adapted for language learning platform
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
  const session = await auth();

  const marqueeItems = t.raw("marquee.items") as string[];

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white overflow-x-hidden">
      {/* Ambient Background Blobs */}
      <div
        className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(121,40,202,0.3)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />
      <div
        className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(204,243,129,0.2)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />

      {/* Client Component for Header and Scroll Button */}
      <LandingPageClient session={session} locale={locale} />

      {/* Main Hero */}
      <main className="relative max-w-[1400px] w-full mx-auto min-h-screen pt-36 pb-16 px-4 md:px-12 grid md:grid-cols-2 items-center gap-16">
        <div className="z-[2]">
          <div className="inline-flex items-center px-3 py-1.5 bg-white/80 dark:bg-[#121212] backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="w-2 h-2 bg-[#ccf381] rounded-full mr-2" />
            New Platform Launch
          </div>
          <h1 className="text-[56px] md:text-[76px] leading-[0.95] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
            Learn Languages with <br />
            <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 py-1 -rotate-[-2deg] transform origin-center font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
              Native Tutors.
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[460px] mb-10">
            Connect with expert tutors for personalized, one-on-one language learning experiences. Flexible scheduling, affordable pricing, and real results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link href={session ? `/${locale}/dashboard` : `/${locale}/auth/signup`}>
              <Button
                size="lg"
                className="bg-[#111] dark:bg-white text-white dark:text-black px-9 py-[18px] rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-[#eee] inline-flex items-center gap-2.5"
              >
                {t("hero.ctaPrimary")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/tutors`}>
              <Button
                size="lg"
                variant="outline"
                className="px-9 py-[18px] rounded-full font-semibold text-base bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] border border-[#e5e5e5] dark:border-[#333] transition-all hover:bg-white dark:hover:bg-black hover:border-black dark:hover:border-white"
              >
                {t("hero.ctaSecondary")}
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative h-[500px] md:h-[700px] w-full">
          <div className="group w-full h-full rounded-[32px] overflow-hidden relative -rotate-2 transition-all duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:rotate-0 hover:-translate-y-0.5">
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#121212] dark:from-[#1a1a1a] dark:to-[#0a0a0a] border border-[#262626] flex items-center justify-center">
              <Users className="w-32 h-32 md:w-48 md:h-48 text-[#ccf381] opacity-60" />
            </div>
            {/* Badge Element */}
            <div className="absolute top-5 left-5 z-[4] w-[100px] h-[100px] flex items-center justify-center bg-[#ccf381] dark:bg-[#ccf381] rounded-full text-black font-extrabold text-center rotate-[15deg] shadow-[0_10px_20px_rgba(0,0,0,0.2)] text-sm leading-tight border border-[#262626]">
              BEST
              <br />
              TUTORS
            </div>
          </div>
          {/* Floating Glassmorphism Card 1 */}
          <div className="floating-card absolute bottom-[60px] left-[-40px] bg-white/70 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[3] transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7928ca] to-[#ff0080] flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">Native Speakers</h4>
              <p className="text-xs text-[#666] dark:text-[#a1a1aa]">Certified Tutors</p>
              <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★★</div>
            </div>
          </div>
          {/* Floating Glassmorphism Card 2 */}
          <div className="floating-card absolute top-20 right-[-20px] bg-white/70 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[3] animate-[float_6s_ease-in-out_1.5s_infinite] transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3b82f6] flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">Flexible Schedule</h4>
              <p className="text-xs text-[#666] dark:text-[#a1a1aa]">24/7 Available</p>
              <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★☆</div>
            </div>
          </div>
        </div>
      </main>

      {/* Marquee Ticker */}
      <div className="w-full bg-[#111] dark:bg-[#0a0a0a] text-white py-4 overflow-hidden whitespace-nowrap relative -rotate-1 scale-[1.02] -mt-10 z-[5] border-t border-b border-[#262626]">
        <div className="inline-block animate-[marquee_20s_linear_infinite]">
          {marqueeItems.map((item, index) => (
            <span key={index} className="text-lg font-medium uppercase px-10 tracking-wider inline-block">
              {item}
            </span>
          ))}
          {marqueeItems.map((item, index) => (
            <span key={`duplicate-${index}`} className="text-lg font-medium uppercase px-10 tracking-wider inline-block">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Tutors Section */}
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <h3 className="text-[32px] font-semibold text-black dark:text-white">{t("trending.title")}</h3>
          <Link href={`/${locale}/tutors`} className="underline font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors">
            {t("trending.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Tutor Card 1 */}
          <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <div className="w-full h-60 rounded-[24px] overflow-hidden mb-5 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Maria Garcia</span>
                <span className="text-xs text-[#888] dark:text-[#a1a1aa]">Spanish Tutor</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">4.9</span>
              </div>
            </div>
          </div>
          {/* Tutor Card 2 */}
          <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <div className="w-full h-60 rounded-[24px] overflow-hidden mb-5 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Jean-Pierre</span>
                <span className="text-xs text-[#888] dark:text-[#a1a1aa]">French Tutor</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">5.0</span>
              </div>
            </div>
          </div>
          {/* Tutor Card 3 */}
          <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <div className="w-full h-60 rounded-[24px] overflow-hidden mb-5 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Hiroshi Tanaka</span>
                <span className="text-xs text-[#888] dark:text-[#a1a1aa]">Japanese Tutor</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">4.8</span>
              </div>
            </div>
          </div>
          {/* Tutor Card 4 */}
          <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <div className="w-full h-60 rounded-[24px] overflow-hidden mb-5 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Emma Schmidt</span>
                <span className="text-xs text-[#888] dark:text-[#a1a1aa]">German Tutor</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="relative py-32 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-40 blur-[100px] bg-[radial-gradient(circle,rgb(121,40,202,0.2)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(121,40,202,0.3)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="relative bg-white dark:bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-[32px] p-12 md:p-16 border border-[#e5e5e5] dark:border-[#262626] shadow-[0_40px_80px_rgba(0,0,0,0.03)] overflow-hidden transition-all hover:border-[#d4d4d4] dark:hover:border-[#404040]">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(204,243,129,0.3)_0%,rgba(255,255,255,0)_70%)]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(121,40,202,0.2)_0%,rgba(255,255,255,0)_70%)]" />
          <div className="relative max-w-[700px] mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-[#121212] backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <span className="w-2 h-2 bg-[#ccf381] rounded-full mr-2 animate-pulse" />
              {t("waitlist.badge")}
            </div>
            <h2 className="text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
              {t("waitlist.title")}
              <br />
              <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 py-1 -rotate-[-2deg] transform origin-center font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                {t("waitlist.titleHighlight")}
              </span>
            </h2>
            <p className="text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa] mb-10 max-w-[540px] mx-auto">
              {t("waitlist.subtitle")}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-[520px] mx-auto mb-6">
              <input
                type="email"
                placeholder={tCommon("email")}
                className="flex-1 px-6 py-4 rounded-full border border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#121212] text-base focus:outline-none focus:border-[#111] dark:focus:border-[#ccf381] focus:ring-2 focus:ring-[rgba(0,0,0,0.1)] dark:focus:ring-[rgba(204,243,129,0.2)] transition-all text-black dark:text-white placeholder:text-[#888] dark:placeholder:text-[#a1a1aa]"
                required
              />
              <Button
                type="submit"
                className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black px-9 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-[#d4f89a] inline-flex items-center justify-center gap-2.5 whitespace-nowrap"
              >
                {t("waitlist.button")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-[#888] dark:text-[#a1a1aa]">{t("waitlist.disclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-[42px] font-semibold mb-4 text-black dark:text-white">
            {t("testimonials.title")}{" "}
            <span className="inline-block bg-[#ffeb3b] dark:bg-[#ccf381] text-black dark:text-black px-3 py-1 -rotate-[-2deg] transform origin-center font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
              {t("testimonials.titleHighlight")}
            </span>
          </h3>
          <p className="text-lg text-[#666] dark:text-[#a1a1aa]">{t("testimonials.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 border border-[#e5e5e5] dark:border-[#262626] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
            <div className="flex text-[#ffb800] text-lg mb-4">★★★★★</div>
            <p className="text-base leading-relaxed text-[#444] dark:text-[#a1a1aa] mb-6">
              &ldquo;My Spanish has improved so much! Maria is patient, engaging, and makes learning fun. I can finally have conversations with confidence.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7928ca] to-[#ff0080]" />
              <div>
                <h4 className="font-semibold text-sm text-black dark:text-white">Sarah Chen</h4>
                <p className="text-xs text-[#888] dark:text-[#a1a1aa]">Verified Student</p>
              </div>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 border border-[#e5e5e5] dark:border-[#262626] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
            <div className="flex text-[#ffb800] text-lg mb-4">★★★★★</div>
            <p className="text-base leading-relaxed text-[#444] dark:text-[#a1a1aa] mb-6">
              &ldquo;The flexible scheduling is perfect for my busy lifestyle. I can learn French at my own pace with an amazing tutor. Highly recommend!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3b82f6]" />
              <div>
                <h4 className="font-semibold text-sm text-black dark:text-white">Maya Rodriguez</h4>
                <p className="text-xs text-[#888] dark:text-[#a1a1aa]">Verified Student</p>
              </div>
            </div>
          </div>
          {/* Testimonial 3 */}
          <div className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 border border-[#e5e5e5] dark:border-[#262626] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
            <div className="flex text-[#ffb800] text-lg mb-4">★★★★★</div>
            <p className="text-base leading-relaxed text-[#444] dark:text-[#a1a1aa] mb-6">
              &ldquo;Best investment I&apos;ve made for my career. Learning Japanese with Hiroshi has opened so many opportunities. The quality is outstanding.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8e063]" />
              <div>
                <h4 className="font-semibold text-sm text-black dark:text-white">Zoe Williams</h4>
                <p className="text-xs text-[#888] dark:text-[#a1a1aa]">Verified Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20 bg-gradient-to-br from-[#0a0a0a] to-[#121212] text-white pt-20 pb-8 px-4 md:px-12 overflow-hidden border-t border-[#262626]">
        <div className="absolute top-0 right-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] bg-[radial-gradient(circle,rgba(121,40,202,0.5)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="font-bold text-3xl tracking-[-0.03em] mb-4">
                Linglix<span className="text-[#ccf381]">.</span>
              </div>
              <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
                Learn languages with native tutors. Flexible scheduling, affordable pricing, and real results.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-6">Learn</h4>
              <ul className="space-y-3">
                <li><Link href={`/${locale}/tutors`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Browse Tutors</Link></li>
                <li><Link href={`/${locale}#how-it-works`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href={`/${locale}#about`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-6">Support</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-6">Account</h4>
              <ul className="space-y-3">
                {session ? (
                  <li><Link href={`/${locale}/dashboard`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Dashboard</Link></li>
                ) : (
                  <>
                    <li><Link href={`/${locale}/auth/signin`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Sign In</Link></li>
                    <li><Link href={`/${locale}/auth/signup`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Sign Up</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#666] text-center md:text-left">
              © {new Date().getFullYear()} Linglix. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
