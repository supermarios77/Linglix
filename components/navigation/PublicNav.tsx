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
    <header className="fixed top-0 z-50 w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-background/85 backdrop-blur-xl border-b border-border/50">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-lg transition-transform hover:scale-110 z-50"
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
        <ul className="flex gap-6 lg:gap-8 list-none">
          <li>
            <Link
              href={`/${locale}/tutors`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {tNav("browseTutors")}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}#how-it-works`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {tNav("howItWorks")}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}#about`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {tNav("about")}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logo - Centered on mobile, left on desktop */}
      <Link
        href={`/${locale}`}
        className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 text-foreground hover:opacity-80 transition-opacity"
      >
        Linglix<span className="text-brand-primary">.</span>
      </Link>

      {/* Right Side Actions */}
      <div className="flex gap-2 sm:gap-3 md:gap-5 items-center">
        <LanguageSwitcher />
        <ThemeSwitcher />
        {session ? (
          <Link href={`/${locale}/dashboard`}>
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground transition-all hover:scale-105">
              {tCommon("dashboard")}
            </button>
          </Link>
        ) : (
          <>
            <Link href={`/${locale}/auth/signin`}>
              <button className="hidden md:block px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {tAuth("signInTitle")}
              </button>
            </Link>
            <Link href={`/${locale}/auth/signup`}>
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground transition-all hover:scale-105">
                {tAuth("signUpTitle")}
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 sm:top-20 left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border md:hidden shadow-lg">
          <nav className="px-4 py-6">
            <ul className="flex flex-col gap-4 list-none">
              <li>
                <Link
                  href={`/${locale}/tutors`}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav("browseTutors")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#how-it-works`}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#about`}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav("about")}
                </Link>
              </li>
              {!session && (
                <>
                  <li className="pt-2 border-t border-border">
                    <Link
                      href={`/${locale}/auth/signin`}
                      className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors block py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {tAuth("signInTitle")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/auth/signup`}
                      className="inline-block w-full text-center px-4 py-2 rounded-full text-base font-medium bg-primary text-primary-foreground transition-all hover:scale-105"
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

