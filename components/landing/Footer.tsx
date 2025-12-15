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
    <footer className="relative mt-12 sm:mt-16 md:mt-20 bg-gradient-to-br from-[#0a0a0a] to-[#121212] text-white pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 px-4 sm:px-6 md:px-12 overflow-hidden border-t border-[#262626]">
      <div className="absolute top-0 right-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] bg-[radial-gradient(circle,rgba(121,40,202,0.5)_0%,rgba(0,0,0,0)_70%)]" aria-hidden="true" />
      <div className="relative max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12 md:mb-16">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="font-bold text-2xl sm:text-3xl tracking-[-0.03em] mb-3 sm:mb-4">
              Linglix<span className="text-accent">.</span>
            </div>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed mb-4 sm:mb-6">
              {t("description")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-4 sm:mb-6">{t("learn")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href={`/${locale}/tutors`} className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  {tNav("browseTutors")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#how-it-works`} className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  {tNav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#about`} className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  {tNav("about")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-4 sm:mb-6">{t("support")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="#" className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  {t("faqs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                  {t("helpCenter")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-4 sm:mb-6">{t("account")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {session ? (
                <li>
                  <Link href={`/${locale}/dashboard`} className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                    {tCommon("dashboard")}
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href={`/${locale}/auth/signin`} className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                      {tCommon("signIn")}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/auth/signup`} className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors">
                      {tCommon("signUp")}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="pt-6 sm:pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-[#666] text-center md:text-left">
            © {currentYear} Linglix. {t("allRightsReserved")}.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-[10px] sm:text-xs text-[#666] hover:text-white transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="text-[10px] sm:text-xs text-[#666] hover:text-white transition-colors">
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

