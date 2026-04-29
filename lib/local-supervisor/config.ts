import fs from "fs";
import path from "path";
import type { LocalProcessConfig } from "./types";

type LocalProcessFile = {
  processes: LocalProcessConfig[];
};

const CONFIG_PATH = path.join(process.cwd(), "config", "local-processes.json");

export function getLocalProcessConfigs(): LocalProcessConfig[] {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as LocalProcessFile;
  return parsed.processes;
}

export function getLocalProcessConfig(id: string): LocalProcessConfig | undefined {
  return getLocalProcessConfigs().find((processConfig) => processConfig.id === id);
}
