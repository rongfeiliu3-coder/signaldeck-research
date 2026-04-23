"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { LinePoint } from "@/lib/types";

function pathFromData(data: LinePoint[], width: number, height: number, padding = 8) {
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  return data
    .map((point, index) => {
      const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.value - min) / spread) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Sparkline({
  data,
  height = 96,
  className,
  stroke = "#42E6A4",
  emptyLabel = "暂无样本数据"
}: {
  data: LinePoint[];
  height?: number;
  className?: string;
  stroke?: string;
  emptyLabel?: string;
}) {
  const gradientId = useId();
  if (!data.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-dashed border-white/10 bg-white/[0.02] text-sm text-slate-500",
          className
        )}
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  const width = 640;
  const path = pathFromData(data, width, height);
  const areaPath = `${path} L ${width - 8} ${height - 8} L 8 ${height - 8} Z`;

  return (
    <svg
      className={cn("w-full overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Trend chart"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}
