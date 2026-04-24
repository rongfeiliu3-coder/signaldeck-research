import { OpportunityAiInput, ResearchAiAdapter } from "@/lib/ai/adapters/base";

type DeepSeekMessage = {
  role: "system" | "user";
  content: string;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function buildPrompt(input: OpportunityAiInput) {
  return [
    `主题: ${input.topic}`,
    `机会对象: ${input.opportunityTitles.join("、") || "暂无"}`,
    `结构化证据: ${input.structuredEvidence.join("；") || "暂无"}`,
    `反证: ${input.counterEvidence.join("；") || "暂无"}`,
    "请返回 JSON，字段为 overview、watchlistNote、counterArgument。不要给投资建议，不要添加结构化证据之外的新事实。"
  ].join("\n");
}

function parseJsonSummary(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{ overview: string; watchlistNote: string; counterArgument: string }>;
    return {
      overview: parsed.overview ?? content,
      watchlistNote: parsed.watchlistNote ?? "继续跟踪结构化证据变化。",
      counterArgument: parsed.counterArgument ?? "需要持续检查反证。"
    };
  } catch {
    return {
      overview: content,
      watchlistNote: "继续跟踪结构化证据变化。",
      counterArgument: "需要持续检查反证。"
    };
  }
}

export class DeepSeekResearchAiAdapter implements ResearchAiAdapter {
  readonly id = "deepseek";
  readonly label = "DeepSeek Research AI";
  readonly mode = "live" as const;

  isAvailable() {
    return Boolean(process.env.DEEPSEEK_API_KEY);
  }

  async summarizeOpportunityLab(input: OpportunityAiInput) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content:
          "你是A股研究工作台里的研究摘要助手。只做证据压缩、反方观点和观察笔记，不提供直接投资建议，不编造未给出的事实。"
      },
      {
        role: "user",
        content: buildPrompt(input)
      }
    ];

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek request failed: ${response.status}`);
    }

    const payload = (await response.json()) as DeepSeekResponse;
    const content = payload.choices?.[0]?.message?.content ?? "";
    return parseJsonSummary(content);
  }
}
