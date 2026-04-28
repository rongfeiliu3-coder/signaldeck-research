import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Zap, Activity, Info } from "lucide-react";
import { OpportunityItem } from "@/lib/types";

export function opportunityCategoryLabel(category: OpportunityItem["category"]) {
  switch (category) {
    case "long-term":
      return "长线观察";
    case "medium-term":
      return "中线趋势";
    case "short-term":
      return "短线博弈";
    default:
      return "高风险题材";
  }
}

export function opportunityAssetLabel(assetType: OpportunityItem["assetType"]) {
  switch (assetType) {
    case "stock":
      return "股票";
    case "fund":
      return "基金";
    case "theme":
      return "主题";
    default:
      return "行业";
  }
}

export function opportunityDriverLabel(driver: OpportunityItem["driver"]) {
  switch (driver) {
    case "fundamentals-driven":
      return "基本面支撑";
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
    <article className="surface group relative flex flex-col overflow-hidden transition-all hover:border-white/20">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {opportunityAssetLabel(item.assetType)}
              </span>
              <span className={`rounded bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${riskTone(item.riskLevel)}`}>
                {opportunityRiskLabel(item.riskLevel)}
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-cyan">
              {item.title}
              <span className="ml-2 text-xs font-normal text-slate-500">{item.assetRef}</span>
            </h3>
          </div>
          <Link
            href={resolveHref(item)}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded border border-white/10 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded border border-white/[0.05] bg-white/[0.02] p-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <ShieldCheck className="h-3 w-3 text-mint" />
              长线分
            </div>
            <p className="mt-1 font-number text-xl font-bold text-mint">{item.scoreBreakdown.longTerm.toFixed(1)}</p>
          </div>
          <div className="rounded border border-white/[0.05] bg-white/[0.02] p-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Zap className="h-3 w-3 text-amber" />
              短线分
            </div>
            <p className="mt-1 font-number text-xl font-bold text-amber">{item.scoreBreakdown.shortTerm.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Activity className="h-3 w-3" />
              主驱动力
            </div>
            <p className="mt-1 text-sm font-medium text-slate-200">
              {opportunityDriverLabel(item.driver)} · <span className="text-slate-400 font-normal">{item.whyNow}</span>
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Info className="h-3 w-3" />
              失效条件
            </div>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {item.thesisInvalidation[0] || "未设定具体失效条件"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-white/[0.05] bg-white/[0.01] px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{opportunityCategoryLabel(item.category)}</span>
        <span className="font-number text-[10px] font-bold text-slate-400">{item.confidence.toUpperCase()} CONF</span>
      </div>
    </article>
  );
}
