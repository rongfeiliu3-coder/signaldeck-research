"use client";

import { useRouter } from "next/navigation";
import { Locale, localeCookieName } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function setLocale(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
      {(["zh", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={cn(
            "focus-ring rounded-md px-2.5 py-1.5 text-xs font-medium transition",
            locale === option ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          )}
        >
          {option === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
  );
}
