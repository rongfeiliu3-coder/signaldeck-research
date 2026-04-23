import Link from "next/link";
import { Activity, ArrowUpRight, BookOpen, Compass, ShieldAlert, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { SignalCard } from "@/components/signal-card";
import { Sparkline } from "@/components/sparkline";
import { assets, getDashboardSignals, getMarketSummary } from "@/lib/mock-data";
import { formatCurrency, formatMetricPercent, formatPercent } from "@/lib/format";
import { getDictionary, localizeStrategy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const signals = getDashboardSignals();
  const topSignal = signals[0];
  const strongestBuys = signals.filter((signal) => signal.action === "Buy").slice(0, 3);
  const watchlistCount = assets.filter((asset) => asset.watchlisted).length;
  const marketSummary = getMarketSummary();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6 rounded-xl border border-white/10 bg-white/[0.035] p-6 shadow-glow">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-1 text-sm text-mint">
              <Activity className="h-4 w-4" aria-hidden="true" />
              {t.dashboard.eyebrow}
            </div>
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">{t.dashboard.heroTitle}</h1>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{t.common.defaultBadge}</span>
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t.dashboard.heroDescription}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {marketSummary.map((item) => {
              const localized =
                item.label === "Tracked assets"
                  ? t.marketSummary.trackedAssets
                  : item.label === "Buy signals"
                    ? t.marketSummary.buySignals
                    : t.marketSummary.averageSharpe;
              return <MetricCard key={item.label} label={localized.label} value={item.value} detail={localized.detail} tone={item.tone} />;
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{t.dashboard.topOpportunity}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-white">{topSignal.symbol}</h2>
                    <span className="rounded-full border border-mint/20 bg-mint/10 px-2.5 py-1 text-xs text-mint">
                      {t.common.confidence} {topSignal.score}/100
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{localizeStrategy(topSignal.strategyId, locale).name}</p>
                </div>
                <Link
                  href={`/symbols/${topSignal.symbol}`}
                  className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                  aria-label={`Open ${topSignal.symbol}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <Sparkline data={topSignal.history} height={150} className="mt-6" emptyLabel={t.common.noSampleData} />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MetricCard label={t.signalCard.signal} value={t.actions[topSignal.action]} detail={t.dashboard.highestModelScore} tone={topSignal.action === "Buy" ? "positive" : "neutral"} />
                <MetricCard label={t.dashboard.lastPrice} value={formatCurrency(topSignal.price)} detail={`${formatPercent(topSignal.changePct)} ${t.dashboard.latestSession}`} tone={topSignal.changePct >= 0 ? "positive" : "negative"} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
                  <p className="text-xs text-slate-500">{t.signalCard.cumulativeReturn}</p>
                  <p className="mt-1 text-base font-semibold text-white">{formatMetricPercent(topSignal.metrics.cumulativeReturn)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
                  <p className="text-xs text-slate-500">{t.signalCard.winRate}</p>
                  <p className="mt-1 text-base font-semibold text-white">{formatMetricPercent(topSignal.metrics.winRate)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
                  <p className="text-xs text-slate-500">{t.signalCard.maxDrawdown}</p>
                  <p className="mt-1 text-base font-semibold text-white">{formatMetricPercent(topSignal.metrics.maxDrawdown)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
                <div className="flex items-center gap-2 text-cyan">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <p className="text-sm font-medium">{t.dashboard.signalWorkbench}</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{t.dashboard.signalWorkbenchBody}</p>
                <div className="mt-4 grid gap-3">
                  {strongestBuys.map((signal) => (
                    <div key={signal.symbol} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-3 py-3">
                      <div>
                        <p className="font-medium text-white">{signal.symbol}</p>
                        <p className="text-sm text-slate-400">{localizeStrategy(signal.strategyId, locale).name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-mint">{signal.score}</p>
                        <p className="text-sm text-slate-500">{formatMetricPercent(signal.metrics.winRate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
                <div className="flex items-center gap-2 text-cyan">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <p className="text-sm font-medium">{t.dashboard.researchFlow}</p>
                </div>
                <ol className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>1. {t.dashboard.flow1}</li>
                  <li>2. {t.dashboard.flow2}</li>
                  <li>3. {t.dashboard.flow3}</li>
                </ol>
              </div>

              <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{t.dashboard.watchlistCoverage}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      {watchlistCount}
                      {locale === "zh" ? " 个标的" : " symbols"}
                    </h2>
                  </div>
                  <Link href="/watchlist" className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                    {t.common.openWatchlist}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-cyan/20 bg-cyan/10 p-5">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 text-cyan" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-white">{t.dashboard.researchScope}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{t.dashboard.researchScopeBody}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-amber/20 bg-amber/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-amber" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-white">{t.common.educationalDisclaimer}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{t.dashboard.disclaimerBody}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t.dashboard.dailySignals}</h2>
            <p className="mt-1 text-sm text-slate-400">{t.dashboard.dashboardSectionDescription}</p>
          </div>
          <Link href="/backtest" className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            {t.common.compareStrategies}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {signals.map((signal, index) => (
            <SignalCard key={signal.symbol} signal={signal} rank={index + 1} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}
