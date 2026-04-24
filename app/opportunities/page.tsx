import { Bot, Radar, Search, Sparkles, Target } from "lucide-react";
import { OpportunityCard } from "@/components/opportunity-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { buildOpportunityDiagnostic } from "@/lib/research/opportunities";
import { getResearchWorkspace } from "@/lib/research/workspace";

function categoryTitle(category: "long-term" | "medium-term" | "short-term" | "high-risk") {
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

export default async function OpportunitiesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = await searchParams;
  const query = params.q ?? "";
  const workspace = await getResearchWorkspace();
  const diagnostic = buildOpportunityDiagnostic(workspace, query);
  const todayList = workspace.opportunityLab.opportunities.slice(0, 6);

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
              用结构化评分识别股票、主题、行业和基金型篮子的潜在机会。先看市场强度、广度、换手、集中度、质量和机构相关度，再看 AI 压缩摘要。
            </p>
            <p className="mt-3 text-sm text-slate-500">
              这里不是选股喊单页。所有结论都同时展示支持证据、反证和失效条件。
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">数据状态</p>
              <p className="mt-2 text-lg font-semibold text-white">{workspace.providerStatus.current}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">AI 适配器</p>
              <p className="mt-2 text-lg font-semibold text-white">{workspace.opportunityLab.aiSummary.provider}</p>
            </div>
          </div>
        </div>
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

      {(["long-term", "medium-term", "short-term", "high-risk"] as const).map((category) => (
        <section key={category} className="surface p-5">
          <h2 className="text-base font-semibold text-white">{categoryTitle(category)}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {category === "long-term"
              ? "偏质量、防御、持续跟踪。"
              : category === "medium-term"
                ? "偏趋势确认和板块扩散。"
                : category === "short-term"
                  ? "偏活跃度和短线强度。"
                  : "偏题材、情绪和高波动。"}
          </p>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {workspace.opportunityLab.byCategory[category].map((item) => (
              <OpportunityCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="surface p-5">
          <div className="flex items-center gap-2 text-cyan">
            <Search className="h-4 w-4" />
            <h2 className="text-base font-semibold text-white">输入代码诊断</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">支持股票代码、基金代码、主题名称和行业名。</p>
          <form action="/opportunities" method="get" className="mt-4 flex gap-3">
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
                <p className="text-sm font-medium text-white">观察笔记</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{workspace.opportunityLab.aiSummary.watchlistNote}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">反方视角</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{workspace.opportunityLab.aiSummary.counterArgument}</p>
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
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">4. 输出多头框架、空头框架、失效条件，最后才交给 AI 做压缩总结。</div>
            </div>
          </section>
        </section>
      </section>
    </div>
  );
}
