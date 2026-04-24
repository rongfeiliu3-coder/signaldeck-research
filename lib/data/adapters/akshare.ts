import { AShareDataAdapter } from "@/lib/data/adapters/base";
import { RawResearchData } from "@/lib/types";

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

function authHeaders() {
  return process.env.AKSHARE_API_KEY ? { Authorization: `Bearer ${process.env.AKSHARE_API_KEY}` } : undefined;
}

export class AkshareAdapter implements AShareDataAdapter {
  readonly id = "akshare" as const;
  readonly label = "Akshare Live";
  readonly mode = "live" as const;

  private get baseUrl() {
    return process.env.AKSHARE_API_URL?.trim() ?? "";
  }

  isAvailable() {
    return Boolean(this.baseUrl);
  }

  async fetchResearchData(): Promise<RawResearchData> {
    if (!this.baseUrl) {
      throw new Error("AKSHARE_API_URL is not configured.");
    }

    const response = await fetch(joinUrl(this.baseUrl, "/snapshot/workspace"), {
      headers: authHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      throw new Error(`Akshare bridge request failed with status ${response.status}.`);
    }

    return (await response.json()) as RawResearchData;
  }

  async refreshSnapshot() {
    if (!this.baseUrl) {
      return {
        ok: false,
        message: "AKSHARE_API_URL 未配置，当前使用 Mock Fallback。"
      };
    }

    const response = await fetch(joinUrl(this.baseUrl, "/snapshot/workspace?refresh=1"), {
      headers: authHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Akshare bridge 刷新失败，HTTP ${response.status}，当前回退到 Mock Fallback。`
      };
    }

    return {
      ok: true,
      message: "Akshare bridge 已刷新，页面将优先使用 Akshare Live 数据。"
    };
  }
}
