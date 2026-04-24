import { OpportunityAiInput, ResearchAiAdapter } from "@/lib/ai/adapters/base";

function shorten(items: string[], fallback: string) {
  return items.filter(Boolean).slice(0, 2).join("；") || fallback;
}

export class MockResearchAiAdapter implements ResearchAiAdapter {
  readonly id = "mock";
  readonly label = "Mock Research AI";
  readonly mode = "mock" as const;

  isAvailable() {
    return true;
  }

  async summarizeOpportunityLab(input: OpportunityAiInput) {
    return {
      overview: `${input.topic} 当前更值得跟踪的是 ${shorten(input.opportunityTitles, "暂无高置信方向")}。AI 仅做压缩，结论仍以结构化评分和证据表为准。`,
      watchlistNote: `先盯 ${shorten(input.structuredEvidence, "等待更多市场证据")}；若后续出现 ${shorten(input.counterEvidence, "扩散转弱或换手衰减")}，需要下调观察优先级。`,
      counterArgument: `反方角度：${shorten(input.counterEvidence, "当前证据仍不足以支持高确定性判断")}。`
    };
  }
}
