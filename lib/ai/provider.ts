import { DeepSeekResearchAiAdapter } from "@/lib/ai/adapters/deepseek";
import { MockResearchAiAdapter } from "@/lib/ai/adapters/mock";

const deepSeekAdapter = new DeepSeekResearchAiAdapter();
const mockAdapter = new MockResearchAiAdapter();

export function getResearchAiAdapter() {
  return mockAdapter;
}

export function getServerApiResearchAiAdapter() {
  if (deepSeekAdapter.isAvailable()) {
    return deepSeekAdapter;
  }

  return mockAdapter;
}

export function getResearchAiEnvHints() {
  return {
    providerEnv: "RESEARCH_AI_PROVIDER",
    supportedFutureProviders: ["deepseek", "openai-compatible", "anthropic-compatible", "custom-http"],
    suggestedKeys: ["DEEPSEEK_API_KEY", "DEEPSEEK_BASE_URL", "DEEPSEEK_MODEL"]
  };
}
