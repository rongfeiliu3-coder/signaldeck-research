import { AlertTriangle, BadgeInfo, BrainCircuit, SearchCheck } from "lucide-react";
import { EvidencePill } from "@/components/evidence-pill";
import { Locale, getDictionary } from "@/lib/i18n";
import { RationalSummary } from "@/lib/types";

const icons = {
  market: BadgeInfo,
  style: BrainCircuit,
  evidence: SearchCheck,
  risk: AlertTriangle
};

export function SummaryCard({
  summary,
  locale,
  title
}: {
  summary: RationalSummary;
  locale: Locale;
  title?: string;
}) {
  const t = getDictionary(locale);

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{title ?? t.common.rationalSummary}</h2>
        <div className="flex flex-wrap gap-2">
          {summary.sources.map((source) => (
            <EvidencePill key={source} source={source} locale={locale} />
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          { key: "market" as const, label: t.summary.marketQuestion, value: summary.marketNarrative },
          { key: "style" as const, label: t.summary.driverQuestion, value: summary.driverNarrative },
          { key: "evidence" as const, label: t.summary.evidenceQuestion, value: summary.supportingEvidence.join("；") },
          { key: "risk" as const, label: t.summary.riskQuestion, value: summary.risks.join("；") }
        ].map((item) => {
          const Icon = icons[item.key];
          return (
            <div key={item.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
