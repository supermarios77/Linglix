"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface PublicNavProps {
  locale: string;
  session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null;
}

/**
 * Public Navigation Component
 * 
 * Reusable navigation bar for non-authenticated users
 * Matches landing page style
 * Production-ready with mobile responsiveness
 */
export function PublicNav({ locale, session }: PublicNavProps) {
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("landing.navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest("header") &&
        !target.closest("nav")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [locale]);

  return (
    <header className="fixed top-0 z-[1000] w-full h-20 flex justify-between items-center px-4 md:px-12 bg-[rgba(250,250,250,0.85)] dark:bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] dark:border-[rgba(255,255,255,0.05)]">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-lg transition-transform hover:scale-110"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6 text-black dark:text-white" />
        ) : (
          <Menu className="w-6 h-6 text-black dark:text-white" />
        )}
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <ul className="flex gap-8 list-none">
          <li>
            <Link
              href={`/${locale}/tutors`}
              className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
            >
              {tNav("browseTutors")}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}#how-it-works`}
              className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
            >
              {tNav("howItWorks")}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}#about`}
              className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
            >
              {tNav("about")}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logo - Centered on mobile, left on desktop */}
      <Link
        href={`/${locale}`}
        className="font-space-grotesk font-bold text-xl md:text-2xl tracking-[-0.03em] absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 text-black dark:text-white hover:opacity-80 transition-opacity"
      >
        Linglix<span className="text-accent">.</span>
      </Link>

      {/* Right Side Actions */}
      <div className="flex gap-3 md:gap-5 items-center">
        <LanguageSwitcher />
        <ThemeSwitcher />
        {session ? (
          <Link href={`/${locale}/dashboard`}>
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-[#111] dark:bg-white text-white dark:text-black transition-all hover:scale-105 hover:bg-[#222] dark:hover:bg-gray-100">
              {tCommon("dashboard")}
            </button>
          </Link>
        ) : (
          <>
            <Link href={`/${locale}/auth/signin`}>
              <button className="hidden md:block text-sm font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors">
                {tAuth("signInTitle")}
              </button>
            </Link>
            <Link href={`/${locale}/auth/signup`}>
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-[#111] dark:bg-white text-white dark:text-black transition-all hover:scale-105 hover:bg-[#222] dark:hover:bg-gray-100">
                {tAuth("signUpTitle")}
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[rgba(250,250,250,0.98)] dark:bg-[rgba(5,5,5,0.98)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] dark:border-[rgba(255,255,255,0.05)] md:hidden">
          <nav className="px-4 py-6">
            <ul className="flex flex-col gap-4 list-none">
              <li>
                <Link
                  href={`/${locale}/tutors`}
                  className="text-base font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav("browseTutors")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#how-it-works`}
                  className="text-base font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#about`}
                  className="text-base font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav("about")}
                </Link>
              </li>
              {!session && (
                <>
                  <li className="pt-2 border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)]">
                    <Link
                      href={`/${locale}/auth/signin`}
                      className="text-base font-medium text-[#444] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {tAuth("signInTitle")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/auth/signup`}
                      className="inline-block w-full text-center px-4 py-2 rounded-full text-base font-medium bg-[#111] dark:bg-white text-white dark:text-black transition-all hover:scale-105 dark:hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {tAuth("signUpTitle")}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

