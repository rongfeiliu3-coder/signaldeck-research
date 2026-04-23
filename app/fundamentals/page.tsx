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

      <section className="surface p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">{t.fundamentals.methodTitle}</h2>
            <p className="mt-2 text-sm text-slate-400">{t.fundamentals.methodBody}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">`config/fundamental-scoring.json`</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(workspace.fundamentals.scoringMethod.weights).map(([key, weight]) => (
            <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{key}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{Math.round(weight * 100)}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">{t.fundamentals.tableTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.fundamentals.tableBody}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="terminal-table w-full min-w-[1200px] text-left text-sm">
            <thead>
              <tr>
                <th>{t.fundamentals.stock}</th>
                <th>{t.fundamentals.qualityScore}</th>
                <th>{t.fundamentals.momentumScore}</th>
                <th>{t.fundamentals.revenueGrowth}</th>
                <th>{t.fundamentals.netProfitGrowth}</th>
                <th>ROE</th>
                <th>{t.fundamentals.grossMargin}</th>
                <th>{t.fundamentals.debtRatio}</th>
                <th>{t.fundamentals.operatingCashFlow}</th>
                <th>{t.fundamentals.dividendYield}</th>
              </tr>
            </thead>
            <tbody>
              {topStocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <div className="font-medium text-white">{stock.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{stock.symbol} · {stock.sector}</div>
                  </td>
                  <td>{formatScore(stock.qualityScore ?? 0)}</td>
                  <td>{formatScore(stock.momentumScore ?? 0)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.revenueGrowth)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.netProfitGrowth)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.roe)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.grossMargin)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.debtRatio)}</td>
                  <td>{formatLargeNumber(stock.fundamentals.operatingCashFlow)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.dividendYield)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SummaryCard
        locale={locale}
        summary={{
          marketNarrative: "本页把基本面质量与市场动量拆开展示，避免把短线热度误读成经营质量。",
          driverNarrative: "当前高分样本中，公用事业与算力两端同时存在，但驱动逻辑并不相同：前者偏现金流与分红，后者偏景气与成长。",
          supportingEvidence: [
            `质量分榜首为 ${topStocks[0]?.name ?? "-"}，质量分 ${topStocks[0]?.qualityScore?.toFixed(1) ?? "0.0"}。`,
            "动量分和质量分并列展示，避免只看价格强弱。",
            "评分权重来自配置文件，可按个人研究习惯调整。"
          ],
          risks: [
            "财务字段仍可能因数据源差异而存在口径偏差。",
            "银行等行业的毛利率、负债率解释需要结合行业特性。",
            "仅用于研究支持，不构成投资建议。"
          ],
          sources: ["financialData", "marketData", "themeRules", "aiSynthesis"]
        }}
      />
    </div>
  );
}
