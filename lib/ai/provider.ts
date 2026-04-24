import { MockResearchAiAdapter } from "@/lib/ai/adapters/mock";

const mockAdapter = new MockResearchAiAdapter();

export function getResearchAiAdapter() {
  return mockAdapter;
}

export function getResearchAiEnvHints() {
  return {
    providerEnv: "RESEARCH_AI_PROVIDER",
    supportedFutureProviders: ["openai-compatible", "anthropic-compatible", "custom-http"],
    suggestedKeys: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "CUSTOM_LLM_API_KEY", "CUSTOM_LLM_BASE_URL"]
  };
}
