import { AShareDataAdapter } from "@/lib/data/adapters/base";
import { RawResearchData } from "@/lib/types";

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

export class AkshareAdapter implements AShareDataAdapter {
  readonly id = "akshare" as const;
  readonly label = "Akshare Bridge";
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
      headers: process.env.AKSHARE_API_KEY ? { Authorization: `Bearer ${process.env.AKSHARE_API_KEY}` } : undefined,
      cache: "no-store"
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
        message: "AKSHARE_API_URL 未配置，当前将使用 mock 数据。"
      };
    }

    const response = await fetch(joinUrl(this.baseUrl, "/health"), {
      headers: process.env.AKSHARE_API_KEY ? { Authorization: `Bearer ${process.env.AKSHARE_API_KEY}` } : undefined,
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Akshare bridge 不可用，HTTP ${response.status}，当前将回退到 mock 数据。`
      };
    }

    return {
      ok: true,
      message: "Akshare bridge 可用，后续页面刷新将优先使用实时 A 股数据。"
    };
  }
}
