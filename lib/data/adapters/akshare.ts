import { AShareDataAdapter } from "@/lib/data/adapters/base";
import { RawResearchData } from "@/lib/types";

export class AkshareAdapter implements AShareDataAdapter {
  readonly id = "akshare" as const;
  readonly label = "Akshare Bridge";
  readonly mode = "live" as const;

  isAvailable() {
    return Boolean(process.env.AKSHARE_API_URL);
  }

  async fetchResearchData(): Promise<RawResearchData> {
    const endpoint = process.env.AKSHARE_API_URL;
    if (!endpoint) {
      throw new Error("AKSHARE_API_URL is not configured.");
    }

    const response = await fetch(endpoint, {
      headers: process.env.AKSHARE_API_KEY ? { Authorization: `Bearer ${process.env.AKSHARE_API_KEY}` } : undefined,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Akshare bridge request failed with status ${response.status}.`);
    }

    return (await response.json()) as RawResearchData;
  }

  async refreshSnapshot() {
    return {
      ok: true,
      message: "Akshare bridge 已触发刷新。"
    };
  }
}
