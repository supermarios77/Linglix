"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { PublicNav } from "@/components/navigation/PublicNav";

interface LandingPageClientProps {
  session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null;
  locale: string;
}

export function LandingPageClient({ session, locale }: LandingPageClientProps) {
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

  return (
    <>
      <PublicNav locale={locale} session={session} />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-[999] w-12 h-12 rounded-full bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.1)] shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] active:scale-95 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 text-accent" />
      </button>
    </>
  );
}

