import { Zap, Shield, ArrowUpRight, TrendingUp, BarChart, Target, AlertCircle } from "lucide-react";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { getResearchWorkspace } from "@/lib/research/workspace";
import { StrategyId } from "@/lib/types";

function StrategyIcon({ id }: { id: StrategyId }) {
  switch (id) {
    case "high-dividend": return <Shield className="h-5 w-5 text-mint" />;
    case "theme-rotation": return <TrendingUp className="h-5 w-5 text-cyan" />;
    case "low-level-reversal": return <ArrowUpRight className="h-5 w-5 text-amber" />;
    case "short-term-sentiment": return <Zap className="h-5 w-5 text-rose" />;
    case "fundamental-quality": return <Target className="h-5 w-5 text-indigo-400" />;
    case "fund-exposure": return <BarChart className="h-5 w-5 text-slate-400" />;
    default: return <Zap className="h-5 w-5 text-slate-400" />;
  }
}

function riskColor(risk: string) {
  if (risk.includes("低")) return "text-mint border-mint/20 bg-mint/5";
  if (risk.includes("高")) return "text-rose border-rose/20 bg-rose/5";
  return "text-amber border-amber/20 bg-amber/5";
}

export default async function StrategiesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const workspace = await getResearchWorkspace();
  const strategies = workspace.strategies;

  return (
    <div className="space-y-8">
      <section className="surface-strong p-6">
        <div className="eyebrow border-cyan/25 bg-cyan/10 text-cyan">
          <Zap className="h-4 w-4" />
          {t.strategies.eyebrow}
        </div>
        <h1 className="page-title mt-4">{t.strategies.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          {t.strategies.description}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="surface flex flex-col overflow-hidden transition-all hover:border-white/20">
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <StrategyIcon id={strategy.id} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{locale === "zh" ? strategy.nameZh : strategy.nameEn}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {t.strategies.suitableHorizon}: {locale === "zh" ? strategy.horizonZh : strategy.horizonEn}
                      </span>
                      <span className="h-3 w-px bg-white/10" />
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${riskColor(locale === "zh" ? strategy.riskZh : strategy.riskEn)}`}>
                        {locale === "zh" ? strategy.riskZh : strategy.riskEn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{t.strategies.scoring}</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {strategy.scoringDimensions.map((dim) => (
                      <span key={dim} className="rounded border border-white/5 bg-white/[0.02] px-2 py-1 text-[11px] text-slate-300">
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{t.strategies.whySelected}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {locale === "zh" ? strategy.whySelectedZh : strategy.whySelectedEn}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{t.strategies.candidates}</h4>
                  <div className="mt-2 overflow-hidden rounded-lg border border-white/5 bg-black/20">
                    <table className="terminal-table w-full text-left text-xs">
                      <thead>
                        <tr>
                          <th className="px-3 py-2">代码/名称</th>
                          <th className="px-3 py-2 text-right">入选原因</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {strategy.candidates.map((cand) => (
                          <tr key={cand.symbol} className="hover:bg-white/[0.02]">
                            <td className="px-3 py-2.5">
                              <span className="block font-bold text-white">{cand.name}</span>
                              <span className="text-[10px] text-slate-500">{cand.symbol}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-300">
                              {cand.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-rose/10 bg-rose/5 p-3">
                  <div className="flex items-start gap-2 text-rose">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.15em]">{t.strategies.invalidation}</h4>
                      <p className="mt-1 text-xs text-rose/80 leading-5">
                        {locale === "zh" ? strategy.invalidationZh : strategy.invalidationEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
