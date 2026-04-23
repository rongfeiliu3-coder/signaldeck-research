import { getDictionary, Locale } from "@/lib/i18n";
import { EvidenceSource } from "@/lib/types";

const sourceTone: Record<EvidenceSource, string> = {
  marketData: "border-cyan/30 bg-cyan/10 text-cyan",
  financialData: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  themeRules: "border-amber/30 bg-amber/10 text-amber",
  aiSynthesis: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200"
};

export function EvidencePill({
  source,
  locale
}: {
  source: EvidenceSource;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${sourceTone[source]}`}>
      {t.evidenceSources[source]}
    </span>
  );
}
