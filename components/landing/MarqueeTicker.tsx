"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

export function MarqueeTicker() {
  const t = useTranslations("landing.marquee");
  
  const items = useMemo(() => {
    try {
      return (t.raw("items") as string[]) || [];
    } catch {
      return [];
    }
  }, [t]);

  const duplicatedItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div 
      className="w-full bg-[#111] dark:bg-[#1a1a1a] text-white py-4 overflow-hidden whitespace-nowrap relative -rotate-1 scale-[1.02] -mt-10 z-5 border-t border-b border-[#333] dark:border-[#444]"
      role="region"
      aria-label="Platform features"
    >
      <div className="flex animate-marquee">
        {duplicatedItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-space-grotesk text-lg font-medium uppercase px-10 tracking-wider shrink-0"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
