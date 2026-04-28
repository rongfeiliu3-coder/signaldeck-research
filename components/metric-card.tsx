import { cn } from "@/lib/utils";

type Tone = "positive" | "negative" | "neutral";

const toneClass: Record<Tone, string> = {
  positive: "text-mint",
  negative: "text-rose",
  neutral: "text-white"
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
}) {
  return (
    <div className="surface-muted p-3.5">
      <p className="metric-label">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <p className={cn("metric-value", toneClass[tone])}>{value}</p>
      </div>
      {detail ? <p className="mt-0.5 text-[11px] font-medium text-slate-500">{detail}</p> : null}
    </div>
  );
}
