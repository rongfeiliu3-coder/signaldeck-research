import { formatCurrency } from "@/lib/format";
import { LinePoint } from "@/lib/types";

export function PriceChart({
  data,
  title,
  stroke = "#5EDFFF",
  summary,
  valueLabel = "最新值",
  emptyLabel = "当前没有可展示的图表数据。"
}: {
  data: LinePoint[];
  title: string;
  stroke?: string;
  summary?: string;
  valueLabel?: string;
  emptyLabel?: string;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border border-white/10 bg-panel/80 p-5">
        <div className="flex min-h-[260px] items-center justify-center rounded-md border border-dashed border-white/10 bg-white/[0.02] text-sm text-slate-500">
          {emptyLabel}
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 300;
  const padding = 40;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = data[0];
  const latest = data[data.length - 1];
  const spread = max - min || 1;
  const yFor = (value: number) => height - padding - ((value - min) / spread) * (height - padding * 2);
  const path = data
    .map((point, index) => {
      const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${yFor(point.value).toFixed(2)}`;
    })
    .join(" ");
  const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = min + spread * ratio;
    return { value, y: yFor(value) };
  });
  const xLabels = [
    { label: first.date, x: padding, anchor: "start" as const },
    { label: data[Math.floor((data.length - 1) / 2)].date, x: width / 2, anchor: "middle" as const },
    { label: latest.date, x: width - padding, anchor: "end" as const }
  ];
  const areaPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="rounded-md border border-white/10 bg-panel/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {summary ? <p className="mt-1 text-sm text-slate-400">{summary}</p> : null}
        </div>
        <div className="text-right text-sm">
          <div className="text-slate-500">{valueLabel}</div>
          <div className="font-semibold text-white">{formatCurrency(latest.value)}</div>
        </div>
      </div>
      <svg className="mt-5 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        {grid.map((line) => (
          <g key={line.value}>
            <line x1={padding} x2={width - padding} y1={line.y} y2={line.y} stroke="rgba(255,255,255,0.08)" />
            <text x={width - padding} y={line.y - 6} fill="#94A3B8" fontSize="12" textAnchor="end">
              {formatCurrency(line.value)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill={stroke} fillOpacity="0.08" />
        <path d={path} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {xLabels.map((label) => (
          <text key={`${label.label}-${label.x}`} x={label.x} y={height - 10} fill="#94A3B8" fontSize="12" textAnchor={label.anchor}>
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
