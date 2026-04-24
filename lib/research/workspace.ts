import { getAdapterStatus, getConfiguredAdapter } from "@/lib/data/provider";
import { MockAshareAdapter } from "@/lib/data/adapters/mock";
import { buildWorkspace } from "@/lib/research/analytics";
import { buildOpportunityLab } from "@/lib/research/opportunities";

type ResearchSourceStatus = {
  activeLabel: string;
  mode: "mock" | "live";
  fallbackTriggered: boolean;
  fallbackReason?: string;
};

async function resolveResearchData() {
  const adapter = getConfiguredAdapter();

  try {
    const raw = await adapter.fetchResearchData();
    return {
      raw,
      status: {
        activeLabel: adapter.label,
        mode: adapter.mode,
        fallbackTriggered: false
      } satisfies ResearchSourceStatus
    };
  } catch (error) {
    const fallbackAdapter = new MockAshareAdapter();
    const raw = await fallbackAdapter.fetchResearchData();

    return {
      raw,
      status: {
        activeLabel: `${fallbackAdapter.label} (fallback)`,
        mode: "mock" as const,
        fallbackTriggered: true,
        fallbackReason: error instanceof Error ? error.message : "Unknown provider error"
      } satisfies ResearchSourceStatus
    };
  }
}

export async function getResearchWorkspace() {
  const { raw, status } = await resolveResearchData();
  const workspace = buildWorkspace(raw);
  const adapterStatus = getAdapterStatus();

  workspace.providerStatus = {
    current: status.activeLabel,
    mode: status.mode,
    available: adapterStatus.available
  };
  workspace.opportunityLab = await buildOpportunityLab(workspace);

  return workspace;
}

export async function refreshResearchWorkspace() {
  const adapter = getConfiguredAdapter();
  const probe = await adapter.refreshSnapshot();
  const { status } = await resolveResearchData();
  const message = status.fallbackTriggered
    ? `实时数据不可用，已回退到 Mock Fallback。原因：${status.fallbackReason ?? "unknown"}`
    : probe.message;

  return {
    ok: probe.ok || status.fallbackTriggered,
    provider: status.activeLabel,
    fallbackTriggered: status.fallbackTriggered,
    message
  };
}
