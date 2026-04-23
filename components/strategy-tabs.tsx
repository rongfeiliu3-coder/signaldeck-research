import Link from "next/link";
import { strategies } from "@/lib/mock-data";
import { StrategyId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Locale, localizeStrategy } from "@/lib/i18n";

export function StrategyTabs({ selected, symbol, locale }: { selected: StrategyId; symbol: string; locale: Locale }) {
  return (
    <div className="flex flex-wrap gap-2">
      {strategies.map((strategy) => (
        <Link
          key={strategy.id}
          href={`/backtest?symbol=${encodeURIComponent(symbol)}&strategy=${strategy.id}`}
          className={cn(
            "focus-ring rounded-md border px-3 py-2 text-sm font-medium transition",
            selected === strategy.id
              ? "border-mint/40 bg-mint/10 text-mint"
              : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
          )}
        >
          {localizeStrategy(strategy.id, locale).name}
        </Link>
      ))}
    </div>
  );
}
