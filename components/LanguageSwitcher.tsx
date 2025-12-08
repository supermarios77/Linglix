"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Language Switcher Component (Dropdown)
 * 
 * Dropdown menu for switching between available languages
 * while preserving the current route
 */
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Switch to a different locale
   */
  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
    
    // Navigate to new locale with same path
    router.push(`/${newLocale}${pathnameWithoutLocale}`);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-[#444] hover:text-black dark:text-[#aaa] dark:hover:text-white transition-colors bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#333] hover:border-[#d4d4d4] dark:hover:border-[#666]"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span>{currentLocale.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-[#e5e5e5] dark:border-[#333] rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden z-50 min-w-[140px]">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                currentLocale === locale
                  ? "bg-[#111] dark:bg-white text-white dark:text-black"
                  : "text-[#444] dark:text-[#aaa] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]"
              }`}
              aria-label={`Switch to ${localeNames[locale]}`}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
