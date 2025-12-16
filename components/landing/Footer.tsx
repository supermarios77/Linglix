"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface FooterProps {
  locale: string;
  session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null;
}

/**
 * Footer Component
 * 
 * Site footer with navigation links and copyright
 * Production-ready with proper TypeScript types
 */
export function Footer({ locale, session }: FooterProps) {
  const tCommon = useTranslations("common");
  const t = useTranslations("landing.footer");
  const tNav = useTranslations("landing.navigation");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-[#111] to-[#1a1a1a] text-white pt-20 pb-8 px-4 md:px-12 overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute top-0 right-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] bg-[radial-gradient(circle,rgb(255,77,140)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative max-w-[1400px] mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div>
            <div className="font-bold text-3xl tracking-[-0.03em] mb-4">
              Linglix<span className="text-accent">.</span>
            </div>
            <p className="text-sm text-[#999] leading-relaxed mb-6">
              {t("description")}
            </p>
          </div>
          {/* Learn Column */}
          <div>
            <h4 className="font-semibold text-base mb-6">{t("learn")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/tutors`} className="text-sm text-[#999] hover:text-white transition-colors">
                  {tNav("browseTutors")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#how-it-works`} className="text-sm text-[#999] hover:text-white transition-colors">
                  {tNav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#about`} className="text-sm text-[#999] hover:text-white transition-colors">
                  {tNav("about")}
                </Link>
              </li>
            </ul>
          </div>
          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-base mb-6">{t("support")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                  {t("faqs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                  {t("helpCenter")}
                </Link>
              </li>
            </ul>
          </div>
          {/* Account Column */}
          <div>
            <h4 className="font-semibold text-base mb-6">{t("account")}</h4>
            <ul className="space-y-3">
              {session ? (
                <li>
                  <Link href={`/${locale}/dashboard`} className="text-sm text-[#999] hover:text-white transition-colors">
                    {tCommon("dashboard")}
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href={`/${locale}/auth/signin`} className="text-sm text-[#999] hover:text-white transition-colors">
                      {tCommon("signIn")}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/auth/signup`} className="text-sm text-[#999] hover:text-white transition-colors">
                      {tCommon("signUp")}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.1)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#666] text-center md:text-left">
            © {currentYear} Linglix. {t("allRightsReserved")}.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

