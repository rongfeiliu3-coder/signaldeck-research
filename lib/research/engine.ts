import { movingAverage, relativeStrengthIndex, rollingHigh } from "@/lib/indicators";
import { Asset, BacktestResult, BacktestTrade, PricePoint, Signal, Strategy, StrategyId } from "@/lib/types";

type StrategyMetrics = Signal["metrics"] & {
  averageHoldingPeriod: number;
  equityCurve: PricePoint[];
  trades: BacktestTrade[];
  exposureRate: number;
  latestSignalActive: boolean;
  latestSignalDate: string;
};

function hashSymbol(symbol: string) {
  return symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function oscillation(index: number, seed: number, speed: number, phase = 0) {
  return Math.sin(index * speed + seed + phase);
}

export function generateMockHistory(asset: Asset, days = 420): PricePoint[] {
  const seed = hashSymbol(asset.symbol);
  const seedFloat = seed / 37;
  const endDate = new Date("2026-04-23T00:00:00Z");
  const points: PricePoint[] = [];
  const macroAnchor = asset.basePrice * (0.86 + (seed % 7) * 0.015);

  let price = macroAnchor;
  let anchor = macroAnchor;

  for (let index = 0; index < days; index += 1) {
    const date = new Date(endDate);
    date.setUTCDate(endDate.getUTCDate() - (days - index - 1));

    const marketCycle =
      oscillation(index, seedFloat, 0.028) * 0.0036 +
      oscillation(index, seedFloat, 0.071, 0.9) * 0.0022;
    const regime =
      oscillation(index, seedFloat, 0.012, 1.4) * 0.65 +
      oscillation(index, seedFloat, 0.006, -0.5) * 0.35;
    const eventShock =
      oscillation(index, seedFloat, 0.18, 0.3) * asset.volatility * 0.22 +
      oscillation(index, seedFloat, 0.33, -0.8) * asset.volatility * 0.08;

    anchor *= 1 + asset.trend + marketCycle * 0.5;
    const meanReversion = ((anchor - price) / anchor) * asset.meanReversion * 6;
    const drift = asset.trend * (0.45 + regime) + marketCycle * asset.marketBeta + meanReversion;
    const dailyReturn = drift + eventShock;

    price = Math.max(1, price * (1 + dailyReturn));

    points.push({
      date: date.toISOString().slice(0, 10),
      close: Number(price.toFixed(asset.basePrice > 1000 ? 0 : 2))
    });
  }

  return points;
}

function strategySignal(points: PricePoint[], strategyId: StrategyId) {
  const closes = points.map((point) => point.close);

  if (strategyId === "dual-ma") {
    const fast = movingAverage(closes, 20);
    const slow = movingAverage(closes, 65);
    return closes.map((_, index) => Boolean(fast[index] && slow[index] && fast[index]! > slow[index]!));
  }

  if (strategyId === "rsi-mean-reversion") {
    const rsi = relativeStrengthIndex(closes, 14);
    let long = false;

    return closes.map((_, index) => {
      if (rsi[index] !== null && rsi[index]! < 34) long = true;
      if (rsi[index] !== null && rsi[index]! > 61) long = false;
      return long;
    });
  }

  const highs = rollingHigh(points, 252);
  const trend = movingAverage(closes, 50);
  return closes.map((close, index) => Boolean(highs[index] && trend[index] && close > highs[index]! && close > trend[index]!));
}

function maxDrawdown(equityCurve: PricePoint[]) {
  let peak = equityCurve[0]?.close ?? 1;
  let worst = 0;

  for (const point of equityCurve) {
    peak = Math.max(peak, point.close);
    worst = Math.min(worst, (point.close - peak) / peak);
  }

  return worst;
}

function sharpeRatio(dailyReturns: number[]) {
  const activeReturns = dailyReturns.filter((value) => Number.isFinite(value));
  if (activeReturns.length < 2) return 0;

  const average = activeReturns.reduce((sum, value) => sum + value, 0) / activeReturns.length;
  const variance = activeReturns.reduce((sum, value) => sum + (value - average) ** 2, 0) / (activeReturns.length - 1);
  const stdev = Math.sqrt(variance);

  return stdev === 0 ? 0 : (average / stdev) * Math.sqrt(252);
}

export function calculateStrategyMetrics(points: PricePoint[], strategy: Strategy, bias = 1): StrategyMetrics {
  const positionFlags = strategySignal(points, strategy.id);
  const equityCurve: PricePoint[] = [{ date: points[0].date, close: 10000 }];
  const dailyReturns: number[] = [];
  const trades: BacktestTrade[] = [];

  let equity = 10000;
  let inPosition = false;
  let exposureDays = 0;
  let entryDate = points[0].date;
  let entryPrice = points[0].close;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const shouldHold = positionFlags[index - 1];
    const nextHold = positionFlags[index];

    if (!inPosition && nextHold) {
      inPosition = true;
      entryDate = current.date;
      entryPrice = current.close;
    }

    const strategyReturn = shouldHold ? ((current.close - previous.close) / previous.close) * bias : 0;
    if (shouldHold) exposureDays += 1;

    equity *= 1 + strategyReturn;
    dailyReturns.push(strategyReturn);

    if (inPosition && !nextHold) {
      trades.push({
        entryDate,
        exitDate: current.date,
        entryPrice,
        exitPrice: current.close,
        returnPct: (current.close - entryPrice) / entryPrice,
        holdingDays: Math.max(1, Math.round((Date.parse(current.date) - Date.parse(entryDate)) / 86400000))
      });
      inPosition = false;
    }

    equityCurve.push({ date: current.date, close: Number(equity.toFixed(2)) });
  }

  if (inPosition) {
    const last = points[points.length - 1];
    trades.push({
      entryDate,
      exitDate: last.date,
      entryPrice,
      exitPrice: last.close,
      returnPct: (last.close - entryPrice) / entryPrice,
      holdingDays: Math.max(1, Math.round((Date.parse(last.date) - Date.parse(entryDate)) / 86400000))
    });
  }

  const winningTrades = trades.filter((trade) => trade.returnPct > 0).length;
  const tradeCount = trades.length;

  return {
    cumulativeReturn: equity / 10000 - 1,
    maxDrawdown: maxDrawdown(equityCurve),
    sharpeRatio: sharpeRatio(dailyReturns),
    winRate: tradeCount ? winningTrades / tradeCount : 0,
    tradeCount,
    averageHoldingPeriod: tradeCount
      ? trades.reduce((sum, trade) => sum + trade.holdingDays, 0) / tradeCount
      : 0,
    equityCurve,
    trades,
    exposureRate: exposureDays / Math.max(1, points.length - 1),
    latestSignalActive: positionFlags[positionFlags.length - 1] ?? false,
    latestSignalDate: points[points.length - 1]?.date ?? ""
  };
}

export function composeSignal(asset: Asset, history: PricePoint[], strategies: Strategy[]): Signal {
  const latest = history[history.length - 1];
  const prior = history[history.length - 2];
  const changePct = ((latest.close - prior.close) / prior.close) * 100;
  const strategyMetrics = strategies.map((strategy) => ({
    strategyId: strategy.id,
    metrics: calculateStrategyMetrics(history, strategy, asset.strategyBias[strategy.id])
  }));

  const ranked = strategyMetrics
    .map((item) => {
      const performanceScore =
        item.metrics.cumulativeReturn * 110 +
        item.metrics.sharpeRatio * 7 -
        Math.abs(item.metrics.maxDrawdown) * 90 +
        item.metrics.winRate * 12 +
        item.metrics.exposureRate * 8 +
        asset.strategyBias[item.strategyId] * 5;

      const positionBoost = item.metrics.latestSignalActive ? 9 : -4;

      return {
        ...item,
        score: performanceScore + positionBoost + changePct * 1.5
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const score = Math.round(
    Math.max(
      39,
      Math.min(
        93,
        58 +
          best.metrics.cumulativeReturn * 100 +
          best.metrics.sharpeRatio * 6 -
          Math.abs(best.metrics.maxDrawdown) * 50 +
          best.metrics.winRate * 15 +
          (best.metrics.latestSignalActive ? 8 : -3)
      )
    )
  );

  const action: Signal["action"] =
    best.metrics.latestSignalActive && score >= 74
      ? "Buy"
      : best.metrics.latestSignalActive || score >= 58
        ? "Hold"
        : "Reduce";

  const rationaleKey: Signal["rationaleKey"] =
    action === "Buy" ? "constructive" : action === "Reduce" ? "weakened" : "mixed";

  return {
    symbol: asset.symbol,
    name: asset.name,
    action,
    score,
    strategyId: best.strategyId,
    rationaleKey,
    price: latest.close,
    changePct,
    history: history.slice(-90),
    metrics: {
      cumulativeReturn: best.metrics.cumulativeReturn,
      maxDrawdown: best.metrics.maxDrawdown,
      sharpeRatio: best.metrics.sharpeRatio,
      winRate: best.metrics.winRate,
      tradeCount: best.metrics.tradeCount
    }
  };
}

export function createBacktestResult(symbol: string, strategy: Strategy, history: PricePoint[], bias = 1): BacktestResult {
  const metrics = calculateStrategyMetrics(history, strategy, bias);

  return {
    symbol,
    strategy,
    equityCurve: metrics.equityCurve,
    trades: metrics.trades.slice(-8).reverse(),
    cumulativeReturn: metrics.cumulativeReturn,
    maxDrawdown: metrics.maxDrawdown,
    sharpeRatio: metrics.sharpeRatio,
    winRate: metrics.winRate,
    averageHoldingPeriod: metrics.averageHoldingPeriod,
    tradeCount: metrics.tradeCount,
    exposureRate: metrics.exposureRate,
    latestSignalActive: metrics.latestSignalActive,
    latestSignalDate: metrics.latestSignalDate
  };
}
