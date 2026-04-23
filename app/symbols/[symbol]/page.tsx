import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, BookOpenText, Star } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { PriceChart } from "@/components/price-chart";
import { Sparkline } from "@/components/sparkline";
import { SymbolPicker } from "@/components/symbol-picker";
import { formatCurrency, formatMetricPercent, formatPercent } from "@/lib/format";
import { getAsset, getDashboardSignals, getHistory } from "@/lib/mock-data";
import {
  getDictionary,
  localizeAction,
  localizeAssetClass,
  localizeAssetMeta,
  localizeStrategy
} from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function SymbolDetailPage({
  params
}: {
  params: Promise<{ symbol: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol);
  const asset = getAsset(decodedSymbol);
  if (!asset) notFound();

  const history = getHistory(asset.symbol, 420);
  const signal = getDashboardSignals().find((item) => item.symbol === asset.symbol);
  const assetMeta = localizeAssetMeta(asset.symbol, locale);
  const latest = history[history.length - 1];
  const first = history[0];
  const totalReturn = (latest.close - first.close) / first.close;
  const high = Math.max(...history.map((point) => point.close));
  const low = Math.min(...history.map((point) => point.close));

  return (
    <div className="space-y-8">
      <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t.common.dashboardBack}
      </Link>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-semibold tracking-normal text-white">{asset.symbol}</h1>
                {asset.watchlisted ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber/10 px-2 py-1 text-xs font-medium text-amber">
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.symbol.watchlist}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-lg text-slate-300">{asset.name}</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{assetMeta?.description ?? asset.description}</p>
            </div>
            <Link
              href={`/backtest?symbol=${encodeURIComponent(asset.symbol)}&strategy=dual-ma`}
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-mint/30 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint hover:bg-mint/15"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              {t.symbol.runBacktest}
            </Link>
          </div>
          <Sparkline data={history.slice(-140)} height={150} className="mt-8" emptyLabel={t.common.noSampleData} />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricCard label={t.symbol.lastClose} value={formatCurrency(latest.close)} detail={latest.date} />
            <MetricCard label={t.symbol.sampleReturn} value={formatMetricPercent(totalReturn)} detail={t.symbol.sinceSampleStart} tone={totalReturn >= 0 ? "positive" : "negative"} />
            <MetricCard label={t.common.confidence} value={`${signal?.score ?? 0}/100`} detail={signal ? localizeStrategy(signal.strategyId, locale).name : "-"} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
            <div className="flex items-center gap-2 text-cyan">
              <BookOpenText className="h-4 w-4" aria-hidden="true" />
              <p className="text-sm font-medium">{t.symbol.researchLens}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{t.symbol.strategyContext}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MetricCard label={t.symbol.currentSetup} value={signal ? localizeAction(signal.action, locale) : "-"} detail={signal ? t.rationales[signal.rationaleKey] : "-"} tone={signal?.action === "Buy" ? "positive" : signal?.action === "Reduce" ? "negative" : "neutral"} />
              <MetricCard label={t.symbol.strategyFit} value={signal ? localizeStrategy(signal.strategyId, locale).name : "-"} detail={t.symbol.historySummary} />
              <MetricCard label={t.symbol.recentBehavior} value={formatPercent(signal?.changePct ?? 0)} detail={t.symbol.latestSampleDay} tone={(signal?.changePct ?? 0) >= 0 ? "positive" : "negative"} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MetricCard label={t.symbol.sampleHigh} value={formatCurrency(high)} detail={t.symbol.sessions320} />
            <MetricCard label={t.symbol.sampleLow} value={formatCurrency(low)} detail={`${localizeAssetClass(asset.assetClass, locale)} - ${assetMeta?.sector ?? asset.sector}`} />
          </div>
        </div>
      </section>

      <PriceChart
        data={history}
        title={`${asset.symbol} ${t.symbol.samplePriceHistory}`}
        summary={t.symbol.historySummary}
        valueLabel={t.common.latestValue}
        emptyLabel={t.common.noChartData}
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
          <h2 className="text-base font-semibold text-white">{t.common.currentModelRead}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label={t.symbol.signal} value={localizeAction(signal?.action ?? "Hold", locale)} detail={signal ? localizeStrategy(signal.strategyId, locale).name : "-"} tone={signal?.action === "Buy" ? "positive" : signal?.action === "Reduce" ? "negative" : "neutral"} />
            <MetricCard label={t.symbol.score} value={`${signal?.score ?? 60}/100`} detail={t.symbol.syntheticConfidence} />
            <MetricCard label={t.signalCard.cumulativeReturn} value={formatMetricPercent(signal?.metrics.cumulativeReturn ?? 0)} detail={t.backtest.equityCurveResult} tone={(signal?.metrics.cumulativeReturn ?? 0) >= 0 ? "positive" : "negative"} />
            <MetricCard label={t.signalCard.winRate} value={formatMetricPercent(signal?.metrics.winRate ?? 0)} detail={`${signal?.metrics.tradeCount ?? 0} ${t.backtest.recentTradesShown}`} />
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
          <h2 className="text-base font-semibold text-white">{t.common.jumpToAnotherSymbol}</h2>
          <div className="mt-4">
            <SymbolPicker selected={asset.symbol} basePath="/symbols" />
          </div>
        </div>
      </section>
    </div>
  );
}
