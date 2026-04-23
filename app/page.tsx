import Link from "next/link";
import { Activity, ArrowUpRight, Database, ShieldAlert } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { RefreshButton } from "@/components/refresh-button";
import { SummaryCard } from "@/components/summary-card";
import { ThemeScoreCard } from "@/components/theme-score-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatRatioPercent, formatScore } from "@/lib/format";
import { getResearchWorkspace } from "@/lib/research/workspace";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const workspace = await getResearchWorkspace();
  const todayBoard = workspace.marketLeadership.find((board) => board.key === "today")!;
  const fiveDayBoard = workspace.marketLeadership.find((board) => board.key === "fiveDay")!;
  const twentyDayBoard = workspace.marketLeadership.find((board) => board.key === "twentyDay")!;
  const leadTheme = todayBoard.themes[0];

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
            <MetricCard label={t.marketLeadership.today} value={leadTheme?.name ?? "-"} detail={leadTheme ? formatScore(leadTheme.leadership.today.heat) : undefined} tone="positive" />
            <MetricCard label={t.marketLeadership.fiveDay} value={fiveDayBoard.themes[0]?.name ?? "-"} detail={fiveDayBoard.themes[0] ? formatScore(fiveDayBoard.themes[0].leadership.fiveDay.heat) : undefined} />
            <MetricCard label={t.marketLeadership.twentyDay} value={twentyDayBoard.themes[0]?.name ?? "-"} detail={twentyDayBoard.themes[0] ? formatScore(twentyDayBoard.themes[0].leadership.twentyDay.heat) : undefined} />
            <MetricCard label={t.marketLeadership.breadth} value={leadTheme ? formatRatioPercent(leadTheme.leadership.today.breadth) : "-"} detail={leadTheme?.leadership.today.participationLabel} />
            <MetricCard label={t.marketLeadership.concentration} value={leadTheme ? formatRatioPercent(leadTheme.leadership.today.leaderConcentration) : "-"} detail={workspace.providerStatus.current} />
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
                <p className="mt-2 text-lg font-semibold text-white">{workspace.providerStatus.current}</p>
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

      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">{t.marketLeadership.boardTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.marketLeadership.boardBody}</p>
          </div>
          <Link href="/themes" className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white">
            {t.nav.themes}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="terminal-table w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr>
                <th>主题</th>
                <th>{t.marketLeadership.today}</th>
                <th>{t.marketLeadership.fiveDay}</th>
                <th>{t.marketLeadership.twentyDay}</th>
                <th>{t.marketLeadership.breadth}</th>
                <th>{t.marketLeadership.turnover}</th>
                <th>{t.marketLeadership.concentration}</th>
                <th>参与方式</th>
              </tr>
            </thead>
            <tbody>
              {todayBoard.themes.map((theme) => (
                <tr key={theme.slug}>
                  <td>
                    <Link href={`/themes/${theme.slug}`} className="font-medium text-white hover:text-cyan">
                      {theme.name}
                    </Link>
                  </td>
                  <td>{formatScore(theme.leadership.today.heat)}</td>
                  <td>{formatScore(theme.leadership.fiveDay.heat)}</td>
                  <td>{formatScore(theme.leadership.twentyDay.heat)}</td>
                  <td>{formatRatioPercent(theme.leadership.today.breadth)}</td>
                  <td>{formatRatioPercent(theme.avgTurnoverDelta)}</td>
                  <td>{formatRatioPercent(theme.leadership.today.leaderConcentration)}</td>
                  <td>{theme.leadership.today.participationLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {workspace.themes.slice(0, 4).map((theme) => (
          <ThemeScoreCard key={theme.slug} theme={theme} locale={locale} />
        ))}
      </section>

      <SummaryCard locale={locale} summary={workspace.marketSummary} />
    </div>
  );
}
