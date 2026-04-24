import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OpportunityItem } from "@/lib/types";

export function opportunityCategoryLabel(category: OpportunityItem["category"]) {
  switch (category) {
    case "long-term":
      return "长线观察机会";
    case "medium-term":
      return "中线趋势机会";
    case "short-term":
      return "短线交易机会";
    default:
      return "高风险题材机会";
  }
}

export function opportunityAssetLabel(assetType: OpportunityItem["assetType"]) {
  switch (assetType) {
    case "stock":
      return "股票";
    case "fund":
      return "基金篮子";
    case "theme":
      return "主题";
    default:
      return "行业";
  }
}

export function opportunityDriverLabel(driver: OpportunityItem["driver"]) {
  switch (driver) {
    case "fundamentals-driven":
      return "基本面驱动";
    case "sentiment-driven":
      return "情绪驱动";
    case "policy-driven":
      return "政策驱动";
    default:
      return "混合驱动";
  }
}

export function opportunityRiskLabel(risk: OpportunityItem["riskLevel"]) {
  switch (risk) {
    case "low":
      return "低风险";
    case "medium":
      return "中风险";
    case "high":
      return "高风险";
    default:
      return "极高风险";
  }
}

function riskTone(risk: OpportunityItem["riskLevel"]) {
  if (risk === "low") return "text-mint";
  if (risk === "medium") return "text-amber";
  return "text-rose";
}

function resolveHref(item: OpportunityItem) {
  if (item.assetType === "stock") return `/symbols/${encodeURIComponent(item.assetRef)}`;
  if (item.assetType === "theme") return `/themes/${item.assetRef}`;
  if (item.assetType === "fund") return "/funds";
  return "/opportunities";
}

export function OpportunityCard({ item }: { item: OpportunityItem }) {
  return (
    <article className="surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[11px] text-cyan">{opportunityCategoryLabel(item.category)}</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-400">{opportunityAssetLabel(item.assetType)}</span>
            <span className={`rounded-full border border-white/10 px-2.5 py-1 text-[11px] ${riskTone(item.riskLevel)}`}>{opportunityRiskLabel(item.riskLevel)}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{item.assetRef} · {opportunityDriverLabel(item.driver)}</p>
          </div>
        </div>
        <Link
          href={resolveHref(item)}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label={`Open ${item.title}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{item.whyNow}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-slate-500">综合机会分</p>
          <p className="mt-2 text-2xl font-semibold text-white">{item.scoreBreakdown.composite.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-400">{item.confidence.toUpperCase()} CONF</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-slate-500">长线跟踪分</p>
          <p className="mt-2 text-2xl font-semibold text-mint">{item.scoreBreakdown.longTerm.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-400">质量/防御优先</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-slate-500">短线交易分</p>
          <p className="mt-2 text-2xl font-semibold text-amber">{item.scoreBreakdown.shortTerm.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-400">强度/活跃优先</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-slate-500">市场强度</p>
          <p className="mt-2 text-2xl font-semibold text-white">{item.scoreBreakdown.marketStrength.toFixed(0)}</p>
          <p className="mt-1 text-xs text-slate-400">广度 {item.scoreBreakdown.breadthParticipation.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-slate-500">质量 / 防御</p>
          <p className="mt-2 text-2xl font-semibold text-white">{item.scoreBreakdown.fundamentalQuality.toFixed(0)}</p>
          <p className="mt-1 text-xs text-slate-400">防御 {item.scoreBreakdown.defensiveness.toFixed(0)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">支持证据</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {item.supportingEvidence.map((evidence) => (
              <li key={evidence}>{evidence}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">反证与失效条件</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {[...item.counterEvidence, ...item.thesisInvalidation].slice(0, 4).map((evidence) => (
              <li key={evidence}>{evidence}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
