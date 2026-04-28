import { MarketWorkspace, StrategyModule, SecurityRecord, ThemeSnapshot, StrategyCandidate } from "@/lib/types";

export function buildStrategies(workspace: MarketWorkspace): StrategyModule[] {
  const allStocks = workspace.fundamentals.stocks;
  const allThemes = workspace.themes;

  const strategies: StrategyModule[] = [
    buildHighDividendStrategy(allStocks),
    buildThemeRotationStrategy(allThemes),
    buildLowLevelReversalStrategy(allStocks),
    buildShortTermSentimentStrategy(allStocks),
    buildFundamentalQualityStrategy(allStocks),
    buildFundExposureStrategy(workspace)
  ];

  return strategies;
}

function buildHighDividendStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates: StrategyCandidate[] = stocks
    .filter(s => s.fundamentals.dividendYield > 0.03)
    .sort((a, b) => b.fundamentals.dividendYield - a.fundamentals.dividendYield)
    .slice(0, 5)
    .map(s => ({
      symbol: s.symbol,
      name: s.name,
      reason: `股息率 ${(s.fundamentals.dividendYield * 100).toFixed(1)}% | 质量分 ${s.qualityScore?.toFixed(1)}`,
      score: s.qualityScore || 0
    }));

  return {
    id: "high-dividend",
    nameZh: "高股息防御策略",
    nameEn: "High Dividend Defensive",
    horizonZh: "长线",
    horizonEn: "Long-term",
    riskZh: "低风险",
    riskEn: "Low",
    scoringDimensions: ["股息率", "现金流", "负债率", "质量分"],
    candidates,
    whySelectedZh: "聚焦现金流充沛、分红稳定且具备低波动属性的优质国企或行业龙头。",
    whySelectedEn: "Focus on high cashflow, stable dividend, and low volatility state-owned or industry leaders.",
    invalidationZh: "市场无风险利率大幅上行，或公司基本面恶化导致分红能力下降。",
    invalidationEn: "Significant rise in risk-free rates or deteriorating fundamentals affecting dividend capacity."
  };
}

function buildThemeRotationStrategy(themes: ThemeSnapshot[]): StrategyModule {
  const candidates: StrategyCandidate[] = themes
    .sort((a, b) => b.leadership.today.heat - a.leadership.today.heat)
    .slice(0, 5)
    .map(t => ({
      symbol: t.slug,
      name: t.name,
      reason: `热度 ${t.leadership.today.heat.toFixed(1)} | 广度 ${(t.leadership.today.breadth * 100).toFixed(0)}%`,
      score: t.leadership.today.heat
    }));

  return {
    id: "theme-rotation",
    nameZh: "主题轮动策略",
    nameEn: "Theme Rotation",
    horizonZh: "短中线",
    horizonEn: "Short-to-Medium",
    riskZh: "中风险",
    riskEn: "Medium",
    scoringDimensions: ["热度", "广度", "换手变化", "集中度"],
    candidates,
    whySelectedZh: "跟踪市场资金流向，寻找具备高参与度、强动量且有叙事支撑的主线题材。",
    whySelectedEn: "Track capital flow to find themes with high participation, strong momentum, and narrative support.",
    invalidationZh: "成交额大幅萎缩，主线出现放量滞涨，或题材叙事被证伪。",
    invalidationEn: "Significant volume contraction, price stagnation with high volume, or narrative falsification."
  };
}

function buildLowLevelReversalStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates: StrategyCandidate[] = stocks
    .filter(s => s.return20d < -0.05 && s.return1d > 0.01)
    .sort((a, b) => b.turnoverDelta - a.turnoverDelta)
    .slice(0, 5)
    .map(s => ({
      symbol: s.symbol,
      name: s.name,
      reason: `20日跌幅 ${(s.return20d * 100).toFixed(1)}% | 换手异动 ${(s.turnoverDelta * 100).toFixed(1)}%`,
      score: s.momentumScore || 0
    }));

  return {
    id: "low-level-reversal",
    nameZh: "低位修复策略",
    nameEn: "Bottom Reversal",
    horizonZh: "中线",
    horizonEn: "Medium-term",
    riskZh: "中风险",
    riskEn: "Medium",
    scoringDimensions: ["超跌幅度", "底部放量", "动量修复", "基本面支撑"],
    candidates,
    whySelectedZh: "寻找前期超跌但近期资金开始回流、基本面边际改善的品种。",
    whySelectedEn: "Search for oversold assets with recent capital inflow and marginal fundamental improvement.",
    invalidationZh: "修复动能不足导致二次探底，或出现系统性下行风险。",
    invalidationEn: "Insufficient recovery momentum leading to re-testing bottoms or systemic risk."
  };
}

function buildShortTermSentimentStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates: StrategyCandidate[] = stocks
    .sort((a, b) => (b.momentumScore || 0) - (a.momentumScore || 0))
    .slice(0, 5)
    .map(s => ({
      symbol: s.symbol,
      name: s.name,
      reason: `动量分 ${s.momentumScore?.toFixed(1)} | 日涨幅 ${(s.return1d * 100).toFixed(1)}%`,
      score: s.momentumScore || 0
    }));

  return {
    id: "short-term-sentiment",
    nameZh: "短线情绪策略",
    nameEn: "Short-term Sentiment",
    horizonZh: "短线",
    horizonEn: "Short-term",
    riskZh: "高风险",
    riskEn: "High",
    scoringDimensions: ["日内强弱", "换手率", "涨停强度", "情绪温度"],
    candidates,
    whySelectedZh: "聚焦市场情绪高点，筛选具备强动量、高热度和快速轮动特征的标的。",
    whySelectedEn: "Focus on peak sentiment, screening for high momentum, heat, and rapid rotation targets.",
    invalidationZh: "情绪见顶回落，龙头断板或换手急剧衰减。",
    invalidationEn: "Sentiment peaking and reversing, leader failure, or sharp turnover decay."
  };
}

function buildFundamentalQualityStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates: StrategyCandidate[] = stocks
    .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))
    .slice(0, 5)
    .map(s => ({
      symbol: s.symbol,
      name: s.name,
      reason: `质量分 ${s.qualityScore?.toFixed(1)} | ROE ${(s.fundamentals.roe * 100).toFixed(1)}%`,
      score: s.qualityScore || 0
    }));

  return {
    id: "fundamental-quality",
    nameZh: "基本面质量策略",
    nameEn: "Fundamental Quality",
    horizonZh: "长线",
    horizonEn: "Long-term",
    riskZh: "低中风险",
    riskEn: "Low-to-Medium",
    scoringDimensions: ["ROE", "净利增速", "营收增速", "现金流质量"],
    candidates,
    whySelectedZh: "优选基本面极佳、具备行业壁垒和持续盈利能力的价值标的。",
    whySelectedEn: "Select value targets with excellent fundamentals, industry barriers, and sustained profitability.",
    invalidationZh: "行业竞争加剧导致盈利能力大幅下降，或商业模式出现根本性变化。",
    invalidationEn: "Deteriorating profitability due to competition or fundamental changes in business model."
  };
}

function buildFundExposureStrategy(workspace: MarketWorkspace): StrategyModule {
  const candidates: StrategyCandidate[] = workspace.funds
    .slice(0, 5)
    .map(f => ({
      symbol: f.code || f.slug,
      name: f.name,
      reason: `质量分 ${f.averageQualityScore.toFixed(1)} | 主线重合 ${(f.trackedThemeOverlap.length)}`,
      score: f.averageQualityScore
    }));

  return {
    id: "fund-exposure",
    nameZh: "基金暴露诊断策略",
    nameEn: "Fund Exposure",
    horizonZh: "中长线",
    horizonEn: "Medium-to-Long",
    riskZh: "低中风险",
    riskEn: "Low-to-Medium",
    scoringDimensions: ["行业暴露", "主题重合", "风格偏移", "质量动量"],
    candidates,
    whySelectedZh: "通过穿透持仓，识别基金真实的风格暴露和主线参与度，避免风格漂移风险。",
    whySelectedEn: "Analyze holdings to identify true style exposure and theme participation, avoiding style drift risk.",
    invalidationZh: "基金经理变更，或定期报告披露的持仓发生重大调整。",
    invalidationEn: "Fund manager change or significant holding adjustments in periodic reports."
  };
}
