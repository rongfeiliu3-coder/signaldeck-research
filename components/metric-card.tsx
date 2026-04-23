import { cn } from "@/lib/utils";

type Tone = "positive" | "negative" | "neutral";

const toneClass: Record<Tone, string> = {
  positive: "text-mint",
  negative: "text-rose",
  neutral: "text-slate-100"
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-slate-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-normal", toneClass[tone])}>{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
