import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Binary,
  CalendarRange,
  Radar,
  ScrollText
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { PriceChart } from "@/components/price-chart";
import { StrategyTabs } from "@/components/strategy-tabs";
import { SymbolPicker } from "@/components/symbol-picker";
import { formatCurrency, formatDateLabel, formatMetricPercent, formatNumber } from "@/lib/format";
import { assets, strategies } from "@/lib/mock-data";
import { runBacktest } from "@/lib/backtest";
import { StrategyId } from "@/lib/types";
import { getDictionary, localizeAssetClass, localizeAssetMeta, localizeStrategy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

function isStrategyId(value: string | undefined): value is StrategyId {
  return strategies.some((strategy) => strategy.id === value);
}

function describeTrade(strategyId: StrategyId, holdingDays: number, returnPct: number, locale: "en" | "zh") {
  const setup =
    strategyId === "dual-ma"
      ? locale === "zh"
        ? "趋势延续"
        : "Trend follow-through"
      : strategyId === "rsi-mean-reversion"
        ? locale === "zh"
          ? "超卖反弹"
          : "Oversold rebound"
        : locale === "zh"
          ? "突破跟进"
          : "Breakout continuation";

  const quality =
    returnPct > 0.12 ? (locale === "zh" ? "强" : "Strong") : returnPct > 0 ? (locale === "zh" ? "均衡" : "Balanced") : locale === "zh" ? "谨慎" : "Cautious";

  const note =
    holdingDays > 80
      ? locale === "zh"
        ? "持有周期偏长，说明趋势延续较久。"
        : "Long holding period suggests a durable move."
      : returnPct < 0
        ? locale === "zh"
          ? "离场较快，说明信号确认不足。"
          : "Fast exit suggests weak confirmation."
        : locale === "zh"
          ? "节奏正常，符合该策略的典型持仓区间。"
          : "Holding window sits within a normal range for the rule.";

  return { setup, quality, note };
}

export default async function BacktestPage({
  searchParams
}: {
  searchParams: Promise<{ symbol?: string; strategy?: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = await searchParams;
  const symbol = assets.some((asset) => asset.symbol === params.symbol) ? params.symbol! : "SPY";
  const strategyId = isStrategyId(params.strategy) ? params.strategy : "dual-ma";
  const result = runBacktest(symbol, strategyId);
  const asset = assets.find((item) => item.symbol === symbol) ?? assets[0];
  const assetMeta = localizeAssetMeta(asset.symbol, locale);
  const strategyText = localizeStrategy(result.strategy.id, locale);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-white/10 bg-white/[0.035] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-sm text-cyan">
              <Activity className="h-4 w-4" aria-hidden="true" />
              {t.backtest.eyebrow}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white">{t.backtest.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{t.backtest.description}</p>
          </div>
          <Link
            href={`/symbols/${symbol}`}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            {t.common.openSymbolDetail}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6 space-y-4">
          <SymbolPicker selected={symbol} strategy={strategyId} />
          <StrategyTabs selected={strategyId} symbol={symbol} locale={locale} />
          <p className="text-sm text-slate-400">{t.backtest.strategyExplainer}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">{t.backtest.selectedInstrument}</p>
              <h2 className="mt-1 text-3xl font-semibold text-white">{asset.symbol}</h2>
              <p className="mt-2 text-sm text-slate-300">{asset.name}</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{assetMeta?.description ?? asset.description}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-normal text-slate-500">{t.backtest.strategy}</p>
              <p className="mt-1 font-medium text-white">{strategyText.name}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricCard label={t.backtest.universe} value={localizeAssetClass(asset.assetClass, locale)} detail={assetMeta?.sector ?? asset.sector} />
            <MetricCard label={t.common.sampleWindow} value={locale === "zh" ? "420天" : "420d"} detail={t.backtest.deterministicHistory} />
            <MetricCard label={t.common.exposure} value={formatMetricPercent(result.exposureRate)} detail={result.latestSignalDate} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
          <div className="flex items-center gap-2 text-cyan">
            <Binary className="h-4 w-4" aria-hidden="true" />
            <p className="text-sm font-medium">{t.backtest.strategyBehavior}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{strategyText.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">{t.backtest.liveState}</p>
              <p className="mt-1 text-base font-semibold text-white">
                {result.latestSignalActive ? t.backtest.currentlyActive : t.backtest.currentlyFlat}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">{t.common.tradeCount}</p>
              <p className="mt-1 text-base font-semibold text-white">{result.tradeCount}</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4">
            <CalendarRange className="mt-0.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <p className="text-sm leading-6 text-slate-400">{t.backtest.ruleSummaryBody}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label={t.backtest.cumulativeReturn} value={formatMetricPercent(result.cumulativeReturn)} detail={t.backtest.equityCurveResult} tone={result.cumulativeReturn >= 0 ? "positive" : "negative"} />
        <MetricCard label={t.backtest.maxDrawdown} value={formatMetricPercent(result.maxDrawdown)} detail={t.backtest.worstPeakToTrough} tone="negative" />
        <MetricCard label={t.backtest.sharpeRatio} value={formatNumber(result.sharpeRatio, 2)} detail={t.backtest.annualizedSample} />
        <MetricCard label={t.backtest.winRate} value={formatMetricPercent(result.winRate)} detail={`${result.tradeCount} ${t.backtest.recentTradesShown}`} />
        <MetricCard label={t.backtest.averageHoldingPeriod} value={`${formatNumber(result.averageHoldingPeriod, 1)}${locale === "zh" ? "天" : "d"}`} detail={t.backtest.calendarDays} />
      </section>

      <PriceChart
        data={result.equityCurve}
        title={`${symbol} - ${strategyText.name}${t.backtest.equityCurve}`}
        summary={t.backtest.equityCurveSummary}
        stroke="#42E6A4"
        valueLabel={t.common.endingEquity}
        emptyLabel={t.common.noChartData}
      />

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-cyan" aria-hidden="true" />
              <h2 className="text-base font-semibold text-white">{t.backtest.tradeJournal}</h2>
            </div>
            <p className="text-sm text-slate-500">{t.common.newestFirst}</p>
          </div>
          {result.trades.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr className="border-b border-white/10">
                    <th className="py-3 font-medium">{t.backtest.entry}</th>
                    <th className="py-3 font-medium">{t.backtest.exit}</th>
                    <th className="py-3 font-medium">{t.backtest.entryPrice}</th>
                    <th className="py-3 font-medium">{t.backtest.exitPrice}</th>
                    <th className="py-3 font-medium">{t.backtest.return}</th>
                    <th className="py-3 font-medium">{t.backtest.hold}</th>
                    <th className="py-3 font-medium">{t.common.setup}</th>
                    <th className="py-3 font-medium">{t.common.quality}</th>
                    <th className="py-3 font-medium">{t.common.notes}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((trade) => {
                    const annotation = describeTrade(result.strategy.id, trade.holdingDays, trade.returnPct, locale);
                    return (
                      <tr key={`${trade.entryDate}-${trade.exitDate}`} className="border-b border-white/5 text-slate-300">
                        <td className="py-3">
                          <div>{formatDateLabel(trade.entryDate)}</div>
                          <div className="text-xs text-slate-500">{trade.entryDate}</div>
                        </td>
                        <td className="py-3">
                          <div>{formatDateLabel(trade.exitDate)}</div>
                          <div className="text-xs text-slate-500">{trade.exitDate}</div>
                        </td>
                        <td className="py-3">{formatCurrency(trade.entryPrice)}</td>
                        <td className="py-3">{formatCurrency(trade.exitPrice)}</td>
                        <td className={trade.returnPct >= 0 ? "py-3 text-mint" : "py-3 text-rose"}>{formatMetricPercent(trade.returnPct)}</td>
                        <td className="py-3">{trade.holdingDays}{locale === "zh" ? "天" : "d"}</td>
                        <td className="py-3">{annotation.setup}</td>
                        <td className="py-3">{annotation.quality}</td>
                        <td className="py-3 text-slate-400">{annotation.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-sm text-slate-500">
              {t.backtest.noTrades}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-panel/80 p-5">
            <div className="flex items-center gap-2 text-cyan">
              <Radar className="h-4 w-4" aria-hidden="true" />
              <h2 className="text-base font-semibold text-white">{t.backtest.confidencePanel}</h2>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">{t.common.confidence}</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {result.sharpeRatio >= 1.4 ? t.common.strong : result.sharpeRatio >= 0.8 ? t.common.balanced : t.common.cautious}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">{t.common.signalEngine}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{t.backtest.strategyExplainer}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber/20 bg-amber/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-white">{t.backtest.assumptions}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{t.backtest.assumptionsBody}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  <li>{t.backtest.assumption1}</li>
                  <li>{t.backtest.assumption2}</li>
                  <li>{t.backtest.assumption3}</li>
                  <li>{t.backtest.assumption4}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
