import fs from "fs";
import path from "path";
import { AlertTriangle, CalendarClock, Database, FileText, ShieldCheck, TrendingUp, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

type ReportOpportunity = {
  id?: string;
  title: string;
  assetType?: string;
  assetRef?: string;
  riskLevel?: string;
  driver?: string;
  whyNow?: string;
  scoreBreakdown?: {
    composite?: number;
    longTerm?: number;
    shortTerm?: number;
    defensiveness?: number;
    fundamentalQuality?: number;
    marketStrength?: number;
  };
  thesisInvalidation?: string[];
};

type ResearchReport = {
  metadata?: {
    generatedAt?: string;
    dataProvider?: string;
    providerMode?: string;
    fallbackTriggered?: boolean;
    fallbackReason?: string;
    selectedProvider?: string;
    bridgeUrl?: string;
    realSymbolsLoaded?: number;
    symbolsScanned?: number;
    themesScanned?: number;
    fundsScanned?: number;
    durationSeconds?: number;
  };
  marketLeadership?: {
    topThemesToday?: string[];
    topThemes5Day?: string[];
    topThemes20Day?: string[];
    marketNarrative?: string;
    driverNarrative?: string;
    overallBreadth?: number;
    averageQuality?: number;
  };
  opportunities?: {
    dividendDefensive?: ReportOpportunity[];
    longTerm?: ReportOpportunity[];
    shortTerm?: ReportOpportunity[];
  };
  bearishEvidence?: string[];
  invalidationConditions?: string[];
  safetyNotice?: string[];
};

type LatestReport =
  | { exists: true; json?: ResearchReport; markdown?: string; source: string; updatedAt: string }
  | { exists: false };

function readIfExists(filePath: string) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : undefined;
}

function getLatestReport(): LatestReport {
  const reportsDir = path.join(process.cwd(), "reports");
  const jsonCandidates = ["latest.json", "latest-report.json"].map((file) => path.join(reportsDir, file));
  const mdCandidates = ["latest.md", "latest-report.md"].map((file) => path.join(reportsDir, file));

  const jsonPath = jsonCandidates.find((file) => fs.existsSync(file));
  const mdPath = mdCandidates.find((file) => fs.existsSync(file));

  if (!jsonPath && !mdPath) {
    return { exists: false };
  }

  let json: ResearchReport | undefined;
  if (jsonPath) {
    try {
      json = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as ResearchReport;
    } catch (error) {
      console.error("Failed to parse latest research report JSON:", error);
    }
  }

  const sourcePath = jsonPath ?? mdPath!;
  return {
    exists: true,
    json,
    markdown: mdPath ? readIfExists(mdPath) : undefined,
    source: path.basename(sourcePath),
    updatedAt: fs.statSync(sourcePath).mtime.toISOString()
  };
}

function formatScore(value?: number) {
  return typeof value === "number" ? `${value.toFixed(1)}` : "-";
}

function formatPercent(value?: number) {
  return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "-";
}

function labelRisk(value?: string) {
  if (value === "low") return "低";
  if (value === "medium") return "中";
  if (value === "high") return "高";
  if (value === "very-high") return "极高";
  return value ?? "-";
}

function Card({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <section className="surface p-5">
      <div className="flex items-center gap-2 text-cyan">
        {icon}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function OpportunityList({ items, scoreKey }: { items?: ReportOpportunity[]; scoreKey: "longTerm" | "shortTerm" | "defensiveness" }) {
  const list = items?.slice(0, 6) ?? [];

  if (!list.length) {
    return <p className="text-sm text-slate-500">暂无符合条件的对象。</p>;
  }

  return (
    <div className="space-y-3">
      {list.map((item, index) => (
        <div key={item.id ?? `${item.title}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {item.assetType ?? "asset"} {item.assetRef ? `· ${item.assetRef}` : ""} · 风险 {labelRisk(item.riskLevel)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{scoreKey}</p>
              <p className="text-lg font-bold text-white">{formatScore(item.scoreBreakdown?.[scoreKey])}</p>
            </div>
          </div>
          {item.whyNow && <p className="mt-3 text-xs leading-5 text-slate-400">{item.whyNow}</p>}
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const latest = getLatestReport();

  if (!latest.exists) {
    return (
      <div className="space-y-6">
        <section className="surface-strong p-6">
          <div className="eyebrow border-cyan/25 bg-cyan/10 text-cyan">
            <FileText className="h-4 w-4" />
            研究日报
          </div>
          <h1 className="page-title mt-4">暂无研究日报</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            当前没有找到 <code>reports/latest.json</code>、<code>reports/latest.md</code> 或兼容的 latest-report 文件。
          </p>
        </section>

        <div className="surface p-6">
          <p className="text-sm text-slate-300">请在本地运行：</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-cyan">npm run research:nightly</pre>
          <p className="mt-3 text-xs leading-5 text-slate-500">如果要使用 Akshare，请先启动 bridge，并设置 DATA_PROVIDER=akshare 与 AKSHARE_API_URL。</p>
        </div>
      </div>
    );
  }

  const report = latest.json;
  const metadata = report?.metadata;
  const leadership = report?.marketLeadership;

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow border-cyan/25 bg-cyan/10 text-cyan">
              <FileText className="h-4 w-4" />
              研究日报
            </div>
            <h1 className="page-title mt-4">A股研究日报</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              汇总夜间研究流程生成的主线、机会、风险和失效条件。仅用于复盘和跟踪，不构成投资建议。
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <p className="text-xs text-slate-500">Report Source</p>
            <p className="mt-1 font-semibold text-white">{latest.source}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(latest.updatedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <Card title="生成时间" icon={<CalendarClock className="h-4 w-4" />}>
          <p className="text-lg font-bold text-white">{metadata?.generatedAt ?? new Date(latest.updatedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</p>
        </Card>
        <Card title="数据状态" icon={<Database className="h-4 w-4" />}>
          <p className="text-lg font-bold text-white">{metadata?.dataProvider ?? "未知"}</p>
          <p className="mt-1 text-xs text-slate-500">{metadata?.providerMode ?? "-"} · fallback {metadata?.fallbackTriggered ? "yes" : "no"}</p>
        </Card>
        <Card title="真实标的数" icon={<TrendingUp className="h-4 w-4" />}>
          <p className="text-lg font-bold text-white">{metadata?.realSymbolsLoaded ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">扫描 {metadata?.symbolsScanned ?? 0} 只标的</p>
        </Card>
        <Card title="运行耗时" icon={<Zap className="h-4 w-4" />}>
          <p className="text-lg font-bold text-white">{metadata?.durationSeconds?.toFixed(1) ?? "-"}s</p>
        </Card>
      </section>

      {metadata?.fallbackTriggered && (
        <div className="rounded-xl border border-amber/20 bg-amber/10 p-4 text-sm text-amber">
          当前日报使用了 fallback。原因：{metadata.fallbackReason ?? "数据源不可用或未配置。"}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card title="市场主线 Top Themes" icon={<TrendingUp className="h-4 w-4" />}>
          <div className="grid gap-4 md:grid-cols-3">
            <ThemeColumn title="最近交易日" items={leadership?.topThemesToday} />
            <ThemeColumn title="5日" items={leadership?.topThemes5Day} />
            <ThemeColumn title="20日" items={leadership?.topThemes20Day} />
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
            <p>{leadership?.marketNarrative ?? "暂无市场叙事。"}</p>
            <p className="mt-2 text-slate-500">整体广度 {formatPercent(leadership?.overallBreadth)} · 平均质量 {formatScore(leadership?.averageQuality)}</p>
          </div>
        </Card>

        <Card title="风险与失效条件" icon={<AlertTriangle className="h-4 w-4" />}>
          <div className="space-y-2">
            {(report?.invalidationConditions?.slice(0, 8) ?? ["暂无结构化失效条件。"]).map((item) => (
              <p key={item} className="rounded-lg border border-rose/10 bg-rose/5 px-3 py-2 text-xs leading-5 text-rose/90">
                {item}
              </p>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card title="长线机会" icon={<ShieldCheck className="h-4 w-4" />}>
          <OpportunityList items={report?.opportunities?.longTerm} scoreKey="longTerm" />
        </Card>
        <Card title="短线机会" icon={<Zap className="h-4 w-4" />}>
          <OpportunityList items={report?.opportunities?.shortTerm} scoreKey="shortTerm" />
        </Card>
        <Card title="股息/防御候选" icon={<ShieldCheck className="h-4 w-4" />}>
          <OpportunityList items={report?.opportunities?.dividendDefensive} scoreKey="defensiveness" />
        </Card>
      </section>

      {!report && latest.markdown && (
        <Card title="Markdown 报告" icon={<FileText className="h-4 w-4" />}>
          <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-slate-300">
            {latest.markdown}
          </pre>
        </Card>
      )}
    </div>
  );
}

function ThemeColumn({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <div className="mt-3 space-y-2">
        {(items?.slice(0, 5) ?? ["暂无"]).map((item, index) => (
          <p key={`${item}-${index}`} className="text-sm font-medium text-white">
            {index + 1}. {item}
          </p>
        ))}
      </div>
    </div>
  );
}
