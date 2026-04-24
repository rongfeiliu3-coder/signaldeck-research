import { MockResearchAiAdapter } from "@/lib/ai/adapters/mock";
import { getResearchAiAdapter } from "@/lib/ai/provider";
import { OpportunityAiSummary, OpportunityItem } from "@/lib/types";

function collectStructuredMarketData(opportunities: OpportunityItem[]) {
  return opportunities.slice(0, 4).map((item) => `${item.title}：市场强度 ${item.scoreBreakdown.marketStrength.toFixed(0)}，广度 ${item.scoreBreakdown.breadthParticipation.toFixed(0)}，活跃度 ${item.scoreBreakdown.turnoverActivity.toFixed(0)}`);
}

function collectFundamentalAndExposureData(opportunities: OpportunityItem[]) {
  return opportunities.slice(0, 4).map((item) => `${item.title}：质量 ${item.scoreBreakdown.fundamentalQuality.toFixed(0)}，防御属性 ${item.scoreBreakdown.defensiveness.toFixed(0)}，机构相关度 ${item.scoreBreakdown.institutionalRelevance.toFixed(0)}`);
}

function collectRankedOpportunityTitles(opportunities: OpportunityItem[]) {
  return opportunities.slice(0, 3).map((item) => item.title);
}

function buildEvidenceTable(opportunities: OpportunityItem[]) {
  return opportunities.slice(0, 4).flatMap((item) => item.supportingEvidence.slice(0, 1));
}

function buildBearishTable(opportunities: OpportunityItem[]) {
  return opportunities.slice(0, 4).flatMap((item) => item.counterEvidence.slice(0, 1));
}

export async function generateOpportunityLabAiSummary(opportunities: OpportunityItem[]): Promise<OpportunityAiSummary> {
  const adapter = getResearchAiAdapter();

  if (!adapter.isAvailable()) {
    return {
      provider: adapter.label,
      mode: "disabled",
      overview: "AI 适配器未启用，当前仅使用结构化评分。",
      counterArgument: "等待后续配置真实模型后生成反方观点。",
      narrativeBias: "当前未启用 AI 叙事偏差检测。"
    };
  }

  const structuredEvidence = [
    ...collectStructuredMarketData(opportunities),
    ...collectFundamentalAndExposureData(opportunities),
    ...buildEvidenceTable(opportunities)
  ];
  const counterEvidence = buildBearishTable(opportunities);
  const input = {
    topic: "机会分析",
    structuredEvidence,
    counterEvidence,
    opportunityTitles: collectRankedOpportunityTitles(opportunities)
  };
  const fallbackAdapter = new MockResearchAiAdapter();
  let usedAdapter = adapter;
  const result = await adapter.summarizeOpportunityLab(input).catch(async () => {
    usedAdapter = fallbackAdapter;
    return fallbackAdapter.summarizeOpportunityLab(input);
  });

  return {
    provider: usedAdapter.label,
    mode: usedAdapter.mode,
    overview: result.overview,
    counterArgument: result.counterArgument,
    narrativeBias: result.narrativeBias
  };
}

export const opportunityAgentWorkflow = {
  collectStructuredMarketData,
  collectFundamentalAndExposureData,
  collectRankedOpportunityTitles,
  buildEvidenceTable,
  buildBearishTable,
  generateOpportunityLabAiSummary
};
