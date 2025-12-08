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
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#111] text-[#111] dark:text-[#fafafa] overflow-x-hidden">
      {/* Ambient Background Blobs */}
      <div
        className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(50,50,100,0.5)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />
      <div
        className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(100,50,50,0.5)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />

      {/* Client Component for Header and Scroll Button */}
      <LandingPageClient session={session} locale={locale} />

      {/* Main Hero */}
      <main className="relative max-w-[1400px] w-full mx-auto min-h-screen pt-36 pb-16 px-4 md:px-12 grid md:grid-cols-2 items-center gap-16">
        <div className="z-[2]">
          <div className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-black border border-[#e5e5e5] dark:border-[#333] rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2" />
            New Platform Launch
          </div>
          <h1 className="text-[56px] md:text-[76px] leading-[0.95] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
            Learn Languages with <br />
            <span className="italic font-normal bg-gradient-to-r from-[#111] to-[#555] dark:from-white dark:to-[#aaa] bg-clip-text text-transparent">
              Native Tutors.
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-[#555] dark:text-[#aaa] max-w-[460px] mb-10">
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
          <div className="group w-full h-full rounded-[40px] overflow-hidden relative -rotate-2 transition-transform duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:rotate-0">
            <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#333] dark:from-white dark:to-[#ddd] flex items-center justify-center">
              <Users className="w-32 h-32 md:w-48 md:h-48 text-white dark:text-black opacity-50" />
            </div>
            {/* Badge Element */}
            <div className="absolute top-5 left-5 z-[4] w-[100px] h-[100px] flex items-center justify-center bg-[#111] dark:bg-white rounded-full text-white dark:text-black font-extrabold text-center rotate-[15deg] shadow-[0_10px_20px_rgba(0,0,0,0.1)] text-sm leading-tight">
              BEST
              <br />
              TUTORS
            </div>
          </div>
          {/* Floating Glassmorphism Card 1 */}
          <div className="floating-card absolute bottom-[60px] left-[-40px] bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(0,0,0,0.7)] backdrop-blur-2xl p-4 rounded-[20px] border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex items-center gap-3 z-[3]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#111] to-[#333] dark:from-white dark:to-[#ddd] flex items-center justify-center">
              <Users className="w-6 h-6 text-white dark:text-black" />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">Native Speakers</h4>
              <p className="text-xs text-[#666] dark:text-[#999]">Certified Tutors</p>
              <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★★</div>
            </div>
          </div>
          {/* Floating Glassmorphism Card 2 */}
          <div className="floating-card absolute top-20 right-[-20px] bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(0,0,0,0.7)] backdrop-blur-2xl p-4 rounded-[20px] border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex items-center gap-3 z-[3] animate-[float_6s_ease-in-out_1.5s_infinite]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#111] to-[#333] dark:from-white dark:to-[#ddd] flex items-center justify-center">
              <Clock className="w-6 h-6 text-white dark:text-black" />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-0.5 text-black dark:text-white">Flexible Schedule</h4>
              <p className="text-xs text-[#666] dark:text-[#999]">24/7 Available</p>
              <div className="flex text-[#ffb800] text-xs mt-0.5">★★★★☆</div>
            </div>
          </div>
        </div>
      </main>

      {/* Marquee Ticker */}
      <div className="w-full bg-[#111] dark:bg-white text-white dark:text-black py-4 overflow-hidden whitespace-nowrap relative -rotate-1 scale-[1.02] -mt-10 z-[5] border-t border-b border-[#333] dark:border-[#ddd]">
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
          <Link href={`/${locale}/tutors`} className="underline font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors">
            {t("trending.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Tutor Card 1 */}
          <div className="group bg-white dark:bg-black rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#444]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Maria Garcia</span>
                <span className="text-xs text-[#888] dark:text-[#666]">Spanish Tutor</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">4.9</span>
              </div>
            </div>
          </div>
          {/* Tutor Card 2 */}
          <div className="group bg-white dark:bg-black rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#444]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Jean-Pierre</span>
                <span className="text-xs text-[#888] dark:text-[#666]">French Tutor</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">5.0</span>
              </div>
            </div>
          </div>
          {/* Tutor Card 3 */}
          <div className="group bg-white dark:bg-black rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#444]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Hiroshi Tanaka</span>
                <span className="text-xs text-[#888] dark:text-[#666]">Japanese Tutor</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                <span className="font-bold text-sm text-black dark:text-white">4.8</span>
              </div>
            </div>
          </div>
          {/* Tutor Card 4 */}
          <div className="group bg-white dark:bg-black rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] dark:hover:border-[#333] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
              <Users className="w-16 h-16 text-[#ccc] dark:text-[#444]" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1 text-black dark:text-white">Emma Schmidt</span>
                <span className="text-xs text-[#888] dark:text-[#666]">German Tutor</span>
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-40 blur-[100px] bg-[radial-gradient(circle,rgb(255,200,220)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(100,100,50,0.3)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="relative bg-gradient-to-br from-white to-[#fafafa] dark:from-black dark:to-[#1a1a1a] rounded-[40px] p-16 border border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] shadow-[0_40px_80px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />
          <div className="relative max-w-[700px] mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-black border border-[#e5e5e5] dark:border-[#333] rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <span className="w-2 h-2 bg-[#111] dark:bg-white rounded-full mr-2 animate-pulse" />
              {t("waitlist.badge")}
            </div>
            <h2 className="text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-6 text-black dark:text-white">
              {t("waitlist.title")}
              <br />
              <span className="italic font-normal bg-gradient-to-r from-[#111] to-[#555] dark:from-white dark:to-[#aaa] bg-clip-text text-transparent">
                {t("waitlist.titleHighlight")}
              </span>
            </h2>
            <p className="text-lg leading-relaxed text-[#555] dark:text-[#aaa] mb-10 max-w-[540px] mx-auto">
              {t("waitlist.subtitle")}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-[520px] mx-auto mb-6">
              <input
                type="email"
                placeholder={tCommon("email")}
                className="flex-1 px-6 py-4 rounded-full border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-black text-base focus:outline-none focus:border-[#111] dark:focus:border-white focus:ring-2 focus:ring-[rgba(0,0,0,0.1)] dark:focus:ring-[rgba(255,255,255,0.1)] transition-all text-black dark:text-white placeholder:text-[#888] dark:placeholder:text-[#666]"
                required
              />
              <Button
                type="submit"
                className="bg-[#111] dark:bg-white text-white dark:text-black px-9 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] dark:hover:bg-[#eee] inline-flex items-center justify-center gap-2.5 whitespace-nowrap"
              >
                {t("waitlist.button")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-[#888] dark:text-[#666]">{t("waitlist.disclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-[42px] font-semibold mb-4 text-black dark:text-white">
            {t("testimonials.title")}{" "}
            <span className="italic font-normal bg-gradient-to-r from-[#111] to-[#555] dark:from-white dark:to-[#aaa] bg-clip-text text-transparent">
              {t("testimonials.titleHighlight")}
            </span>
          </h3>
          <p className="text-lg text-[#666] dark:text-[#999]">{t("testimonials.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="group bg-white dark:bg-black rounded-[24px] p-8 border border-[#eee] dark:border-[#333] transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
            <div className="flex text-[#ffb800] text-lg mb-4">★★★★★</div>
            <p className="text-base leading-relaxed text-[#444] dark:text-[#aaa] mb-6">
              &ldquo;My Spanish has improved so much! Maria is patient, engaging, and makes learning fun. I can finally have conversations with confidence.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#111] to-[#333] dark:from-white dark:to-[#ddd]" />
              <div>
                <h4 className="font-semibold text-sm text-black dark:text-white">Sarah Chen</h4>
                <p className="text-xs text-[#888] dark:text-[#666]">Verified Student</p>
              </div>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="group bg-white dark:bg-black rounded-[24px] p-8 border border-[#eee] dark:border-[#333] transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
            <div className="flex text-[#ffb800] text-lg mb-4">★★★★★</div>
            <p className="text-base leading-relaxed text-[#444] dark:text-[#aaa] mb-6">
              &ldquo;The flexible scheduling is perfect for my busy lifestyle. I can learn French at my own pace with an amazing tutor. Highly recommend!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#111] to-[#333] dark:from-white dark:to-[#ddd]" />
              <div>
                <h4 className="font-semibold text-sm text-black dark:text-white">Maya Rodriguez</h4>
                <p className="text-xs text-[#888] dark:text-[#666]">Verified Student</p>
              </div>
            </div>
          </div>
          {/* Testimonial 3 */}
          <div className="group bg-white dark:bg-black rounded-[24px] p-8 border border-[#eee] dark:border-[#333] transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
            <div className="flex text-[#ffb800] text-lg mb-4">★★★★★</div>
            <p className="text-base leading-relaxed text-[#444] dark:text-[#aaa] mb-6">
              &ldquo;Best investment I&apos;ve made for my career. Learning Japanese with Hiroshi has opened so many opportunities. The quality is outstanding.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#111] to-[#333] dark:from-white dark:to-[#ddd]" />
              <div>
                <h4 className="font-semibold text-sm text-black dark:text-white">Zoe Williams</h4>
                <p className="text-xs text-[#888] dark:text-[#666]">Verified Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20 bg-gradient-to-br from-[#111] to-[#1a1a1a] dark:from-white dark:to-[#f5f5f5] text-white dark:text-black pt-20 pb-8 px-4 md:px-12 overflow-hidden">
        <div className="absolute top-0 right-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="font-bold text-3xl tracking-[-0.03em] mb-4">
                Linglix<span className="text-white dark:text-black">.</span>
              </div>
              <p className="text-sm text-[#999] dark:text-[#666] leading-relaxed mb-6">
                Learn languages with native tutors. Flexible scheduling, affordable pricing, and real results.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-6">Learn</h4>
              <ul className="space-y-3">
                <li><Link href={`/${locale}/tutors`} className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">Browse Tutors</Link></li>
                <li><Link href={`/${locale}#how-it-works`} className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">How It Works</Link></li>
                <li><Link href={`/${locale}#about`} className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-6">Support</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">FAQs</Link></li>
                <li><Link href="#" className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-6">Account</h4>
              <ul className="space-y-3">
                {session ? (
                  <li><Link href={`/${locale}/dashboard`} className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">Dashboard</Link></li>
                ) : (
                  <>
                    <li><Link href={`/${locale}/auth/signin`} className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">Sign In</Link></li>
                    <li><Link href={`/${locale}/auth/signup`} className="text-sm text-[#999] dark:text-[#666] hover:text-white dark:hover:text-black transition-colors">Sign Up</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[rgba(255,255,255,0.1)] dark:border-[rgba(0,0,0,0.1)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#666] dark:text-[#999] text-center md:text-left">
              © {new Date().getFullYear()} Linglix. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-xs text-[#666] dark:text-[#999] hover:text-white dark:hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-xs text-[#666] dark:text-[#999] hover:text-white dark:hover:text-black transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
