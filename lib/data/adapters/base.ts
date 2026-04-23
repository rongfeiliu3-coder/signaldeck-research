import { RawResearchData } from "@/lib/types";

export interface AShareDataAdapter {
  readonly id: "mock" | "akshare" | "tushare";
  readonly label: string;
  readonly mode: "mock" | "live";
  isAvailable(): boolean;
  fetchResearchData(): Promise<RawResearchData>;
  refreshSnapshot(): Promise<{ ok: boolean; message: string }>;
}
