import Link from "next/link";
import { Activity, Database, ShieldAlert, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/metric-card";
import { RefreshButton } from "@/components/refresh-button";
import { SummaryCard } from "@/components/summary-card";
import { ThemeScoreCard } from "@/components/theme-score-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatRatioPercent, formatScore } from "@/lib/format";
import { getMarketSessionLabel } from "@/lib/market-session";
import { getResearchWorkspace } from "@/lib/research/workspace";

function rallyTypeLabel(rallyType: "leader-driven" | "broad-participation" | "mixed") {
  if (rallyType === "leader-driven") return "龙头驱动";
  if (rallyType === "broad-participation") return "广泛参与";
  return "分化轮动";
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const workspace = await getResearchWorkspace();
  const todayBoard = workspace.marketLeadership.find((board) => board.key === "today")!;
  const fiveDayBoard = workspace.marketLeadership.find((board) => board.key === "fiveDay")!;
  const twentyDayBoard = workspace.marketLeadership.find((board) => board.key === "twentyDay")!;
  const leadTheme = todayBoard.themes[0];
  const sessionLabel = getMarketSessionLabel(workspace.asOfDate);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="surface-strong p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <div className="eyebrow border-cyan/25 bg-cyan/10 text-cyan">
                <Activity className="h-4 w-4" />
                {t.marketLeadership.eyebrow}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h1 className="page-title">{t.marketLeadership.title}</h1>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{t.common.defaultBadge}</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{t.marketLeadership.description}</p>
            </div>
            <RefreshButton locale={locale} />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label={sessionLabel} value={leadTheme?.name ?? "-"} detail={leadTheme ? formatScore(leadTheme.leadership.today.heat) : undefined} tone="positive" />
            <MetricCard label={t.marketLeadership.fiveDay} value={fiveDayBoard.themes[0]?.name ?? "-"} detail={fiveDayBoard.themes[0] ? formatScore(fiveDayBoard.themes[0].leadership.fiveDay.heat) : undefined} />
            <MetricCard label={t.marketLeadership.twentyDay} value={twentyDayBoard.themes[0]?.name ?? "-"} detail={twentyDayBoard.themes[0] ? formatScore(twentyDayBoard.themes[0].leadership.twentyDay.heat) : undefined} />
            <MetricCard
              label={t.marketLeadership.breadth}
              value={leadTheme ? formatRatioPercent(leadTheme.leadership.today.breadth) : "-"}
              detail={leadTheme ? rallyTypeLabel(leadTheme.leadership.today.rallyType) : undefined}
            />
            <MetricCard
              label={t.marketLeadership.concentration}
              value={leadTheme ? formatRatioPercent(leadTheme.leadership.today.topFiveContribution) : "-"}
              detail={leadTheme?.diagnostics.characteristicLabel}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="surface p-5">
            <div className="flex items-center gap-2 text-cyan">
              <Database className="h-4 w-4" />
              <p className="text-sm font-medium text-white">Data Status</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Provider</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {workspace.providerStatus.mode === "live" ? "Akshare Live" : "Mock Fallback"}
                </p>
                <p className="mt-1 text-xs text-slate-500">{workspace.providerStatus.current}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">As of</p>
                <p className="mt-2 text-lg font-semibold text-white">{workspace.asOfDate}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber/20 bg-amber/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-amber" />
              <div>
                <h2 className="text-base font-semibold text-white">{t.common.educationalDisclaimer}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{workspace.marketSummary.risks[2]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white">{t.marketLeadership.boardTitle}</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.marketLeadership.boardBody}</p>
          </div>
          <Link href="/themes" className="focus-ring flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
            {t.nav.themes}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="terminal-table w-full min-w-[1100px] text-left">
            <thead>
              <tr>
                <th className="w-[180px]">主题名称</th>
                <th className="text-right">{sessionLabel}</th>
                <th className="text-right">{t.marketLeadership.fiveDay}</th>
                <th className="text-right">{t.marketLeadership.twentyDay}</th>
                <th className="text-right">{t.marketLeadership.breadth}</th>
                <th className="text-right">{t.marketLeadership.turnover}</th>
                <th className="text-right">{t.marketLeadership.concentration}</th>
                <th className="text-center">{t.marketLeadership.rallyType}</th>
                <th className="pl-8">核心叙事逻辑</th>
              </tr>
            </thead>
            <tbody>
              {todayBoard.themes.map((theme) => (
                <tr key={theme.slug} className="group">
                  <td className="!font-sans font-bold text-white group-hover:text-cyan">
                    <Link href={`/themes/${theme.slug}`} className="block">
                      {theme.name}
                    </Link>
                  </td>
                  <td className="text-right font-bold text-cyan">{formatScore(theme.leadership.today.heat)}</td>
                  <td className="text-right">{formatScore(theme.leadership.fiveDay.heat)}</td>
                  <td className="text-right">{formatScore(theme.leadership.twentyDay.heat)}</td>
                  <td className="text-right">{formatRatioPercent(theme.leadership.today.breadth)}</td>
                  <td className="text-right">{formatRatioPercent(theme.avgTurnoverDelta)}</td>
                  <td className="text-right">{formatRatioPercent(theme.leadership.today.topFiveContribution)}</td>
                  <td className="text-center">
                    <span className={cn(
                      "inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      theme.leadership.today.rallyType === "broad-participation" ? "bg-mint/10 text-mint border border-mint/20" : 
                      theme.leadership.today.rallyType === "leader-driven" ? "bg-amber/10 text-amber border border-amber/20" : 
                      "bg-white/5 text-slate-400 border border-white/10"
                    )}>
                      {rallyTypeLabel(theme.leadership.today.rallyType)}
                    </span>
                  </td>
                  <td className="!font-sans pl-8 text-xs text-slate-400 line-clamp-1 group-hover:text-slate-300">
                    {theme.summary.marketNarrative}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {workspace.themes.slice(0, 4).map((theme) => (
          <ThemeScoreCard key={theme.slug} theme={theme} locale={locale} sessionLabel={sessionLabel} />
        ))}
      </section>

      <SummaryCard locale={locale} summary={workspace.marketSummary} />
    </div>
  );
}
