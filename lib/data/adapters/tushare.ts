import { AShareDataAdapter } from "@/lib/data/adapters/base";
import { RawResearchData } from "@/lib/types";

export class TushareAdapter implements AShareDataAdapter {
  readonly id = "tushare" as const;
  readonly label = "Tushare Bridge";
  readonly mode = "live" as const;

  isAvailable() {
    return Boolean(process.env.TUSHARE_API_URL && process.env.TUSHARE_TOKEN);
  }

  async fetchResearchData(): Promise<RawResearchData> {
    const endpoint = process.env.TUSHARE_API_URL;
    const token = process.env.TUSHARE_TOKEN;
    if (!endpoint || !token) {
      throw new Error("TUSHARE_API_URL or TUSHARE_TOKEN is not configured.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action: "workspaceSnapshot" }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Tushare bridge request failed with status ${response.status}.`);
    }

    return (await response.json()) as RawResearchData;
  }

  async refreshSnapshot() {
    return {
      ok: true,
      message: "Tushare bridge 已触发刷新。"
    };
  }
}
