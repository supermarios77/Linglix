"use client";

import { Search, Calendar, Video } from "lucide-react";
import { useTranslations } from "next-intl";

interface Step {
  icon: React.ReactNode;
  gradient: string;
  stepKey: "1" | "2" | "3";
}

const steps: Step[] = [
  {
    icon: <Search className="w-8 h-8 text-white" />,
    gradient: "from-[#ff6b4a] to-[#ffa94d]",
    stepKey: "1",
  },
  {
    icon: <Calendar className="w-8 h-8 text-white" />,
    gradient: "from-[#4a90ff] to-[#4dc3ff]",
    stepKey: "2",
  },
  {
    icon: <Video className="w-8 h-8 text-white" />,
    gradient: "from-[#ff4d8c] to-[#ff8f70]",
    stepKey: "3",
  },
];

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section id="how-it-works" className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-16">
        <h3 className="font-space-grotesk text-[42px] font-semibold mb-4 text-black dark:text-white">
          {t("title")}{" "}
          <span className="inline-block font-bold bg-[#FFE600] text-black px-3 py-1">{t("titleHighlight")}</span>
        </h3>
        <p className="text-lg text-[#666] dark:text-[#a1a1aa]">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => {
          try {
            const stepTitle = t(`steps.${step.stepKey}.title`);
            const stepDescription = t(`steps.${step.stepKey}.description`);

            return (
              <article
                key={step.stepKey}
                className="bg-white dark:bg-[#1a1a1a] rounded-[24px] p-8 border border-[#eee] dark:border-[#262626] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all"
              >
                <div 
                  className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-[16px] flex items-center justify-center mb-6`}
                  aria-hidden="true"
                >
                  {step.icon}
                </div>
                <h4 className="font-space-grotesk text-xl font-semibold mb-3 text-black dark:text-white">
                  {stepTitle}
                </h4>
                <p className="text-[#666] dark:text-[#a1a1aa] leading-relaxed">
                  {stepDescription}
                </p>
              </article>
            );
          } catch {
            return null;
          }
        })}
      </div>
    </section>
  );
}

