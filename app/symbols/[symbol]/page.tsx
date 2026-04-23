import Link from "next/link";
import { ArrowLeft, Building2, Layers3 } from "lucide-react";
import { PriceChart } from "@/components/price-chart";
import { SummaryCard } from "@/components/summary-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatCurrency, formatLargeNumber, formatRatioPercent, formatScore } from "@/lib/format";
import { getResearchWorkspace } from "@/lib/research/workspace";

export default async function SymbolDetailPage({
  params
}: {
  params: Promise<{ symbol: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { symbol } = await params;
  const decoded = decodeURIComponent(symbol);
  const workspace = await getResearchWorkspace();
  const stock = workspace.fundamentals.stocks.find((item) => item.symbol === decoded);

  if (!stock) {
    return <div className="empty-state">{t.notFound.body}</div>;
  }

  const themeNames = workspace.themes
    .filter((theme) => stock.themeTags.includes(theme.slug))
    .map((theme) => theme.name);

  return (
    <div className="space-y-6">
      <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        {t.notFound.action}
      </Link>

      <section className="surface-strong p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-heading">{stock.sector}</p>
            <h1 className="mt-2 page-title">{stock.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{stock.symbol} · {stock.industry}</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">{stock.description}</p>
          </div>
          <div className="surface-muted px-4 py-3 text-sm text-slate-300">
            <p className="text-xs text-slate-500">{t.symbol.marketCap}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatLargeNumber(stock.marketCapCnyBn * 1000000000)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="surface p-5">
          <p className="text-xs text-slate-500">Price</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(stock.price)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{t.symbol.qualityScore}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatScore(stock.qualityScore ?? 0)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{t.symbol.momentumScore}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatScore(stock.momentumScore ?? 0)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{t.symbol.turnoverRate}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatRatioPercent(stock.turnoverRate)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{t.symbol.recentPerformance}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatRatioPercent(stock.return20d)}</p>
        </div>
      </section>

      <PriceChart data={stock.history} title={`${stock.name} · ${t.symbol.titleSuffix}`} summary={t.symbol.recentBody} />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface p-5">
          <div className="flex items-center gap-2 text-cyan">
            <Building2 className="h-4 w-4" />
            <h2 className="text-base font-semibold text-white">{t.fundamentals.title}</h2>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="terminal-table w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr>
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
                <tr>
                  <td>{formatRatioPercent(stock.fundamentals.revenueGrowth)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.netProfitGrowth)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.roe)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.grossMargin)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.debtRatio)}</td>
                  <td>{formatLargeNumber(stock.fundamentals.operatingCashFlow)}</td>
                  <td>{formatRatioPercent(stock.fundamentals.dividendYield)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <section className="surface p-5">
            <div className="flex items-center gap-2 text-cyan">
              <Layers3 className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">{t.symbol.themeMembership}</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {themeNames.map((name) => (
                <span key={name} className="rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                  {name}
                </span>
              ))}
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="text-base font-semibold text-white">{t.fundamentals.qualityScore}</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {stock.fundamentalsBreakdown?.components.map((component) => (
                <div key={component.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <span>{component.label}</span>
                  <span className="text-slate-400">{Math.round(component.weight * 100)}% / {formatScore(component.score)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SummaryCard
        locale={locale}
        summary={{
          marketNarrative: `${stock.name} 当前归属于 ${themeNames.join("、")} 等研究主题，更适合放在主题和质量框架里一起看。`,
          driverNarrative: (stock.momentumScore ?? 0) > (stock.qualityScore ?? 0) ? "短线价格强于质量分，更像资金先行。" : "质量分不低，走势更容易获得基本面支撑。",
          supportingEvidence: [
            `20日表现 ${formatRatioPercent(stock.return20d)}，换手率 ${formatRatioPercent(stock.turnoverRate)}。`,
            `质量分 ${formatScore(stock.qualityScore ?? 0)}，动量分 ${formatScore(stock.momentumScore ?? 0)}。`,
            `营收增长 ${formatRatioPercent(stock.fundamentals.revenueGrowth)}，ROE ${formatRatioPercent(stock.fundamentals.roe)}。`
          ],
          risks: [
            "单只个股结论仍需结合所属主题的扩散和强度一起看。",
            "财务口径会随真实数据源接入继续校验和修正。",
            "仅用于研究支持，不构成投资建议。"
          ],
          sources: ["marketData", "financialData", "themeRules", "aiSynthesis"]
        }}
      />
    </div>
  );
}
