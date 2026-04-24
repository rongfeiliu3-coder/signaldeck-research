import { Bot, Radar, Search, SlidersHorizontal, Sparkles, Target } from "lucide-react";
import {
  OpportunityCard,
  opportunityAssetLabel,
  opportunityDriverLabel,
  opportunityRiskLabel
} from "@/components/opportunity-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { buildOpportunityDiagnostic } from "@/lib/research/opportunities";
import { getResearchWorkspace } from "@/lib/research/workspace";
import { OpportunityAssetType, OpportunityItem, OpportunityRisk, OpportunityStyle } from "@/lib/types";

type SortKey =
  | "composite-desc"
  | "risk-desc"
  | "risk-asc"
  | "defensive-desc"
  | "quality-desc"
  | "market-desc"
  | "short-desc"
  | "long-desc";

type OpportunitySearchParams = {
  q?: string;
  sort?: SortKey;
  type?: OpportunityAssetType | "all";
  horizon?: OpportunityItem["category"] | "all";
  risk?: OpportunityRisk | "all";
  style?: OpportunityStyle | "all";
  theme?: string;
};

const riskRank: Record<OpportunityRisk, number> = {
  low: 1,
  medium: 2,
  high: 3,
  "very-high": 4
};

const trackedThemeOptions = [
  { slug: "all", label: "全部主题" },
  { slug: "power-utilities", label: "电力" },
  { slug: "low-carbon-energy", label: "低碳新能源" },
  { slug: "satellite-aerospace", label: "卫星航天" },
  { slug: "high-dividend", label: "高股息" },
  { slug: "compute-ai", label: "算力AI" }
];

function sortLabel(sort: SortKey) {
  switch (sort) {
    case "risk-desc":
      return "风险等级：高到低";
    case "risk-asc":
      return "风险等级：低到高";
    case "defensive-desc":
      return "股息/防御属性：高到低";
    case "quality-desc":
      return "基本面质量：高到低";
    case "market-desc":
      return "市场强度：高到低";
    case "short-desc":
      return "短线适配度：高到低";
    case "long-desc":
      return "长线适配度：高到低";
    default:
      return "综合机会分：高到低";
  }
}

function categoryTitle(category: OpportunityItem["category"]) {
  switch (category) {
    case "long-term":
      return "长线观察";
    case "medium-term":
      return "中线趋势";
    case "short-term":
      return "短线交易";
    default:
      return "高风险题材";
  }
}

function categoryHint(category: OpportunityItem["category"]) {
  switch (category) {
    case "long-term":
      return "适合长线观察，偏质量、防御和持续跟踪。";
    case "medium-term":
      return "适合中线跟踪，偏趋势确认和板块扩散。";
    case "short-term":
      return "偏短线博弈，重点看强度、换手和叙事热度。";
    default:
      return "高风险题材，不适合重仓，重点看反证和失效条件。";
  }
}

function renderExposure(items: Array<{ name: string; weight: number }>) {
  if (!items.length) return <p className="text-sm text-slate-500">暂无。</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={`${item.name}-${item.weight}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          {item.name} {(item.weight * 100).toFixed(0)}%
        </span>
      ))}
    </div>
  );
}

function filterAndSortOpportunities(items: OpportunityItem[], params: OpportunitySearchParams) {
  const sort = params.sort ?? "composite-desc";
  const filtered = items.filter((item) => {
    const typeOk = !params.type || params.type === "all" || item.assetType === params.type;
    const horizonOk = !params.horizon || params.horizon === "all" || item.category === params.horizon;
    const riskOk = !params.risk || params.risk === "all" || item.riskLevel === params.risk;
    const styleOk = !params.style || params.style === "all" || item.style.includes(params.style);
    const themeOk = !params.theme || params.theme === "all" || item.trackedThemeSlugs.includes(params.theme);
    return typeOk && horizonOk && riskOk && styleOk && themeOk;
  });

  return [...filtered].sort((a, b) => {
    switch (sort) {
      case "risk-desc":
        return riskRank[b.riskLevel] - riskRank[a.riskLevel];
      case "risk-asc":
        return riskRank[a.riskLevel] - riskRank[b.riskLevel];
      case "defensive-desc":
        return b.scoreBreakdown.defensiveness - a.scoreBreakdown.defensiveness;
      case "quality-desc":
        return b.scoreBreakdown.fundamentalQuality - a.scoreBreakdown.fundamentalQuality;
      case "market-desc":
        return b.scoreBreakdown.marketStrength - a.scoreBreakdown.marketStrength;
      case "short-desc":
        return b.scoreBreakdown.shortTerm - a.scoreBreakdown.shortTerm;
      case "long-desc":
        return b.scoreBreakdown.longTerm - a.scoreBreakdown.longTerm;
      default:
        return b.scoreBreakdown.composite - a.scoreBreakdown.composite;
    }
  });
}

function inputWithHidden(name: string, value: string | undefined) {
  return value ? <input type="hidden" name={name} value={value} /> : null;
}

export default async function OpportunitiesPage({
  searchParams
}: {
  searchParams: Promise<OpportunitySearchParams>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = await searchParams;
  const query = params.q ?? "";
  const sort = params.sort ?? "composite-desc";
  const workspace = await getResearchWorkspace();
  const opportunities = filterAndSortOpportunities(workspace.opportunityLab.opportunities, params);
  const diagnostic = buildOpportunityDiagnostic(workspace, query);
  const todayList = opportunities.slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-sm text-cyan">
          <Sparkles className="h-4 w-4" />
          {t.nav.opportunities}
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div>
            <h1 className="page-title">机会分析</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
              按风险、股息防御、长短线适配、风格和跟踪主题筛选机会。排序只由结构化评分决定，AI 只做机会摘要、反方观点和叙事偏差提示。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-xl border border-cyan/20 bg-cyan/[0.06] p-4">
              <p className="text-xs text-slate-500">Data Status</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {workspace.providerStatus.mode === "live" ? "Akshare Live" : "Mock Fallback"}
              </p>
              <p className="mt-1 text-xs text-slate-500">{workspace.providerStatus.current}</p>
            </div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
              <p className="text-xs text-slate-500">AI Status</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {workspace.opportunityLab.aiSummary.mode === "live" ? "DeepSeek" : "Mock / 未启用"}
              </p>
              <p className="mt-1 text-xs text-slate-500">{workspace.opportunityLab.aiSummary.provider}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">当前排序</p>
              <p className="mt-2 text-lg font-semibold text-white">{sortLabel(sort)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">结果数量</p>
              <p className="mt-2 text-lg font-semibold text-white">{opportunities.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div className="flex items-center gap-2 text-cyan">
          <SlidersHorizontal className="h-4 w-4" />
          <h2 className="text-base font-semibold text-white">排序与筛选</h2>
        </div>
        <form action="/opportunities" method="get" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {inputWithHidden("q", query)}
          <select name="sort" defaultValue={sort} className="focus-ring rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white">
            <option value="composite-desc">综合机会分：高到低</option>
            <option value="risk-desc">风险等级：高到低</option>
            <option value="risk-asc">风险等级：低到高</option>
            <option value="defensive-desc">股息/防御属性：高到低</option>
            <option value="quality-desc">基本面质量：高到低</option>
            <option value="market-desc">市场强度：高到低</option>
            <option value="short-desc">短线适配度：高到低</option>
            <option value="long-desc">长线适配度：高到低</option>
          </select>
          <select name="type" defaultValue={params.type ?? "all"} className="focus-ring rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white">
            <option value="all">全部类型</option>
            <option value="stock">股票</option>
            <option value="theme">主题</option>
            <option value="sector">行业</option>
            <option value="fund">基金篮子</option>
          </select>
          <select name="horizon" defaultValue={params.horizon ?? "all"} className="focus-ring rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white">
            <option value="all">全部周期</option>
            <option value="long-term">长线观察</option>
            <option value="medium-term">中线趋势</option>
            <option value="short-term">短线交易</option>
            <option value="high-risk">高风险题材</option>
          </select>
          <select name="risk" defaultValue={params.risk ?? "all"} className="focus-ring rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white">
            <option value="all">全部风险</option>
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
            <option value="very-high">极高风险</option>
          </select>
          <select name="style" defaultValue={params.style ?? "all"} className="focus-ring rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white">
            <option value="all">全部风格</option>
            <option value="dividend">股息</option>
            <option value="growth">成长</option>
            <option value="cyclical">周期</option>
            <option value="policy">政策</option>
            <option value="sentiment">情绪</option>
            <option value="quality">质量</option>
            <option value="ai">AI</option>
            <option value="energy">能源</option>
          </select>
          <select name="theme" defaultValue={params.theme ?? "all"} className="focus-ring rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white">
            {trackedThemeOptions.map((item) => (
              <option key={item.slug} value={item.slug}>{item.label}</option>
            ))}
          </select>
          <button type="submit" className="focus-ring rounded-lg border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-medium text-cyan hover:bg-cyan/15 xl:col-span-6">
            应用排序和筛选
          </button>
        </form>
      </section>

      <section className="surface p-5">
        <div className="flex items-center gap-2 text-cyan">
          <Target className="h-4 w-4" />
          <h2 className="text-base font-semibold text-white">今日机会列表</h2>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {todayList.map((item) => (
            <OpportunityCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">机会对比表</h2>
          <p className="mt-1 text-sm text-slate-500">同一批筛选结果的密集对比视图。</p>
        </div>
        <div className="overflow-x-auto">
          <table className="terminal-table w-full min-w-[1320px] text-left text-sm">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>风险</th>
                <th>防御分</th>
                <th>长线分</th>
                <th>短线分</th>
                <th>市场强度</th>
                <th>基本面质量</th>
                <th>主驱动</th>
                <th>失效条件</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.slice(0, 24).map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-white">{item.title}</td>
                  <td>{opportunityAssetLabel(item.assetType)}</td>
                  <td>{opportunityRiskLabel(item.riskLevel)}</td>
                  <td>{item.scoreBreakdown.defensiveness.toFixed(1)}</td>
                  <td>{item.scoreBreakdown.longTerm.toFixed(1)}</td>
                  <td>{item.scoreBreakdown.shortTerm.toFixed(1)}</td>
                  <td>{item.scoreBreakdown.marketStrength.toFixed(1)}</td>
                  <td>{item.scoreBreakdown.fundamentalQuality.toFixed(1)}</td>
                  <td>{opportunityDriverLabel(item.driver)}</td>
                  <td>{item.thesisInvalidation[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(["long-term", "medium-term", "short-term", "high-risk"] as const).map((category) => {
        const items = opportunities.filter((item) => item.category === category).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={category} className="surface p-5">
            <h2 className="text-base font-semibold text-white">{categoryTitle(category)}</h2>
            <p className="mt-2 text-sm text-slate-500">{categoryHint(category)}</p>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {items.map((item) => (
                <OpportunityCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="surface p-5">
          <div className="flex items-center gap-2 text-cyan">
            <Search className="h-4 w-4" />
            <h2 className="text-base font-semibold text-white">输入代码诊断</h2>
          </div>
          <form action="/opportunities" method="get" className="mt-4 flex gap-3">
            {inputWithHidden("sort", sort)}
            {inputWithHidden("type", params.type)}
            {inputWithHidden("horizon", params.horizon)}
            {inputWithHidden("risk", params.risk)}
            {inputWithHidden("style", params.style)}
            {inputWithHidden("theme", params.theme)}
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="例如 600900.SH / 017001 / 电力 / Technology"
              className="focus-ring min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button type="submit" className="focus-ring rounded-lg border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm font-medium text-cyan hover:bg-cyan/15">
              诊断
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{diagnostic.matchedName}</p>
                <p className="mt-1 text-sm text-slate-500">{diagnostic.matchedRef ?? "未匹配到代码"}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{diagnostic.matchedType}</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">行业 / 主题暴露</p>
                <div className="mt-2 space-y-3">
                  {renderExposure(diagnostic.sectorExposure)}
                  {renderExposure(diagnostic.themeExposure)}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">风格 / 跟踪主题重合</p>
                <div className="mt-2 space-y-3">
                  {renderExposure(diagnostic.styleExposure)}
                  {renderExposure(diagnostic.trackedThemeOverlap)}
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">长线适配</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{diagnostic.longTermSuitability}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">短线适配</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{diagnostic.shortTermSuitability}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">近期强度变化</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{diagnostic.recentStrength}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-slate-500">主要风险</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                {diagnostic.majorRisks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <section className="surface p-5">
            <div className="flex items-center gap-2 text-cyan">
              <Bot className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">AI 研究摘要</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">压缩结论</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{workspace.opportunityLab.aiSummary.overview}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">反方视角</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{workspace.opportunityLab.aiSummary.counterArgument}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">叙事偏差</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{workspace.opportunityLab.aiSummary.narrativeBias}</p>
              </div>
            </div>
          </section>

          <section className="surface p-5">
            <div className="flex items-center gap-2 text-cyan">
              <Radar className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">Agent Workflow</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">1. 收集市场强度、广度、换手、集中度。</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">2. 收集基本面、基金暴露、跟踪主题重合度。</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">3. 分类到长线 / 中线 / 短线 / 高风险题材，并生成证据表。</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">4. 输出多头框架、空头框架、失效条件；AI 只做摘要、反方观点和叙事偏差提示。</div>
            </div>
          </section>
        </section>
      </section>
    </div>
  );
}
