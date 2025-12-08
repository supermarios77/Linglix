"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface FooterProps {
  locale: string;
  session: any;
}

/**
 * Footer Component
 * 
 * Site footer with navigation links and copyright
 * Production-ready with proper TypeScript types
 */
export function Footer({ locale, session }: FooterProps) {
  const tCommon = useTranslations("common");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-[#0a0a0a] to-[#121212] text-white pt-20 pb-8 px-4 md:px-12 overflow-hidden border-t border-[#262626]">
      <div className="absolute top-0 right-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] bg-[radial-gradient(circle,rgba(121,40,202,0.5)_0%,rgba(0,0,0,0)_70%)]" aria-hidden="true" />
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
              <li>
                <Link href={`/${locale}/tutors`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  Browse Tutors
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#how-it-works`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#about`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-6">Account</h4>
            <ul className="space-y-3">
              {session ? (
                <li>
                  <Link href={`/${locale}/dashboard`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                    {tCommon("dashboard")}
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href={`/${locale}/auth/signin`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/auth/signup`} className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#666] text-center md:text-left">
            © {currentYear} Linglix. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

