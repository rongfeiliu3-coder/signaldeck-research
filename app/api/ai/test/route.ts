import { NextResponse } from "next/server";
import { MockResearchAiAdapter } from "@/lib/ai/adapters/mock";
import { getServerApiResearchAiAdapter } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

const testInput = {
  topic: "DeepSeek API test",
  structuredEvidence: [
    "市场强度 62，广度 58，活跃度 55",
    "基本面质量 66，防御属性 61"
  ],
  counterEvidence: [
    "若成交回落，短线热度可能下降",
    "当前结论仅用于接口连通性测试"
  ],
  opportunityTitles: ["机会分析测试"]
};

export async function GET() {
  const adapter = getServerApiResearchAiAdapter();
  const fallbackAdapter = new MockResearchAiAdapter();
  let fallbackTriggered = false;
  let usedAdapter = adapter;

  const summary = await adapter.summarizeOpportunityLab(testInput).catch(async () => {
    fallbackTriggered = true;
    usedAdapter = fallbackAdapter;
    return fallbackAdapter.summarizeOpportunityLab(testInput);
  });

  return NextResponse.json({
    ok: true,
    provider: usedAdapter.label,
    mode: usedAdapter.mode,
    fallbackTriggered,
    deepSeekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
    summary
  });
}
