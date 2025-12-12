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
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-card backdrop-blur-xl border border-border shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:bg-brand-primary hover:border-brand-primary active:scale-95 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 text-foreground hover:text-black" />
      </button>
    </>
  );
}

