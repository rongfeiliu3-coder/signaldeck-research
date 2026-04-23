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

      <section className="grid gap-4 xl:grid-cols-3">
        {workspace.funds.map((fund) => (
          <article key={fund.slug} className="surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{fund.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{fund.description}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{fund.style}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">{t.funds.topSector}</p>
                <p className="mt-2 text-lg font-semibold text-white">{fund.topSector}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">{t.funds.themeOverlap}</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatRatioPercent(fund.trackedThemeOverlap.reduce((sum, item) => sum + item.weight, 0))}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-slate-500">{t.funds.themeExposure}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fund.themeExposure.slice(0, 4).map((item) => (
                    <span key={item.slug} className="rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                      {item.name} {formatRatioPercent(item.weight)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t.funds.styleExposure}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fund.styleExposure.slice(0, 4).map((item) => (
                    <span key={item.name} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      {item.name} {formatRatioPercent(item.weight)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-slate-500">{t.funds.qualityScore}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatScore(fund.averageQualityScore)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-slate-500">{t.funds.momentumScore}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatScore(fund.averageMomentumScore)}</p>
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
          marketNarrative: "基金透视模块用于回答“资金实际上配到了什么”，而不是只看基金名称或概念标签。",
          driverNarrative: "如果主题暴露高、质量分低、动量分过热，通常更像进攻型题材配置；若红利与电力权重高且质量稳定，则更偏防御配置。",
          supportingEvidence: [
            `当前示例篮子中，对电力与低碳主题的重合度最高的是 ${workspace.funds[0]?.name ?? "-"}。`,
            "模块将主题、行业、风格暴露拆开展示，避免单一标签误导。",
            "未来接入公募披露数据时，只需要替换 fund holdings 数据源。"
          ],
          risks: [
            "当前基金为 mock 篮子，用于验证架构与页面逻辑。",
            "真实基金持仓存在披露时滞，后续需要注明日期与来源。",
            "仅用于研究支持，不构成投资建议。"
          ],
          sources: ["themeRules", "marketData", "aiSynthesis"]
        }}
      />
    </div>
  );
}
