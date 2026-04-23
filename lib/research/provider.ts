import { assetCatalog, strategyCatalog } from "@/lib/research/catalog";
import { composeSignal, createBacktestResult, generateMockHistory } from "@/lib/research/engine";
import { Asset, BacktestResult, PricePoint, Signal, StrategyId } from "@/lib/types";

export interface ResearchDataProvider {
  listAssets(): Asset[];
  getAsset(symbol: string): Asset | undefined;
  getHistory(symbol: string, days?: number): PricePoint[];
  getDashboardSignals(): Signal[];
  runBacktest(symbol: string, strategyId: StrategyId): BacktestResult;
}

class MockResearchProvider implements ResearchDataProvider {
  private readonly historyCache = new Map<string, PricePoint[]>();
  private readonly signalCache = new Map<string, Signal>();

  listAssets() {
    return assetCatalog;
  }

  getAsset(symbol: string) {
    const decoded = decodeURIComponent(symbol);
    return assetCatalog.find((asset) => asset.symbol === decoded);
  }

  getHistory(symbol: string, days = 420) {
    const asset = this.getAsset(symbol) ?? assetCatalog[0];
    const cacheKey = asset.symbol;

    if (!this.historyCache.has(cacheKey)) {
      this.historyCache.set(cacheKey, generateMockHistory(asset, 420));
    }

    const history = this.historyCache.get(cacheKey)!;
    return history.slice(-Math.min(days, history.length));
  }

  getDashboardSignals() {
    return assetCatalog
      .map((asset) => {
        if (!this.signalCache.has(asset.symbol)) {
          const history = this.getHistory(asset.symbol, 420);
          this.signalCache.set(asset.symbol, composeSignal(asset, history, strategyCatalog));
        }

        return this.signalCache.get(asset.symbol)!;
      })
      .sort((a, b) => b.score - a.score);
  }

  runBacktest(symbol: string, strategyId: StrategyId) {
    const asset = this.getAsset(symbol) ?? assetCatalog[0];
    const strategy = strategyCatalog.find((item) => item.id === strategyId) ?? strategyCatalog[0];
    const history = this.getHistory(asset.symbol, 420);

    return createBacktestResult(asset.symbol, strategy, history, asset.strategyBias[strategy.id]);
  }
}

// This singleton keeps v1 local-first and deterministic. A future Vercel API
// route or Supabase-backed adapter can implement the same interface without
// forcing page components to change.
export const researchProvider: ResearchDataProvider = new MockResearchProvider();
