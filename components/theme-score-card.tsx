import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { Locale, getDictionary } from "@/lib/i18n";
import { formatPercent, formatRatioPercent, formatScore } from "@/lib/format";
import { ThemeSnapshot } from "@/lib/types";

function rallyTypeLabel(theme: ThemeSnapshot) {
  if (theme.leadership.today.rallyType === "leader-driven") return "龙头驱动";
  if (theme.leadership.today.rallyType === "broad-participation") return "广泛参与";
  return "分化轮动";
}

export function ThemeScoreCard({
  theme,
  locale
}: {
  theme: ThemeSnapshot;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const heatTone = theme.leadership.today.heat >= 70 ? "positive" : theme.leadership.today.heat >= 52 ? "neutral" : "negative";

  return (
    <article className="surface p-5 transition hover:border-white/20 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-heading">{t.themeResearch.curatedBasket}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{theme.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{theme.description}</p>
        </div>
        <Link
          href={`/themes/${theme.slug}`}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label={`Open ${theme.slug}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t.marketLeadership.today} value={formatScore(theme.leadership.today.heat)} detail={rallyTypeLabel(theme)} tone={heatTone} />
        <MetricCard
          label={t.themeResearch.breadth}
          value={formatRatioPercent(theme.internalBreadth)}
          detail={t.themeResearch.positiveMembers(theme.positiveCount, theme.memberCount)}
          tone={theme.internalBreadth >= 0.6 ? "positive" : "neutral"}
        />
        <MetricCard
          label={t.marketLeadership.concentration}
          value={formatRatioPercent(theme.leadership.today.topFiveContribution)}
          detail={theme.leadership.today.participationLabel}
          tone={theme.leadership.today.topFiveContribution >= 0.8 ? "negative" : "neutral"}
        />
        <MetricCard
          label={t.themeResearch.fundamentalQuality}
          value={formatScore(theme.fundamentalSnapshot.averageQualityScore)}
          detail={`${theme.diagnostics.characteristicLabel} | ${formatPercent(theme.diagnostics.dividendProxy * 100)}`}
        />
      </div>
    </article>
  );
}
