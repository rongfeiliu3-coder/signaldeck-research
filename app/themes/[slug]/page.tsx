import Link from "next/link";
import { ArrowLeft, FileSliders, Radar, TrendingUp } from "lucide-react";
import { PriceChart } from "@/components/price-chart";
import { SummaryCard } from "@/components/summary-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getResearchWorkspace } from "@/lib/research/workspace";
import { formatRatioPercent, formatScore } from "@/lib/format";
import { getMarketSessionLabel } from "@/lib/market-session";

function rallyTypeLabel(rallyType: "leader-driven" | "broad-participation" | "mixed") {
  if (rallyType === "leader-driven") return "龙头驱动";
  if (rallyType === "broad-participation") return "广泛参与";
  return "分化轮动";
}

function narrativeLabel(narrativeType: "policy-driven" | "sentiment-driven" | "earnings-driven" | "mixed") {
  if (narrativeType === "policy-driven") return "政策驱动";
  if (narrativeType === "sentiment-driven") return "情绪驱动";
  if (narrativeType === "earnings-driven") return "业绩驱动";
  return "混合驱动";
}

function styleLabel(stabilityStyle: "defensive" | "cyclical" | "balanced") {
  if (stabilityStyle === "defensive") return "偏防御";
  if (stabilityStyle === "cyclical") return "偏周期";
  return "攻守均衡";
}

export default async function ThemeDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { slug } = await params;
  const workspace = await getResearchWorkspace();
  const theme = workspace.themes.find((item) => item.slug === slug);
  const sessionLabel = getMarketSessionLabel(workspace.asOfDate);

  if (!theme) {
    return <div className="empty-state">{t.notFound.body}</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/themes" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        {t.common.backToThemes}
      </Link>

      <section className="surface-strong p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-heading">{t.themeResearch.curatedBasket}</p>
            <h1 className="mt-2 page-title">{theme.name}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">{theme.description}</p>
            <p className="mt-3 text-sm text-slate-500">{theme.focus}</p>
          </div>
          <div className="surface-muted px-4 py-3 text-sm text-slate-300">
            <p className="flex items-center gap-2 text-slate-400">
              <FileSliders className="h-4 w-4" />
              {t.themeResearch.configFile}
            </p>
            <p className="mt-2">`config/theme-baskets.json`</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{sessionLabel}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatScore(theme.leadership.today.heat)}</p>
          <p className="mt-2 text-sm text-slate-400">{rallyTypeLabel(theme.leadership.today.rallyType)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{t.themeResearch.breadth}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatRatioPercent(theme.internalBreadth)}</p>
          <p className="mt-2 text-sm text-slate-400">{t.themeResearch.positiveMembers(theme.positiveCount, theme.memberCount)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{t.marketLeadership.concentration}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatRatioPercent(theme.leadership.today.topFiveContribution)}</p>
          <p className="mt-2 text-sm text-slate-400">{theme.leadership.today.participationLabel}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs text-slate-500">{t.themeResearch.fundamentalQuality}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatScore(theme.fundamentalSnapshot.averageQualityScore)}</p>
          <p className="mt-2 text-sm text-slate-400">{`${styleLabel(theme.diagnostics.stabilityStyle)} | 股息代理 ${(theme.diagnostics.dividendProxy * 100).toFixed(1)}%`}</p>
        </div>
      </section>

      <PriceChart
        data={theme.topLeaders[0]?.history ?? []}
        title={`${theme.name} · ${t.themeResearch.leaderTrend}`}
        summary={t.themeResearch.chartBody}
        valueLabel={t.themeResearch.latestLeaderPrice}
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface p-5">
          <div className="flex items-center gap-2 text-cyan">
            <TrendingUp className="h-4 w-4" />
            <h2 className="text-base font-semibold text-white">{t.themeResearch.leaderStocks}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {theme.topLeaders.map((stock) => (
              <div key={stock.symbol} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/symbols/${encodeURIComponent(stock.symbol)}`} className="text-lg font-semibold text-white hover:text-cyan">
                      {stock.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{stock.symbol} · {stock.industry}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{formatScore(stock.momentumScore ?? 0)}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">{sessionLabel}</p>
                    <p className="mt-1 font-semibold text-white">{formatRatioPercent(stock.return1d)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t.marketLeadership.fiveDay}</p>
                    <p className="mt-1 font-semibold text-white">{formatRatioPercent(stock.return5d)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t.marketLeadership.twentyDay}</p>
                    <p className="mt-1 font-semibold text-white">{formatRatioPercent(stock.return20d)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t.fundamentals.qualityScore}</p>
                    <p className="mt-1 font-semibold text-white">{formatScore(stock.qualityScore ?? 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <section className="surface p-5">
            <div className="flex items-center gap-2 text-cyan">
              <Radar className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">{t.themeResearch.evidencePanel}</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">{t.themeResearch.narrativeTag(narrativeLabel(theme.diagnostics.narrativeType))}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{t.themeResearch.styleProfile(`${styleLabel(theme.diagnostics.stabilityStyle)} / ${theme.diagnostics.characteristicLabel}`)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{t.themeResearch.dividendProxy(theme.diagnostics.dividendProxy)}</p>
              </div>
              {theme.evidence.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="text-base font-semibold text-white">{t.themeResearch.constituents}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {theme.constituents.map((stock) => (
                <span key={stock.symbol} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {stock.name}
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SummaryCard locale={locale} summary={theme.summary} />
    </div>
  );
}
