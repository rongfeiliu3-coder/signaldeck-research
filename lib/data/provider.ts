import { AkshareAdapter } from "@/lib/data/adapters/akshare";
import { AShareDataAdapter } from "@/lib/data/adapters/base";
import { MockAshareAdapter } from "@/lib/data/adapters/mock";
import { TushareAdapter } from "@/lib/data/adapters/tushare";

const adapters: AShareDataAdapter[] = [new AkshareAdapter(), new TushareAdapter(), new MockAshareAdapter()];

export function getConfiguredAdapter() {
  const preferred = process.env.DATA_PROVIDER?.toLowerCase();

  if (preferred) {
    const selected = adapters.find((adapter) => adapter.id === preferred && adapter.isAvailable());
    if (selected) return selected;
  }

  return adapters.find((adapter) => adapter.isAvailable()) ?? adapters[adapters.length - 1];
}

export function getAdapterStatus() {
  const active = getConfiguredAdapter();
  return {
    active,
    available: adapters
      .filter((adapter) => adapter.isAvailable())
      .map((adapter) => ({ id: adapter.id, label: adapter.label, mode: adapter.mode }))
  };
}
