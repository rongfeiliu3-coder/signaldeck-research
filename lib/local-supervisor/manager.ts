import { execFile, spawn, type ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs";
import path from "path";
import { getLocalProcessConfig, getLocalProcessConfigs } from "./config";
import type { LocalProcessConfig, LocalProcessStatus, LocalSupervisorState } from "./types";

type ManagedRuntime = {
  child?: ChildProcessWithoutNullStreams;
  status: "starting" | "running" | "stopped";
  startedAt?: number;
  stoppedAt?: number;
  lastExitCode?: number | null;
};

type SpawnConfig = {
  command: string;
  args: string[];
};

const runtimeRoot = path.join(process.cwd(), "runtime");
const logRoot = path.join(runtimeRoot, "logs");
const secretPatterns = [/DEEPSEEK_API_KEY=[^\s]+/gi, /TUSHARE_TOKEN=[^\s]+/gi, /AKSHARE_API_URL=[^\s]+/gi];

type GlobalLocalSupervisor = typeof globalThis & {
  __quantizeSupervisor?: Map<string, ManagedRuntime>;
};

function getRegistry() {
  const globalRegistry = globalThis as GlobalLocalSupervisor;
  if (!globalRegistry.__quantizeSupervisor) {
    globalRegistry.__quantizeSupervisor = new Map<string, ManagedRuntime>();
  }
  return globalRegistry.__quantizeSupervisor;
}

function ensureRuntimeDirs() {
  fs.mkdirSync(logRoot, { recursive: true });
}

function resolveCwd(config: LocalProcessConfig) {
  return path.resolve(process.cwd(), config.cwd);
}

function getLogPath(id: string) {
  ensureRuntimeDirs();
  return path.join(logRoot, `${id}.log`);
}

function appendLog(id: string, message: string) {
  const safeMessage = secretPatterns.reduce((text, pattern) => text.replace(pattern, "[redacted]"), message);
  fs.appendFileSync(getLogPath(id), safeMessage);
}

function resolveCommand(config: LocalProcessConfig) {
  if (process.platform === "win32" && config.windowsCommand) {
    const candidate = path.resolve(resolveCwd(config), config.windowsCommand);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return config.command;
}

function resolveSpawnConfig(config: LocalProcessConfig): SpawnConfig {
  const command = resolveCommand(config);

  if (process.platform === "win32" && command.toLowerCase().endsWith(".cmd")) {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", command, ...config.args]
    };
  }

  return {
    command,
    args: config.args
  };
}

function runPowerShell(command: string): Promise<string> {
  return new Promise((resolve) => {
    execFile("powershell.exe", ["-NoProfile", "-Command", command], { windowsHide: true }, (_error, stdout) => {
      resolve(stdout.toString().trim());
    });
  });
}

async function findListeningPid(port?: number) {
  if (!port || process.platform !== "win32") {
    return undefined;
  }

  const output = await runPowerShell(
    `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)`
  );
  const pid = Number(output);
  return Number.isFinite(pid) && pid > 0 ? pid : undefined;
}

async function stopListeningPid(port?: number) {
  const pid = await findListeningPid(port);
  if (!pid) {
    return false;
  }
  await runPowerShell(`Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue`);
  return true;
}

async function checkHealth(url?: string): Promise<Pick<LocalProcessStatus, "healthOk" | "healthLatencyMs" | "healthMessage">> {
  if (!url) {
    return {};
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return {
      healthOk: response.ok,
      healthLatencyMs: Date.now() - startedAt,
      healthMessage: response.ok ? "Health check OK" : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      healthOk: false,
      healthLatencyMs: Date.now() - startedAt,
      healthMessage: error instanceof Error ? error.message : "Health check failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function buildStatus(config: LocalProcessConfig): Promise<LocalProcessStatus> {
  const registry = getRegistry();
  const runtime = registry.get(config.id);
  const health = await checkHealth(config.healthUrl);
  const adoptedPid = !runtime?.child ? await findListeningPid(config.port) : undefined;
  const runningByChild = Boolean(runtime?.child && !runtime.child.killed && runtime.status !== "stopped");
  const runningByPort = Boolean(adoptedPid);
  const runningByHealth = Boolean(health.healthOk);
  const status =
    runningByChild || runningByHealth || runningByPort
      ? health.healthOk === false && config.healthUrl
        ? "unhealthy"
        : "running"
      : runtime?.status === "starting"
        ? "starting"
        : "stopped";

  return {
    id: config.id,
    name: config.name,
    kind: config.kind,
    description: config.description,
    managed: config.managed,
    status,
    pid: runtime?.child?.pid ?? adoptedPid,
    port: config.port,
    uptimeSeconds: runtime?.startedAt && status !== "stopped" ? Math.floor((Date.now() - runtime.startedAt) / 1000) : undefined,
    lastExitCode: runtime?.lastExitCode,
    lastStartedAt: runtime?.startedAt ? new Date(runtime.startedAt).toISOString() : undefined,
    lastStoppedAt: runtime?.stoppedAt ? new Date(runtime.stoppedAt).toISOString() : undefined,
    healthUrl: config.healthUrl,
    logPath: getLogPath(config.id),
    ...health
  };
}

export async function getLocalSupervisorState(): Promise<LocalSupervisorState> {
  const processes = await Promise.all(getLocalProcessConfigs().map((config) => buildStatus(config)));
  return {
    generatedAt: new Date().toISOString(),
    processes
  };
}

export async function startLocalProcess(id: string) {
  const config = getLocalProcessConfig(id);
  if (!config) {
    throw new Error(`Unknown local process: ${id}`);
  }
  if (!config.managed) {
    throw new Error(`${config.name} is monitored only. Start it from the desktop launcher.`);
  }

  const registry = getRegistry();
  const current = await buildStatus(config);
  if (current.status === "running" || current.status === "starting") {
    return current;
  }

  const spawnConfig = resolveSpawnConfig(config);
  const cwd = resolveCwd(config);
  appendLog(config.id, `\n[${new Date().toISOString()}] Starting ${config.name}: ${spawnConfig.command} ${spawnConfig.args.join(" ")}\n`);

  const child = spawn(spawnConfig.command, spawnConfig.args, {
    cwd,
    env: {
      ...process.env,
      ...config.env
    },
    windowsHide: true
  });

  const runtime: ManagedRuntime = {
    child,
    status: "starting",
    startedAt: Date.now(),
    lastExitCode: null
  };
  registry.set(config.id, runtime);

  child.stdout.on("data", (chunk) => appendLog(config.id, chunk.toString()));
  child.stderr.on("data", (chunk) => appendLog(config.id, chunk.toString()));
  child.on("error", (error) => {
    runtime.status = "stopped";
    runtime.stoppedAt = Date.now();
    runtime.lastExitCode = 1;
    appendLog(config.id, `[${new Date().toISOString()}] Failed to start: ${error.message}\n`);
  });
  child.on("spawn", () => {
    runtime.status = "running";
    appendLog(config.id, `[${new Date().toISOString()}] Started with PID ${child.pid}\n`);
  });
  child.on("exit", (code) => {
    runtime.status = "stopped";
    runtime.stoppedAt = Date.now();
    runtime.lastExitCode = code;
    appendLog(config.id, `[${new Date().toISOString()}] Exited with code ${code ?? "unknown"}\n`);
  });

  return buildStatus(config);
}

export async function stopLocalProcess(id: string) {
  const config = getLocalProcessConfig(id);
  if (!config) {
    throw new Error(`Unknown local process: ${id}`);
  }
  if (!config.managed) {
    throw new Error(`${config.name} is monitored only. Stop it from the terminal window or launcher.`);
  }

  const registry = getRegistry();
  const runtime = registry.get(id);
  if (!runtime?.child || runtime.status === "stopped") {
    if (await stopListeningPid(config.port)) {
      appendLog(id, `[${new Date().toISOString()}] Stopped adopted process on port ${config.port}\n`);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    return buildStatus(config);
  }

  appendLog(id, `[${new Date().toISOString()}] Stop requested\n`);
  runtime.child.kill();
  runtime.status = "stopped";
  runtime.stoppedAt = Date.now();
  return buildStatus(config);
}

export async function restartLocalProcess(id: string) {
  await stopLocalProcess(id);
  await new Promise((resolve) => setTimeout(resolve, 600));
  return startLocalProcess(id);
}

export function readLocalProcessLogs(id: string, maxBytes = 24000) {
  const config = getLocalProcessConfig(id);
  if (!config) {
    throw new Error(`Unknown local process: ${id}`);
  }

  const logPath = getLogPath(id);
  if (!fs.existsSync(logPath)) {
    return "";
  }

  const stat = fs.statSync(logPath);
  const start = Math.max(0, stat.size - maxBytes);
  const buffer = Buffer.alloc(stat.size - start);
  const fd = fs.openSync(logPath, "r");
  try {
    fs.readSync(fd, buffer, 0, buffer.length, start);
    return buffer.toString("utf-8");
  } finally {
    fs.closeSync(fd);
  }
}
