import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { Locale, getDictionary } from "@/lib/i18n";
import { formatPercent, formatRatioPercent, formatScore } from "@/lib/format";
import { ThemeSnapshot } from "@/lib/types";

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
        <MetricCard label={t.marketLeadership.today} value={formatScore(theme.leadership.today.heat)} detail={theme.leadership.today.participationLabel} tone={heatTone} />
        <MetricCard label={t.themeResearch.breadth} value={formatRatioPercent(theme.internalBreadth)} detail={t.themeResearch.positiveMembers(theme.positiveCount, theme.memberCount)} tone={theme.internalBreadth >= 0.6 ? "positive" : "neutral"} />
        <MetricCard label={t.themeResearch.turnoverChange} value={formatPercent(theme.avgTurnoverDelta * 100)} detail={t.themeResearch.activityClue} tone={theme.avgTurnoverDelta >= 0 ? "positive" : "negative"} />
        <MetricCard label={t.themeResearch.fundamentalQuality} value={formatScore(theme.fundamentalSnapshot.averageQualityScore)} detail={t.themeResearch.marketMomentumScore(theme.fundamentalSnapshot.averageMomentumScore)} />
      </div>
    </article>
  );
}
