import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { Sparkline } from "@/components/sparkline";
import { formatCurrency, formatMetricPercent, formatPercent } from "@/lib/format";
import { assets, getDashboardSignals } from "@/lib/mock-data";
import { getDictionary, localizeAction, localizeStrategy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function WatchlistPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const watchlist = assets.filter((asset) => asset.watchlisted);
  const signals = getDashboardSignals().filter((signal) => watchlist.some((asset) => asset.symbol === signal.symbol));
  const buyCount = signals.filter((signal) => signal.action === "Buy").length;
  const averageScore = signals.reduce((sum, signal) => sum + signal.score, 0) / Math.max(1, signals.length);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-white/10 bg-white/[0.035] p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber/25 bg-amber/10 px-3 py-1 text-sm text-amber">
          <Star className="h-4 w-4" aria-hidden="true" />
          {t.watchlist.eyebrow}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white">{t.watchlist.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{t.watchlist.description}</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{t.watchlist.sectionDescription}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MetricCard label={t.watchlist.tracked} value={`${watchlist.length}`} detail={t.watchlist.trackedDetail} />
          <MetricCard label={t.watchlist.buySignals} value={`${buyCount}`} detail={t.watchlist.buySignalsDetail} tone="positive" />
          <MetricCard label={t.watchlist.averageScore} value={averageScore.toFixed(0)} detail={t.watchlist.averageScoreDetail} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {signals.map((signal) => (
          <article key={signal.symbol} className="rounded-xl border border-white/10 bg-panel/80 p-5 transition hover:border-white/20 hover:bg-white/[0.055]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">{signal.symbol}</h2>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">
                    {t.common.confidence} {signal.score}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{signal.name}</p>
                <p className="mt-2 text-sm text-slate-500">{localizeStrategy(signal.strategyId, locale).name}</p>
              </div>
              <Link
                href={`/symbols/${signal.symbol}`}
                className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label={`Open ${signal.symbol}`}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <Sparkline data={signal.history} height={110} className="mt-4" emptyLabel={t.common.noSampleData} />
            <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-slate-500">{t.signalCard.signal}</p>
                <p className="mt-1 font-semibold text-white">{localizeAction(signal.action, locale)}</p>
              </div>
              <div>
                <p className="text-slate-500">{t.signalCard.price}</p>
                <p className="mt-1 font-semibold text-white">{formatCurrency(signal.price)}</p>
              </div>
              <div>
                <p className="text-slate-500">{t.signalCard.change}</p>
                <p className={signal.changePct >= 0 ? "mt-1 font-semibold text-mint" : "mt-1 font-semibold text-rose"}>{formatPercent(signal.changePct)}</p>
              </div>
              <div>
                <p className="text-slate-500">{t.signalCard.winRate}</p>
                <p className="mt-1 font-semibold text-white">{formatMetricPercent(signal.metrics.winRate)}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
