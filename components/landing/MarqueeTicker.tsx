"use client";

/**
 * Marquee Ticker Component
 * 
 * Animated scrolling marquee with language learning features
 * Production-ready with proper accessibility
 */
interface MarqueeTickerProps {
  items: string[];
}

export function MarqueeTicker({ items }: MarqueeTickerProps) {
  return (
    <div 
      className="w-full bg-[#111] dark:bg-[#0a0a0a] text-white py-3 sm:py-4 overflow-hidden whitespace-nowrap relative -rotate-1 scale-[1.02] -mt-8 sm:-mt-10 z-[5] border-t border-b border-[#262626]"
      aria-label="Featured language learning features"
    >
      <div className="inline-block animate-[marquee_20s_linear_infinite]">
        {items.map((item, index) => (
          <span key={index} className="text-sm sm:text-base md:text-lg font-medium uppercase px-6 sm:px-8 md:px-10 tracking-wider inline-block">
            {item}
          </span>
        ))}
        {items.map((item, index) => (
          <span key={`duplicate-${index}`} className="text-sm sm:text-base md:text-lg font-medium uppercase px-6 sm:px-8 md:px-10 tracking-wider inline-block">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

