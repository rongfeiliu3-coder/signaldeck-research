export type AssetClass = "ETF" | "Equity" | "Crypto";

export type Asset = {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  description: string;
  watchlisted: boolean;
  basePrice: number;
  trend: number;
  volatility: number;
  marketBeta: number;
  meanReversion: number;
  strategyBias: Record<StrategyId, number>;
};

export type PricePoint = {
  date: string;
  close: number;
};

export type StrategyId = "dual-ma" | "rsi-mean-reversion" | "breakout-52w";

export type Strategy = {
  id: StrategyId;
  name: string;
  description: string;
};

export type SignalAction = "Buy" | "Hold" | "Reduce";

export type Signal = {
  symbol: string;
  name: string;
  action: SignalAction;
  score: number;
  strategyId: StrategyId;
  rationaleKey: "constructive" | "weakened" | "mixed";
  price: number;
  changePct: number;
  history: PricePoint[];
  metrics: {
    cumulativeReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    tradeCount: number;
  };
};

export type BacktestTrade = {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  holdingDays: number;
};

export type BacktestResult = {
  symbol: string;
  strategy: Strategy;
  equityCurve: PricePoint[];
  trades: BacktestTrade[];
  cumulativeReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  averageHoldingPeriod: number;
  tradeCount: number;
  exposureRate: number;
  latestSignalActive: boolean;
  latestSignalDate: string;
};
