import { Asset, Strategy } from "@/lib/types";

export const assetCatalog: Asset[] = [
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    assetClass: "ETF",
    sector: "US broad market",
    description: "Large-cap US equity market proxy.",
    watchlisted: true,
    basePrice: 510,
    trend: 0.00036,
    volatility: 0.009,
    marketBeta: 1,
    meanReversion: 0.00008,
    strategyBias: {
      "dual-ma": 1.08,
      "rsi-mean-reversion": 0.95,
      "breakout-52w": 0.98
    }
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    assetClass: "ETF",
    sector: "US growth",
    description: "Nasdaq 100 technology-heavy equity proxy.",
    watchlisted: true,
    basePrice: 435,
    trend: 0.00048,
    volatility: 0.013,
    marketBeta: 1.18,
    meanReversion: 0.00005,
    strategyBias: {
      "dual-ma": 1.02,
      "rsi-mean-reversion": 1.04,
      "breakout-52w": 1.01
    }
  },
  {
    symbol: "IWM",
    name: "iShares Russell 2000 ETF",
    assetClass: "ETF",
    sector: "US small caps",
    description: "Small-cap US equity market proxy.",
    watchlisted: false,
    basePrice: 202,
    trend: 0.0002,
    volatility: 0.016,
    marketBeta: 1.14,
    meanReversion: 0.00012,
    strategyBias: {
      "dual-ma": 0.95,
      "rsi-mean-reversion": 1.03,
      "breakout-52w": 0.9
    }
  },
  {
    symbol: "TLT",
    name: "iShares 20+ Year Treasury Bond ETF",
    assetClass: "ETF",
    sector: "Rates",
    description: "Long-duration US Treasury exposure.",
    watchlisted: true,
    basePrice: 93,
    trend: 0.00006,
    volatility: 0.008,
    marketBeta: -0.25,
    meanReversion: 0.0002,
    strategyBias: {
      "dual-ma": 0.88,
      "rsi-mean-reversion": 1.12,
      "breakout-52w": 0.82
    }
  },
  {
    symbol: "GLD",
    name: "SPDR Gold Shares",
    assetClass: "ETF",
    sector: "Commodities",
    description: "Gold price exposure through a listed trust.",
    watchlisted: true,
    basePrice: 218,
    trend: 0.00024,
    volatility: 0.011,
    marketBeta: 0.2,
    meanReversion: 0.00016,
    strategyBias: {
      "dual-ma": 0.93,
      "rsi-mean-reversion": 1.08,
      "breakout-52w": 0.96
    }
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "Equity",
    sector: "Semiconductors",
    description: "AI infrastructure and accelerated computing leader.",
    watchlisted: true,
    basePrice: 880,
    trend: 0.00082,
    volatility: 0.024,
    marketBeta: 1.42,
    meanReversion: 0.00003,
    strategyBias: {
      "dual-ma": 1.01,
      "rsi-mean-reversion": 0.9,
      "breakout-52w": 1.14
    }
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "Equity",
    sector: "Consumer technology",
    description: "Consumer hardware, services, and ecosystem business.",
    watchlisted: false,
    basePrice: 184,
    trend: 0.00028,
    volatility: 0.014,
    marketBeta: 1.05,
    meanReversion: 0.00008,
    strategyBias: {
      "dual-ma": 1.03,
      "rsi-mean-reversion": 0.98,
      "breakout-52w": 0.97
    }
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    assetClass: "Equity",
    sector: "Electric vehicles",
    description: "Electric vehicles, energy storage, and autonomy platform.",
    watchlisted: true,
    basePrice: 176,
    trend: 0.00014,
    volatility: 0.029,
    marketBeta: 1.55,
    meanReversion: 0.00014,
    strategyBias: {
      "dual-ma": 0.88,
      "rsi-mean-reversion": 1.09,
      "breakout-52w": 0.95
    }
  },
  {
    symbol: "BTC-USD",
    name: "Bitcoin",
    assetClass: "Crypto",
    sector: "Digital assets",
    description: "Bitcoin quoted in US dollars.",
    watchlisted: true,
    basePrice: 67000,
    trend: 0.0007,
    volatility: 0.027,
    marketBeta: 0.72,
    meanReversion: 0.00004,
    strategyBias: {
      "dual-ma": 0.96,
      "rsi-mean-reversion": 0.92,
      "breakout-52w": 1.18
    }
  },
  {
    symbol: "ETH-USD",
    name: "Ethereum",
    assetClass: "Crypto",
    sector: "Digital assets",
    description: "Ethereum quoted in US dollars.",
    watchlisted: false,
    basePrice: 3400,
    trend: 0.00058,
    volatility: 0.03,
    marketBeta: 0.86,
    meanReversion: 0.00006,
    strategyBias: {
      "dual-ma": 0.94,
      "rsi-mean-reversion": 0.95,
      "breakout-52w": 1.13
    }
  }
];

export const strategyCatalog: Strategy[] = [
  {
    id: "dual-ma",
    name: "Dual Moving Average Crossover",
    description: "Long when the fast moving average is above the slow moving average."
  },
  {
    id: "rsi-mean-reversion",
    name: "RSI Mean Reversion",
    description: "Long after oversold RSI conditions, flat after overbought conditions."
  },
  {
    id: "breakout-52w",
    name: "52-week Breakout",
    description: "Long when price breaks above the prior 252-session high."
  }
];
