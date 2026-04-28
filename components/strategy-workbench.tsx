"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, ArrowUpRight, BarChart, Brain, CheckCircle2, History, Shield, Target, TrendingUp, Zap } from "lucide-react";
import type { StrategyCandidate, StrategyId, StrategyModule } from "@/lib/types";

type StrategyMemory = Record<
  string,
  {
    status: "watching" | "testing" | "paused";
    note: string;
    updatedAt: string;
  }
>;

const memoryKey = "quantize.strategy.memory.v1";

function StrategyIcon({ id }: { id: StrategyId }) {
  switch (id) {
    case "high-dividend":
      return <Shield className="h-5 w-5 text-mint" />;
    case "theme-rotation":
      return <TrendingUp className="h-5 w-5 text-cyan" />;
    case "low-level-reversal":
      return <ArrowUpRight className="h-5 w-5 text-amber" />;
    case "short-term-sentiment":
      return <Zap className="h-5 w-5 text-rose" />;
    case "fundamental-quality":
      return <Target className="h-5 w-5 text-indigo-400" />;
    case "fund-exposure":
      return <BarChart className="h-5 w-5 text-slate-400" />;
    default:
      return <Zap className="h-5 w-5 text-slate-400" />;
  }
}

function percent(value = 0, digits = 1) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(digits)}%`;
}

function score(value = 0) {
  return `${value.toFixed(1)}/100`;
}

function riskClass(risk: string) {
  if (risk.includes("低")) return "border-mint/25 bg-mint/10 text-mint";
  if (risk.includes("高")) return "border-rose/25 bg-rose/10 text-rose";
  return "border-amber/25 bg-amber/10 text-amber";
}

function stageClass(stage = "") {
  if (stage.includes("确认")) return "border-cyan/30 bg-cyan/10 text-cyan";
  if (stage.includes("等待")) return "border-amber/30 bg-amber/10 text-amber";
  if (stage.includes("暂不")) return "border-slate-600 bg-slate-900 text-slate-400";
  return "border-white/10 bg-white/[0.04] text-slate-300";
}

function MemoryPanel({
  strategy,
  memory,
  onChange
}: {
  strategy: StrategyModule;
  memory: StrategyMemory[string];
  onChange: (next: StrategyMemory[string]) => void;
}) {
  const current = memory ?? { status: "watching", note: "", updatedAt: "" };

  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2 text-cyan">
        <Brain className="h-4 w-4" />
        <h2 className="text-base font-semibold text-white">策略记忆</h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">先保存在本机浏览器，用来记录你对这个策略的跟踪状态和复盘笔记。</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          ["watching", "观察中"],
          ["testing", "小样本验证"],
          ["paused", "暂停"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ ...current, status: value as StrategyMemory[string]["status"], updatedAt: new Date().toISOString() })}
            className={`focus-ring rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              current.status === value ? "border-cyan/40 bg-cyan/15 text-cyan" : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={current.note}
        onChange={(event) => onChange({ ...current, note: event.target.value, updatedAt: new Date().toISOString() })}
        placeholder={`记录 ${strategy.nameZh} 的观察：比如今天为什么跟踪、哪条信号失效、下次复盘看什么。`}
        className="mt-3 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan/40"
      />
      <p className="mt-2 text-[11px] text-slate-600">{current.updatedAt ? `上次更新：${new Date(current.updatedAt).toLocaleString("zh-CN")}` : "还没有记录"}</p>
    </div>
  );
}

function BacktestPanel({ strategy }: { strategy: StrategyModule }) {
  const backtest = strategy.backtest;
  if (!backtest) return null;

  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2 text-cyan">
        <History className="h-4 w-4" />
        <h2 className="text-base font-semibold text-white">轻量历史回测</h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">基于当前研究池候选对象的20日窗口代理，优先看方向有效性、最大回撤和样本稳定性。</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="累计表现" value={percent(backtest.cumulativeReturn)} />
        <Metric label="最大历史回撤" value={percent(-backtest.maxDrawdown)} tone="risk" />
        <Metric label="胜率代理" value={`${(backtest.hitRate * 100).toFixed(0)}%`} />
        <Metric label="样本数" value={`${backtest.sampleSize}`} />
        <Metric label="平均窗口收益" value={percent(backtest.averageReturn)} />
        <Metric label="波动率代理" value={`${(backtest.volatility * 100).toFixed(1)}%`} />
        <Metric label="最好窗口" value={percent(backtest.bestPeriod)} />
        <Metric label="最差窗口" value={percent(backtest.worstPeriod)} tone="risk" />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <EvidenceBox title="支持证据" items={backtest.evidence} icon={<CheckCircle2 className="h-4 w-4 text-mint" />} />
        <EvidenceBox title="回测限制" items={backtest.limitations} icon={<AlertCircle className="h-4 w-4 text-amber" />} />
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "risk" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${tone === "risk" ? "text-rose" : "text-white"}`}>{value}</p>
    </div>
  );
}

function EvidenceBox({ title, items, icon }: { title: string; items?: string[]; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {(items?.length ? items : ["暂无结构化证据"]).map((item) => (
          <p key={item} className="text-xs leading-5 text-slate-400">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function TimingPanel({ candidate }: { candidate: StrategyCandidate }) {
  return (
    <div className="surface-strong p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Entry Timing</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{candidate.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{candidate.symbol}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stageClass(candidate.entryStage)}`}>{candidate.entryStage}</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Metric label="建仓时机分" value={score(candidate.entryScore)} />
        <Metric label="策略候选分" value={score(candidate.score)} />
        <Metric label="资产类型" value={candidate.assetType === "theme" ? "主题" : candidate.assetType === "fund" ? "基金篮子" : "股票"} />
      </div>

      <div className="mt-5 rounded-xl border border-cyan/15 bg-cyan/10 p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-cyan">建仓时机判断</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{candidate.entryAction}</p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <EvidenceBox title="分批观察计划" items={candidate.positionPlan} icon={<Target className="h-4 w-4 text-cyan" />} />
        <EvidenceBox title="触发信号" items={candidate.triggerSignals} icon={<CheckCircle2 className="h-4 w-4 text-mint" />} />
        <EvidenceBox title="等待条件" items={candidate.waitForSignals} icon={<History className="h-4 w-4 text-amber" />} />
        <EvidenceBox title="失效条件" items={candidate.invalidationSignals} icon={<AlertCircle className="h-4 w-4 text-rose" />} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <EvidenceBox title="支持证据" items={candidate.evidence} icon={<CheckCircle2 className="h-4 w-4 text-mint" />} />
        <EvidenceBox title="反证与风险" items={[...(candidate.counterEvidence ?? []), ...(candidate.riskNotes ?? [])]} icon={<AlertCircle className="h-4 w-4 text-amber" />} />
      </div>
    </div>
  );
}

export function StrategyWorkbench({ strategies, asOfDate, providerMode }: { strategies: StrategyModule[]; asOfDate: string; providerMode: string }) {
  const firstUsableStrategy = useMemo(() => strategies.find((strategy) => strategy.candidates.length > 0) ?? strategies[0], [strategies]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyId>(firstUsableStrategy?.id ?? "theme-rotation");
  const selectedStrategy = useMemo(
    () => strategies.find((strategy) => strategy.id === selectedStrategyId) ?? firstUsableStrategy,
    [firstUsableStrategy, selectedStrategyId, strategies]
  );
  const [selectedCandidateSymbol, setSelectedCandidateSymbol] = useState(firstUsableStrategy?.candidates[0]?.symbol ?? "");
  const [memory, setMemory] = useState<StrategyMemory>({});

  useEffect(() => {
    const raw = window.localStorage.getItem(memoryKey);
    if (raw) {
      try {
        setMemory(JSON.parse(raw) as StrategyMemory);
      } catch {
        setMemory({});
      }
    }
  }, []);

  useEffect(() => {
    const firstCandidate = selectedStrategy?.candidates[0]?.symbol ?? "";
    setSelectedCandidateSymbol(firstCandidate);
  }, [selectedStrategy?.id, selectedStrategy?.candidates]);

  const selectedCandidate = useMemo(
    () => selectedStrategy?.candidates.find((candidate) => candidate.symbol === selectedCandidateSymbol) ?? selectedStrategy?.candidates[0],
    [selectedCandidateSymbol, selectedStrategy]
  );

  function updateMemory(strategyId: string, next: StrategyMemory[string]) {
    setMemory((previous) => {
      const updated = { ...previous, [strategyId]: next };
      window.localStorage.setItem(memoryKey, JSON.stringify(updated));
      return updated;
    });
  }

  if (!selectedStrategy || !selectedCandidate) {
    return (
      <div className="space-y-4">
        <div className="surface p-6 text-sm text-slate-400">
          当前策略没有候选样本。可以切换到其他策略，或扩大主题篮子后再刷新。
        </div>
        <div className="surface p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Strategy Selector</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                onClick={() => setSelectedStrategyId(strategy.id)}
                className="focus-ring rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/20"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/20">
                    <StrategyIcon id={strategy.id} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{strategy.nameZh}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{strategy.candidates.length} 个候选</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow border-cyan/25 bg-cyan/10 text-cyan">
              <Zap className="h-4 w-4" />
              策略库
            </div>
            <h1 className="page-title mt-4">建仓时机与策略验证</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              用规则评分判断何时进入观察/确认区，并用轻量历史回测检查策略是否值得继续跟踪。所有结论仅作研究辅助，不构成直接投资建议。
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <p className="text-xs text-slate-500">Data</p>
            <p className="mt-1 font-semibold text-white">{providerMode === "live" ? "Akshare Live" : "Mock Fallback"}</p>
            <p className="mt-1 text-xs text-slate-500">{asOfDate}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="surface p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Strategy Selector</p>
            <div className="mt-3 grid gap-2">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => setSelectedStrategyId(strategy.id)}
                  className={`focus-ring flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    strategy.id === selectedStrategy.id ? "border-cyan/40 bg-cyan/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/20">
                      <StrategyIcon id={strategy.id} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{strategy.nameZh}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{strategy.horizonZh}</span>
                    </span>
                  </span>
                  <span className={`rounded px-2 py-1 text-[11px] font-semibold ${riskClass(strategy.riskZh)}`}>{strategy.riskZh}</span>
                </button>
              ))}
            </div>
          </div>

          <MemoryPanel
            strategy={selectedStrategy}
            memory={memory[selectedStrategy.id]}
            onChange={(next) => updateMemory(selectedStrategy.id, next)}
          />
        </div>

        <div className="space-y-4">
          <div className="surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Candidate Selector</p>
                <h2 className="mt-1 text-lg font-bold text-white">{selectedStrategy.nameZh}</h2>
              </div>
              <select
                value={selectedCandidate.symbol}
                onChange={(event) => setSelectedCandidateSymbol(event.target.value)}
                className="focus-ring rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              >
                {selectedStrategy.candidates.map((candidate) => (
                  <option key={candidate.symbol} value={candidate.symbol}>
                    {candidate.name} · {candidate.entryStage}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="terminal-table w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr>
                    <th>候选</th>
                    <th>时机分</th>
                    <th>阶段</th>
                    <th>动量</th>
                    <th>质量</th>
                    <th>入选原因</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStrategy.candidates.map((candidate) => (
                    <tr
                      key={candidate.symbol}
                      onClick={() => setSelectedCandidateSymbol(candidate.symbol)}
                      className={`cursor-pointer transition hover:bg-white/[0.04] ${candidate.symbol === selectedCandidate.symbol ? "bg-cyan/10" : ""}`}
                    >
                      <td>
                        <span className="block font-semibold text-white">{candidate.name}</span>
                        <span className="text-[11px] text-slate-500">{candidate.symbol}</span>
                      </td>
                      <td>{score(candidate.entryScore)}</td>
                      <td>
                        <span className={`rounded border px-2 py-1 ${stageClass(candidate.entryStage)}`}>{candidate.entryStage}</span>
                      </td>
                      <td>{score(candidate.metrics?.momentum)}</td>
                      <td>{score(candidate.metrics?.quality)}</td>
                      <td className="max-w-sm text-slate-400">{candidate.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <TimingPanel candidate={selectedCandidate} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <BacktestPanel strategy={selectedStrategy} />
        <div className="surface p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Timing Rules</p>
          <h2 className="mt-2 text-lg font-bold text-white">建仓规则框架</h2>
          <div className="mt-4 space-y-3">
            <EvidenceBox title="进入观察" items={[selectedStrategy.timingFramework?.entryRule ?? "暂无"]} icon={<Target className="h-4 w-4 text-cyan" />} />
            <EvidenceBox title="加仓确认" items={[selectedStrategy.timingFramework?.addRule ?? "暂无"]} icon={<CheckCircle2 className="h-4 w-4 text-mint" />} />
            <EvidenceBox title="降权/退出" items={[selectedStrategy.timingFramework?.reduceRule ?? "暂无", selectedStrategy.timingFramework?.avoidRule ?? "暂无"]} icon={<AlertCircle className="h-4 w-4 text-rose" />} />
          </div>
        </div>
      </section>
    </div>
  );
}
