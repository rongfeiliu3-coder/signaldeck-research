import { researchProvider } from "@/lib/research/provider";
import { assetCatalog, strategyCatalog } from "@/lib/research/catalog";

export const assets = assetCatalog;
export const strategies = strategyCatalog;

export function getAsset(symbol: string) {
  return researchProvider.getAsset(symbol);
}

export function getHistory(symbol: string, days = 420) {
  return researchProvider.getHistory(symbol, days);
}

export function getDashboardSignals() {
  return researchProvider.getDashboardSignals();
}

export function getMarketSummary() {
  const signals = researchProvider.getDashboardSignals();
  const buySignals = signals.filter((signal) => signal.action === "Buy").length;
  const averageSharpe =
    signals.reduce((sum, signal) => sum + signal.metrics.sharpeRatio, 0) / Math.max(1, signals.length);

  return [
    {
      label: "Tracked assets",
      value: String(assetCatalog.length),
      detail: "ETFs, equities, crypto",
      tone: "neutral" as const
    },
    {
      label: "Buy signals",
      value: String(buySignals),
      detail: "Aligned with current mock research state",
      tone: "positive" as const
    },
    {
      label: "Average Sharpe",
      value: averageSharpe.toFixed(2),
      detail: "Across top-ranked strategy per symbol",
      tone: averageSharpe >= 1 ? ("positive" as const) : ("neutral" as const)
    }
  ];
}
