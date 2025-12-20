"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // SSR safety check
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-[100] bg-[#111] dark:bg-white text-white dark:text-black p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_15px_35px_rgba(255,255,255,0.25)]"
      aria-label="Scroll to top"
      type="button"
    >
      <ArrowUp className="w-6 h-6" aria-hidden="true" />
    </button>
  );
}

