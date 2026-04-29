export type LocalProcessKind = "external" | "service" | "job";

export type LocalProcessConfig = {
  id: string;
  name: string;
  kind: LocalProcessKind;
  description: string;
  cwd: string;
  command: string;
  windowsCommand?: string;
  args: string[];
  env?: Record<string, string>;
  healthUrl?: string;
  port?: number;
  managed: boolean;
};

export type LocalProcessStatus = {
  id: string;
  name: string;
  kind: LocalProcessKind;
  description: string;
  managed: boolean;
  status: "running" | "stopped" | "starting" | "unhealthy" | "unknown";
  pid?: number;
  port?: number;
  uptimeSeconds?: number;
  lastExitCode?: number | null;
  lastStartedAt?: string;
  lastStoppedAt?: string;
  healthUrl?: string;
  healthOk?: boolean;
  healthLatencyMs?: number;
  healthMessage?: string;
  logPath?: string;
};

export type LocalSupervisorState = {
  generatedAt: string;
  processes: LocalProcessStatus[];
};
