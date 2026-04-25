import Link from "next/link";
import { ClipboardList, FolderKanban, PlusCircle, Trophy } from "lucide-react";
import themeBasketPresets from "@/config/theme-basket-presets.json";
import { ThemeScoreCard } from "@/components/theme-score-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatRatioPercent, formatScore } from "@/lib/format";
import { getMarketSessionLabel } from "@/lib/market-session";
import { getResearchWorkspace } from "@/lib/research/workspace";

export default async function ThemesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const workspace = await getResearchWorkspace();
  const sessionLabel = getMarketSessionLabel(workspace.asOfDate);
  const topThemes = workspace.marketLeadership.find((board) => board.key === "today")?.themes.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-sm text-cyan">
          <FolderKanban className="h-4 w-4" />
          {t.themeResearch.eyebrow}
        </div>
        <h1 className="mt-4 page-title">{t.themeResearch.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{t.themeResearch.description}</p>
        <p className="mt-3 text-sm text-slate-500">{t.themeResearch.configHint}</p>
      </section>

      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-cyan">
              <Trophy className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">市场前 5 主题篮子</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">按 {sessionLabel} 热度排序，同时看广度与龙头集中度，避免只看单一涨幅。</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">数据日 {workspace.asOfDate}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="terminal-table w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr>
                <th>排名</th>
                <th>主题篮子</th>
                <th>{sessionLabel}</th>
                <th>5日</th>
                <th>20日</th>
                <th>内部广度</th>
                <th>前五贡献</th>
                <th>结构判断</th>
              </tr>
            </thead>
            <tbody>
              {topThemes.map((theme, index) => (
                <tr key={theme.slug}>
                  <td className="text-slate-400">#{index + 1}</td>
                  <td>
                    <Link href={`/themes/${theme.slug}`} className="font-medium text-white hover:text-cyan">
                      {theme.name}
                    </Link>
                  </td>
                  <td>{formatScore(theme.leadership.today.heat)}</td>
                  <td>{formatScore(theme.leadership.fiveDay.heat)}</td>
                  <td>{formatScore(theme.leadership.twentyDay.heat)}</td>
                  <td>{formatRatioPercent(theme.internalBreadth)}</td>
                  <td>{formatRatioPercent(theme.leadership.today.topFiveContribution)}</td>
                  <td>{theme.leadership.today.participationLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface p-5">
        <div className="flex items-center gap-2 text-cyan">
          <PlusCircle className="h-4 w-4" />
          <h2 className="text-base font-semibold text-white">可添加主题篮子模板</h2>
        </div>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          下面是候选模板，不会默认进入 Render 扫描，避免免费实例压力过大。需要启用时，把对应 JSON 复制到 <span className="text-slate-200">config/theme-baskets.json</span>，并控制总股票数在 Render 限制内。
        </p>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {themeBasketPresets.map((preset) => (
            <div key={preset.slug} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{preset.slug}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{preset.nameZh}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{preset.descriptionZh}</p>
                </div>
                <ClipboardList className="h-4 w-4 shrink-0 text-slate-500" />
              </div>
              <p className="mt-3 text-xs text-slate-500">代码：{preset.symbols.join(" / ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {workspace.themes.map((theme) => (
          <ThemeScoreCard key={theme.slug} theme={theme} locale={locale} sessionLabel={sessionLabel} />
        ))}
      </section>
    </div>
  );
}
