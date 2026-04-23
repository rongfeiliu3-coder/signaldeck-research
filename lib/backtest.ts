import { researchProvider } from "@/lib/research/provider";
import { StrategyId } from "@/lib/types";

export function runBacktest(symbol: string, strategyId: StrategyId) {
  return researchProvider.runBacktest(symbol, strategyId);
}
