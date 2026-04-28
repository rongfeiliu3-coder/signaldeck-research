import { BarChart3, SlidersHorizontal } from "lucide-react";
import { SummaryCard } from "@/components/summary-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatLargeNumber, formatRatioPercent, formatScore } from "@/lib/format";
import { getResearchWorkspace } from "@/lib/research/workspace";

export default async function FundamentalsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const workspace = await getResearchWorkspace();
  const topStocks = workspace.fundamentals.stocks.slice(0, 12);

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
          <BarChart3 className="h-4 w-4" />
          {t.fundamentals.eyebrow}
        </div>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="page-title">{t.fundamentals.title}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">{t.fundamentals.description}</p>
          </div>
          <div className="surface-muted px-4 py-3 text-sm text-slate-300">
            <p className="flex items-center gap-2 text-slate-400">
              <SlidersHorizontal className="h-4 w-4" />
              {t.fundamentals.transparency}
            </p>
            <p className="mt-2">{t.fundamentals.weightHint}</p>
          </div>
        </div>
      </section>

      <section className="surface p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white">{t.fundamentals.methodTitle}</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.fundamentals.methodBody}</p>
          </div>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/[0.02]">config/fundamental-scoring.json</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {Object.entries(workspace.fundamentals.scoringMethod.weights).map(([key, weight]) => (
            <div key={key} className="surface-muted p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{key}</p>
              <p className="mt-1.5 font-number text-xl font-bold text-white">{Math.round(weight * 100)}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden shadow-2xl">
        <div className="border-b border-white/[0.08] bg-white/[0.02] px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white">{t.fundamentals.tableTitle}</h2>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.fundamentals.tableBody}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="terminal-table w-full min-w-[1200px] text-left">
            <thead>
              <tr>
                <th className="w-[180px]">{t.fundamentals.stock}</th>
                <th className="text-right">{t.fundamentals.qualityScore}</th>
                <th className="text-right">{t.fundamentals.momentumScore}</th>
                <th className="text-right">{t.fundamentals.revenueGrowth}</th>
                <th className="text-right">{t.fundamentals.netProfitGrowth}</th>
                <th className="text-right">ROE</th>
                <th className="text-right">{t.fundamentals.grossMargin}</th>
                <th className="text-right">{t.fundamentals.debtRatio}</th>
                <th className="text-right">{t.fundamentals.operatingCashFlow}</th>
                <th className="text-right">{t.fundamentals.dividendYield}</th>
              </tr>
            </thead>
            <tbody>
              {topStocks.map((stock) => (
                <tr key={stock.symbol} className="group">
                  <td>
                    <div className="!font-sans font-bold text-white group-hover:text-cyan">{stock.name}</div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400">{stock.symbol} · {stock.sector}</div>
                  </td>
                  <td className="text-right font-bold text-mint">{formatScore(stock.qualityScore ?? 0)}</td>
                  <td className="text-right font-bold text-amber">{formatScore(stock.momentumScore ?? 0)}</td>
                  <td className="text-right">{formatRatioPercent(stock.fundamentals.revenueGrowth)}</td>
                  <td className="text-right">{formatRatioPercent(stock.fundamentals.netProfitGrowth)}</td>
                  <td className="text-right">{formatRatioPercent(stock.fundamentals.roe)}</td>
                  <td className="text-right">{formatRatioPercent(stock.fundamentals.grossMargin)}</td>
                  <td className="text-right">{formatRatioPercent(stock.fundamentals.debtRatio)}</td>
                  <td className="text-right">{formatLargeNumber(stock.fundamentals.operatingCashFlow)}</td>
                  <td className="text-right font-bold text-mint">{formatRatioPercent(stock.fundamentals.dividendYield)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SummaryCard
        locale={locale}
        summary={{
          marketNarrative: "本页把基本面质量和市场动量拆开看，避免把短线强势误读成经营质量。",
          driverNarrative: "高分样本里，电力/高股息偏现金流与分红，算力/成长链偏景气和弹性。",
          supportingEvidence: [
            `当前质量分居前的是 ${topStocks[0]?.name ?? "-"}，质量分 ${topStocks[0]?.qualityScore?.toFixed(1) ?? "0.0"}。`,
            "质量分和动量分并列展示，便于区分基本面改善和价格驱动。",
            "评分权重来自配置文件，可按研究框架继续调整。"
          ],
          risks: [
            "财务字段仍会受数据源口径影响，跨行业比较要留意差异。",
            "银行、公用事业等行业的负债率和毛利率不能直接横向套用。",
            "仅用于研究支持，不构成投资建议。"
          ],
          sources: ["financialData", "marketData", "themeRules", "aiSynthesis"]
        }}
      />
    </div>
  );
}
