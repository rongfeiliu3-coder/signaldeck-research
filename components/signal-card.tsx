import Link from "next/link";
import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Signal } from "@/lib/types";
import { formatCurrency, formatMetricPercent, formatPercent } from "@/lib/format";
import { Sparkline } from "@/components/sparkline";
import { cn } from "@/lib/utils";
import { Locale, getDictionary, localizeAction, localizeStrategy } from "@/lib/i18n";

const actionStyle = {
  Buy: "border-mint/30 bg-mint/10 text-mint",
  Hold: "border-cyan/30 bg-cyan/10 text-cyan",
  Reduce: "border-rose/30 bg-rose/10 text-rose"
};

export function SignalCard({
  signal,
  rank,
  locale
}: {
  signal: Signal;
  rank?: number;
  locale: Locale;
}) {
  const Icon = signal.action === "Buy" ? TrendingUp : signal.action === "Reduce" ? TrendingDown : Minus;
  const t = getDictionary(locale);
  const strategy = localizeStrategy(signal.strategyId, locale);
  const confidenceTone = signal.score >= 78 ? t.common.strong : signal.score >= 60 ? t.common.balanced : t.common.cautious;

  return (
    <article className="group rounded-xl border border-white/10 bg-panel/80 p-5 transition hover:border-white/20 hover:bg-white/[0.055] hover:shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-white">{signal.symbol}</h2>
            <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium", actionStyle[signal.action])}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {localizeAction(signal.action, locale)}
            </span>
            {rank ? <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400">{t.common.rankPrefix}{rank}</span> : null}
          </div>
          <p className="mt-1 text-sm text-slate-400">{signal.name}</p>
        </div>
        <Link
          href={`/symbols/${signal.symbol}`}
          className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label={`Open ${signal.symbol} details`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-normal text-slate-500">{t.signalCard.modelStrategy}</p>
          <p className="mt-1 text-sm font-medium text-slate-200">{strategy.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-normal text-slate-500">{t.signalCard.price}</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(signal.price)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-normal text-slate-500">{t.common.confidence}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-base font-semibold text-white">{signal.score}/100</p>
            <span className="text-xs text-slate-400">{confidenceTone}</span>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-normal text-slate-500">{t.signalCard.tradeCount}</p>
          <p className="mt-1 text-base font-semibold text-white">{signal.metrics.tradeCount}</p>
        </div>
      </div>

      <Sparkline
        data={signal.history}
        height={96}
        className="mt-4"
        stroke={signal.action === "Reduce" ? "#FF6B7A" : signal.action === "Hold" ? "#5EDFFF" : "#42E6A4"}
        emptyLabel={t.common.noSampleData}
      />

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-slate-500">{t.signalCard.change}</p>
          <p className={cn("mt-1 font-semibold", signal.changePct >= 0 ? "text-mint" : "text-rose")}>{formatPercent(signal.changePct)}</p>
        </div>
        <div>
          <p className="text-slate-500">{t.signalCard.cumulativeReturn}</p>
          <p className="mt-1 font-semibold text-white">{formatMetricPercent(signal.metrics.cumulativeReturn)}</p>
        </div>
        <div>
          <p className="text-slate-500">{t.signalCard.winRate}</p>
          <p className="mt-1 font-semibold text-white">{formatMetricPercent(signal.metrics.winRate)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">{t.rationales[signal.rationaleKey]}</p>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs text-slate-500">{t.common.syntheticData}</span>
        <Link href={`/backtest?symbol=${signal.symbol}&strategy=dual-ma`} className="focus-ring text-sm font-medium text-cyan transition group-hover:text-white">
          {t.common.viewBacktest}
        </Link>
      </div>
    </article>
  );
}
