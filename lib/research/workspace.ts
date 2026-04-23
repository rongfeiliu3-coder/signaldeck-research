import { getAdapterStatus, getConfiguredAdapter } from "@/lib/data/provider";
import { buildWorkspace } from "@/lib/research/analytics";

export async function getResearchWorkspace() {
  const adapter = getConfiguredAdapter();
  const raw = await adapter.fetchResearchData();
  const workspace = buildWorkspace(raw);
  const adapterStatus = getAdapterStatus();

  workspace.providerStatus = {
    current: adapter.label,
    mode: adapter.mode,
    available: adapterStatus.available
  };

  return workspace;
}

export async function refreshResearchWorkspace() {
  const adapter = getConfiguredAdapter();
  return adapter.refreshSnapshot();
}
