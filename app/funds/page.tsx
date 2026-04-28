import { PieChart, ShieldCheck } from "lucide-react";
import { SummaryCard } from "@/components/summary-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatRatioPercent, formatScore } from "@/lib/format";
import { getResearchWorkspace } from "@/lib/research/workspace";

export default async function FundsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const workspace = await getResearchWorkspace();

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber/25 bg-amber/10 px-3 py-1 text-sm text-amber">
          <PieChart className="h-4 w-4" />
          {t.funds.eyebrow}
        </div>
        <h1 className="mt-4 page-title">{t.funds.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{t.funds.description}</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {workspace.funds.map((fund) => (
          <article key={fund.slug} className="surface flex flex-col overflow-hidden shadow-2xl transition-all hover:border-white/20">
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan">{fund.name}</h2>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{fund.description}</p>
                </div>
                <span className="rounded bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{fund.style}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="surface-muted p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.funds.topSector}</p>
                  <p className="mt-1.5 font-bold text-white">{fund.topSector}</p>
                </div>
                <div className="surface-muted p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.funds.themeOverlap}</p>
                  <p className="mt-1.5 font-number font-bold text-cyan">{formatRatioPercent(fund.trackedThemeOverlap.reduce((sum, item) => sum + item.weight, 0))}</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.funds.themeExposure}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {fund.themeExposure.slice(0, 4).map((item) => (
                      <span key={item.slug} className="rounded border border-cyan/20 bg-cyan/5 px-2 py-0.5 text-[10px] font-bold text-cyan">
                        {item.name} {formatRatioPercent(item.weight)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.funds.styleExposure}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {fund.styleExposure.slice(0, 4).map((item) => (
                      <span key={item.name} className="rounded border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] font-bold text-slate-400">
                        {item.name} {formatRatioPercent(item.weight)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="surface-muted p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.funds.qualityScore}</p>
                    <p className="mt-1.5 font-number text-xl font-bold text-mint">{formatScore(fund.averageQualityScore)}</p>
                  </div>
                  <div className="surface-muted p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.funds.momentumScore}</p>
                    <p className="mt-1.5 font-number text-xl font-bold text-amber">{formatScore(fund.averageMomentumScore)}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="surface p-5">
        <div className="flex items-center gap-2 text-cyan">
          <ShieldCheck className="h-4 w-4" />
          <h2 className="text-base font-semibold text-white">{t.funds.architectureTitle}</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-300">{t.funds.architectureBody}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li>{t.funds.architecture1}</li>
          <li>{t.funds.architecture2}</li>
          <li>{t.funds.architecture3}</li>
        </ul>
      </section>

      <SummaryCard
        locale={locale}
        summary={{
          marketNarrative: "基金透视回答的是资金真正配了什么，而不是名称上写了什么。",
          driverNarrative: "若主题暴露高、质量分偏低、动量过热，通常更像进攻型配置；若电力和高股息权重高，则更偏防御。",
          supportingEvidence: [
            `当前示例篮子里，对跟踪主题重合度最高的是 ${workspace.funds[0]?.name ?? "-"}`,
            "模块把主题、行业、风格拆开展示，避免单一标签误导。",
            "未来接入公募披露时，只需替换 holdings 数据源。"
          ],
          risks: [
            "当前基金仍是研究篮子，不是公募真实持仓。",
            "真实基金持仓存在披露时滞，后续需要补充披露日期和来源。",
            "仅用于研究支持，不构成投资建议。"
          ],
          sources: ["themeRules", "marketData", "aiSynthesis"]
        }}
      />
    </div>
  );
}
