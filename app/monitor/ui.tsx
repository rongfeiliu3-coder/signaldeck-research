"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Activity, AlertTriangle, Play, RefreshCw, RotateCcw, Square, Terminal } from "lucide-react";
import type { LocalProcessStatus, LocalSupervisorState } from "@/lib/local-supervisor/types";
import { cn } from "@/lib/utils";

const statusCopy: Record<LocalProcessStatus["status"], string> = {
  running: "运行中",
  stopped: "已停止",
  starting: "启动中",
  unhealthy: "健康异常",
  unknown: "未知"
};

const statusClass: Record<LocalProcessStatus["status"], string> = {
  running: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  stopped: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  starting: "border-cyan/25 bg-cyan/10 text-cyan",
  unhealthy: "border-amber/25 bg-amber/10 text-amber",
  unknown: "border-slate-500/20 bg-slate-500/10 text-slate-400"
};

async function fetchState() {
  const response = await fetch("/api/local/processes", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("无法读取本地运行状态");
  }
  return (await response.json()) as LocalSupervisorState;
}

async function fetchLogs(id: string) {
  const response = await fetch(`/api/local/processes/${id}/logs`, { cache: "no-store" });
  if (!response.ok) {
    return "";
  }
  const payload = (await response.json()) as { logs?: string };
  return payload.logs ?? "";
}

function formatUptime(seconds?: number) {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function LocalMonitor() {
  const [state, setState] = useState<LocalSupervisorState | null>(null);
  const [selectedId, setSelectedId] = useState("akshare-bridge");
  const [logs, setLogs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = useMemo(() => state?.processes.find((item) => item.id === selectedId), [selectedId, state]);

  async function refresh() {
    try {
      const nextState = await fetchState();
      setState(nextState);
      setError(null);
      const targetId = nextState.processes.some((item) => item.id === selectedId) ? selectedId : nextState.processes[0]?.id;
      if (targetId) {
        setSelectedId(targetId);
        setLogs(await fetchLogs(targetId));
      }
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "刷新失败");
    }
  }

  async function runAction(id: string, action: "start" | "stop" | "restart") {
    startTransition(async () => {
      const response = await fetch(`/api/local/processes/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "操作失败");
      }
      await refresh();
    });
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void fetchLogs(selectedId).then(setLogs);
  }, [selectedId]);

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow border-cyan/25 bg-cyan/10 text-cyan">
              <Activity className="h-4 w-4" />
              本地运行控制台
            </div>
            <h1 className="page-title mt-4">运行监控</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              只管理本机白名单里的 Quantize 服务：前端状态、Akshare Bridge、研究日报任务。按钮操作不会执行任意命令。
            </p>
          </div>
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan hover:bg-cyan/15 disabled:opacity-60"
            disabled={isPending}
            onClick={() => void refresh()}
          >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            刷新状态
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose/20 bg-rose/10 p-4 text-sm text-rose">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        {(state?.processes ?? []).map((processItem) => (
          <article key={processItem.id} className="surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{processItem.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{processItem.description}</p>
              </div>
              <span className={cn("rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]", statusClass[processItem.status])}>
                {statusCopy[processItem.status]}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <Metric label="PID" value={processItem.pid?.toString() ?? "-"} />
              <Metric label="端口" value={processItem.port?.toString() ?? "-"} />
              <Metric label="运行时长" value={formatUptime(processItem.uptimeSeconds)} />
              <Metric label="健康检查" value={processItem.healthOk === undefined ? "-" : processItem.healthOk ? "正常" : "失败"} />
            </div>

            {processItem.healthMessage && <p className="mt-3 text-xs text-slate-500">{processItem.healthMessage}</p>}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!processItem.managed || processItem.status === "running" || isPending}
                onClick={() => runAction(processItem.id, "start")}
              >
                <Play className="h-3.5 w-3.5" />
                {processItem.kind === "job" ? "运行" : "启动"}
              </button>
              <button
                className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-cyan/20 bg-cyan/10 px-3 py-1.5 text-xs font-semibold text-cyan disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!processItem.managed || isPending}
                onClick={() => runAction(processItem.id, "restart")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {processItem.kind === "job" ? "重新运行" : "重启"}
              </button>
              <button
                className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-rose/20 bg-rose/10 px-3 py-1.5 text-xs font-semibold text-rose disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!processItem.managed || processItem.status === "stopped" || isPending}
                onClick={() => runAction(processItem.id, "stop")}
              >
                <Square className="h-3.5 w-3.5" />
                停止
              </button>
              <button
                className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                onClick={() => setSelectedId(processItem.id)}
              >
                <Terminal className="h-3.5 w-3.5" />
                看日志
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">实时日志</p>
            <p className="mt-1 text-xs text-slate-500">{selected?.name ?? selectedId} · 最近输出</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(state?.processes ?? []).map((item) => (
              <button
                key={item.id}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                  selectedId === item.id ? "border-cyan/25 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                )}
                onClick={() => setSelectedId(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <pre className="min-h-[320px] max-h-[560px] overflow-auto bg-black/40 p-5 font-mono text-xs leading-6 text-slate-300">
          {logs || "暂无日志。启动服务或运行任务后，这里会显示最近输出。"}
        </pre>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 font-number text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
