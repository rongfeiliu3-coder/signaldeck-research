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
      overview: `${input.topic} 当前更值得跟踪的是 ${shorten(input.opportunityTitles, "暂无高置信方向")}。AI 只压缩结构化机会结论，不参与排序。`,
      counterArgument: `反方角度：${shorten(input.counterEvidence, "当前反证不足，仍需继续跟踪广度、换手和基本面兑现")}。`,
      narrativeBias: `叙事偏差提示：若只盯强势标题，容易忽略 ${shorten(input.counterEvidence, "成交衰减、扩散转弱或基本面验证不足")}。`
    };
  }
}
