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
    `结构化排序后的机会对象: ${input.opportunityTitles.join("、") || "暂无"}`,
    `结构化证据: ${input.structuredEvidence.join("；") || "暂无"}`,
    `反证: ${input.counterEvidence.join("；") || "暂无"}`,
    "请返回 JSON，字段必须为 overview、counterArgument、narrativeBias。",
    "只允许做机会摘要、反方观点、叙事偏差检测。",
    "不要给投资建议，不要决定或修改排名，不要添加结构化证据之外的新事实。"
  ].join("\n");
}

function parseJsonSummary(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{ overview: string; counterArgument: string; narrativeBias: string }>;
    return {
      overview: parsed.overview ?? content,
      counterArgument: parsed.counterArgument ?? "需要持续检查反证。",
      narrativeBias: parsed.narrativeBias ?? "需要留意强势叙事掩盖反证。"
    };
  } catch {
    return {
      overview: content,
      counterArgument: "需要持续检查反证。",
      narrativeBias: "需要留意强势叙事掩盖反证。"
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
          "你是A股研究工作台里的研究摘要助手。你只做机会摘要、反方观点和叙事偏差检测。排名、分类和评分完全由结构化规则决定，你不能修改、重排或建议替代排名。"
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
