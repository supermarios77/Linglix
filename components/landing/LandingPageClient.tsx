"use client";

import { useState, useEffect } from "react";
import { ArrowUp, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface LandingPageClientProps {
  session: any;
  locale: string;
}

export function LandingPageClient({ session, locale }: LandingPageClientProps) {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("landing.navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const marqueeItems = t.raw("marquee.items") as string[];

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 z-[1000] w-full h-20 flex justify-between items-center px-4 md:px-12 bg-[rgba(250,250,250,0.85)] dark:bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] dark:border-[#262626]">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-lg transition-transform hover:scale-110"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-8 list-none">
            <li>
              <Link href={`/${locale}/tutors`} className="text-sm font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors">
                {tNav("browseTutors")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}#how-it-works`} className="text-sm font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors">
                {tNav("howItWorks")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}#about`} className="text-sm font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors">
                {tNav("about")}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logo - Centered on mobile, left on desktop */}
        <Link href={`/${locale}`} className="font-bold text-xl md:text-2xl tracking-[-0.03em] absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 text-black dark:text-white">
          Linglix<span className="text-[#111] dark:text-[#ccf381]">.</span>
        </Link>

        <div className="flex gap-3 md:gap-5 items-center">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {session ? (
            <Link href={`/${locale}/dashboard`}>
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-[#111] dark:bg-[#ccf381] text-white dark:text-black transition-all hover:scale-105">
                {tCommon("dashboard")}
              </button>
            </Link>
          ) : (
            <>
              <Link href={`/${locale}/auth/signin`}>
                <button className="hidden md:block px-4 py-2 rounded-full text-sm font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors">
                  {tAuth("signInTitle")}
                </button>
              </Link>
              <Link href={`/${locale}/auth/signup`}>
                <button className="px-4 py-2 rounded-full text-sm font-medium bg-[#111] dark:bg-[#ccf381] text-white dark:text-black transition-all hover:scale-105">
                  {tAuth("signUpTitle")}
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-[rgba(250,250,250,0.98)] dark:bg-[rgba(5,5,5,0.98)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] dark:border-[#262626] md:hidden">
            <nav className="px-4 py-6">
              <ul className="flex flex-col gap-4 list-none">
                <li>
                  <Link
                    href={`/${locale}/tutors`}
                    className="text-base font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tNav("browseTutors")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}#how-it-works`}
                    className="text-base font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tNav("howItWorks")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}#about`}
                    className="text-base font-medium text-[#444] dark:text-[#aaa] hover:text-black dark:hover:text-white transition-colors block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tNav("about")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-[999] w-12 h-12 rounded-full bg-white dark:bg-[#1a1a1a] backdrop-blur-xl border border-[rgba(0,0,0,0.06)] dark:border-[#262626] shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:bg-[#ccf381] dark:hover:bg-[#ccf381] hover:border-[#ccf381] active:scale-95 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 text-[#111] dark:text-white hover:text-black dark:hover:text-black" />
      </button>
    </>
  );
}

