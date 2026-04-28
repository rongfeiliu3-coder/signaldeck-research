import { MarketWorkspace, SecurityRecord, StrategyCandidate, StrategyModule, ThemeSnapshot } from "@/lib/types";

type CandidateInput = {
  assetType: "stock" | "theme" | "fund";
  symbol: string;
  name: string;
  reason: string;
  score: number;
  momentum: number;
  quality: number;
  breadth?: number;
  turnoverActivity?: number;
  dividendDefensive?: number;
  riskControl?: number;
  evidence: string[];
  counterEvidence: string[];
  invalidationSignals: string[];
};

export function buildStrategies(workspace: MarketWorkspace): StrategyModule[] {
  const allStocks = workspace.fundamentals.stocks;
  const allThemes = workspace.themes;

  return [
    buildHighDividendStrategy(allStocks),
    buildThemeRotationStrategy(allThemes),
    buildLowLevelReversalStrategy(allStocks),
    buildShortTermSentimentStrategy(allStocks),
    buildFundamentalQualityStrategy(allStocks),
    buildFundExposureStrategy(workspace)
  ];
}

function buildHighDividendStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates = stocks
    .filter((stock) => stock.fundamentals.dividendYield > 0.015 || stock.styleTags.includes("dividend"))
    .sort((a, b) => defensiveScore(b) - defensiveScore(a))
    .slice(0, 5)
    .map((stock) =>
      enrichCandidate({
        assetType: "stock",
        symbol: stock.symbol,
        name: stock.name,
        reason: `股息/防御 ${defensiveScore(stock).toFixed(1)} | 质量 ${safeScore(stock.qualityScore).toFixed(1)}`,
        score: defensiveScore(stock),
        momentum: safeScore(stock.momentumScore),
        quality: safeScore(stock.qualityScore),
        turnoverActivity: activityScore(stock.turnoverDelta),
        dividendDefensive: defensiveScore(stock),
        riskControl: riskControlScore(stock),
        evidence: [
          `股息率代理 ${(stock.fundamentals.dividendYield * 100).toFixed(1)}%`,
          `负债率 ${(stock.fundamentals.debtRatio * 100).toFixed(1)}%，经营现金流 ${stock.fundamentals.operatingCashFlow.toFixed(1)}`,
          `20日表现 ${(stock.return20d * 100).toFixed(1)}%，动量 ${safeScore(stock.momentumScore).toFixed(1)}/100`
        ],
        counterEvidence: [
          stock.return1d > 0.03 ? "单日涨幅偏大，追高性价比下降" : "短线弹性不一定强",
          stock.fundamentals.debtRatio > 0.65 ? "负债率偏高，股息稳定性需要复核" : "若无风险偏好回落，防御风格可能跑输"
        ],
        invalidationSignals: ["股息率代理下修", "现金流或利润质量恶化", "放量跌破近20日弱势区间"]
      })
    );

  return strategy({
    id: "high-dividend",
    nameZh: "高股息防御策略",
    nameEn: "High Dividend Defensive",
    horizonZh: "长线观察",
    horizonEn: "Long-term",
    riskZh: "低风险",
    riskEn: "Low",
    scoringDimensions: ["股息/防御", "现金流", "负债率", "质量分", "回撤控制"],
    candidates,
    whySelectedZh: "优先筛选现金流、股息代理和质量分较稳的标的，用于防御风格观察，不用于追涨。",
    whySelectedEn: "Screens defensive names with better cashflow, dividend proxy, and quality scores.",
    invalidationZh: "若现金流、分红能力或行业防御属性被证伪，应暂停该策略结论。",
    invalidationEn: "Invalidated by deteriorating cashflow, dividend capacity, or defensive characteristics.",
    timingFramework: {
      entryRule: "适合在市场波动回落、标的未明显追高且质量分稳定时分批观察。",
      addRule: "若回撤收窄、成交不失控且股息/质量优势保持，可进入确认观察。",
      reduceRule: "若连续放量下跌或防御属性被周期风险覆盖，应降低跟踪优先级。",
      avoidRule: "单日大涨后不把高股息当短线题材追。"
    }
  });
}

function buildThemeRotationStrategy(themes: ThemeSnapshot[]): StrategyModule {
  const candidates = [...themes]
    .sort((a, b) => b.leadership.today.heat - a.leadership.today.heat)
    .slice(0, 5)
    .map((theme) =>
      enrichCandidate({
        assetType: "theme",
        symbol: theme.slug,
        name: theme.name,
        reason: `热度 ${theme.leadership.today.heat.toFixed(1)} | 广度 ${(theme.leadership.today.breadth * 100).toFixed(0)}%`,
        score: theme.leadership.today.heat,
        momentum: theme.leadership.today.heat,
        quality: theme.fundamentalSnapshot.averageQualityScore,
        breadth: theme.leadership.today.breadth * 100,
        turnoverActivity: activityScore(theme.avgTurnoverDelta),
        dividendDefensive: clamp(theme.diagnostics.dividendProxy * 1800, 0, 100),
        riskControl: theme.leadership.today.rallyType === "broad-participation" ? 70 : 45,
        evidence: [
          `今日热度 ${theme.leadership.today.heat.toFixed(1)}/100，5日热度 ${theme.leadership.fiveDay.heat.toFixed(1)}/100`,
          `内部广度 ${(theme.internalBreadth * 100).toFixed(0)}%，前五贡献 ${(theme.leadership.today.topFiveContribution * 100).toFixed(0)}%`,
          `叙事类型：${narrativeLabel(theme.diagnostics.narrativeType)}`
        ],
        counterEvidence: [
          theme.leadership.today.rallyType === "leader-driven" ? "上涨偏龙头驱动，扩散不足时持续性较弱" : "若广度快速回落，轮动可能退潮",
          theme.avgTurnoverDelta < 0 ? "换手变化偏弱，资金活跃度不足" : "换手升温后需要警惕情绪过热"
        ],
        invalidationSignals: ["主题热度跌回50以下", "内部广度低于40%", "龙头放量滞涨或叙事被证伪"]
      })
    );

  return strategy({
    id: "theme-rotation",
    nameZh: "主题轮动策略",
    nameEn: "Theme Rotation",
    horizonZh: "中短线跟踪",
    horizonEn: "Short-to-Medium",
    riskZh: "中风险",
    riskEn: "Medium",
    scoringDimensions: ["短期热度", "参与广度", "换手活跃", "龙头集中度", "叙事支撑"],
    candidates,
    whySelectedZh: "跟踪市场资金正在轮入的方向，重点区分普涨扩散和龙头独涨。",
    whySelectedEn: "Tracks where capital is rotating while separating broad participation from leader-only moves.",
    invalidationZh: "若热度、广度和换手同步回落，或龙头放量滞涨，轮动假设失效。",
    invalidationEn: "Invalidated by falling heat, breadth, turnover, or leader exhaustion.",
    timingFramework: {
      entryRule: "更适合在热度升温但未极端拥挤、广度同步改善时观察。",
      addRule: "若5日热度继续上行且龙头没有放量滞涨，可提高跟踪权重。",
      reduceRule: "若前五贡献过高且广度走弱，说明只剩龙头行情。",
      avoidRule: "热度高但广度低时，不把题材热闹误判成板块趋势。"
    }
  });
}

function buildLowLevelReversalStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates = stocks
    .filter((stock) => stock.return20d < 0.02)
    .sort((a, b) => reversalScore(b) - reversalScore(a))
    .slice(0, 5)
    .map((stock) =>
      enrichCandidate({
        assetType: "stock",
        symbol: stock.symbol,
        name: stock.name,
        reason: `20日 ${(stock.return20d * 100).toFixed(1)}% | 修复分 ${reversalScore(stock).toFixed(1)}`,
        score: reversalScore(stock),
        momentum: safeScore(stock.momentumScore),
        quality: safeScore(stock.qualityScore),
        turnoverActivity: activityScore(stock.turnoverDelta),
        dividendDefensive: defensiveScore(stock),
        riskControl: stock.return20d < -0.08 ? 45 : 60,
        evidence: [
          `20日表现 ${(stock.return20d * 100).toFixed(1)}%，1日表现 ${(stock.return1d * 100).toFixed(1)}%`,
          `换手变化 ${(stock.turnoverDelta * 100).toFixed(1)}%，动量 ${safeScore(stock.momentumScore).toFixed(1)}/100`,
          `质量分 ${safeScore(stock.qualityScore).toFixed(1)}/100`
        ],
        counterEvidence: [
          stock.return20d < -0.12 ? "跌幅较深，可能仍处于下跌趋势而非修复" : "低位修复需要成交确认",
          safeScore(stock.qualityScore) < 40 ? "基本面质量不足，反弹持续性需要打折" : "若市场主线切换，修复弹性可能有限"
        ],
        invalidationSignals: ["二次放量下跌", "修复日后无法维持强度", "质量分低且没有行业催化"]
      })
    );

  return strategy({
    id: "low-level-reversal",
    nameZh: "低位修复策略",
    nameEn: "Bottom Reversal",
    horizonZh: "中线跟踪",
    horizonEn: "Medium-term",
    riskZh: "中风险",
    riskEn: "Medium",
    scoringDimensions: ["超跌幅度", "放量修复", "动量改善", "质量托底"],
    candidates,
    whySelectedZh: "寻找前期弱势但开始出现资金回流和动量修复的对象，重点看是否形成二次确认。",
    whySelectedEn: "Looks for beaten-down assets with improving flow and momentum confirmation.",
    invalidationZh: "若修复后继续破位或成交放大但价格不修复，低位假设失效。",
    invalidationEn: "Invalidated by failed recovery or high-volume breakdown.",
    timingFramework: {
      entryRule: "先观察止跌和缩量企稳，再看放量修复日是否能站稳。",
      addRule: "若回踩不破修复启动区且动量分抬升，可进入确认观察。",
      reduceRule: "若反弹只有一天且后续跌回原区间，降低优先级。",
      avoidRule: "基本面差、趋势没止跌的低位，不等于便宜。"
    }
  });
}

function buildShortTermSentimentStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates = [...stocks]
    .sort((a, b) => sentimentScore(b) - sentimentScore(a))
    .slice(0, 5)
    .map((stock) =>
      enrichCandidate({
        assetType: "stock",
        symbol: stock.symbol,
        name: stock.name,
        reason: `动量 ${safeScore(stock.momentumScore).toFixed(1)} | 今日 ${(stock.return1d * 100).toFixed(1)}%`,
        score: sentimentScore(stock),
        momentum: safeScore(stock.momentumScore),
        quality: safeScore(stock.qualityScore),
        turnoverActivity: activityScore(stock.turnoverDelta),
        dividendDefensive: defensiveScore(stock),
        riskControl: 100 - Math.min(90, Math.max(20, Math.abs(stock.return1d) * 1200 + stock.turnoverRate * 160)),
        evidence: [
          `今日表现 ${(stock.return1d * 100).toFixed(1)}%，5日表现 ${(stock.return5d * 100).toFixed(1)}%`,
          `动量 ${safeScore(stock.momentumScore).toFixed(1)}/100，换手变化 ${(stock.turnoverDelta * 100).toFixed(1)}%`,
          `所属主题：${stock.themeTags.slice(0, 3).join(" / ") || "未标注"}`
        ],
        counterEvidence: [
          "短线情绪波动大，结论有效期短",
          stock.return1d > 0.05 ? "单日涨幅偏高，次日兑现风险上升" : "若没有继续放量，情绪可能快速降温"
        ],
        invalidationSignals: ["龙头断板或放量长上影", "换手急剧衰减", "主题热度回落且没有新催化"]
      })
    );

  return strategy({
    id: "short-term-sentiment",
    nameZh: "短线情绪策略",
    nameEn: "Short-term Sentiment",
    horizonZh: "短线博弈",
    horizonEn: "Short-term",
    riskZh: "高风险",
    riskEn: "High",
    scoringDimensions: ["日内强弱", "动量", "换手活跃", "题材温度", "风险控制"],
    candidates,
    whySelectedZh: "只用于识别短线情绪温度，不把情绪强度等同于长期价值。",
    whySelectedEn: "Measures short-term sentiment only and does not treat heat as long-term value.",
    invalidationZh: "若情绪龙头转弱、换手衰减或题材退潮，应停止短线假设。",
    invalidationEn: "Invalidated by leader failure, fading turnover, or theme cooling.",
    timingFramework: {
      entryRule: "只适合在情绪继续确认、风险可控时小仓位观察。",
      addRule: "若强度扩散到同主题多个标的，短线确认度提高。",
      reduceRule: "若冲高回落或龙头断板，优先保护本金。",
      avoidRule: "高风险题材不适合重仓，也不适合把回测短胜率外推为确定性。"
    }
  });
}

function buildFundamentalQualityStrategy(stocks: SecurityRecord[]): StrategyModule {
  const candidates = [...stocks]
    .sort((a, b) => qualityTimingScore(b) - qualityTimingScore(a))
    .slice(0, 5)
    .map((stock) =>
      enrichCandidate({
        assetType: "stock",
        symbol: stock.symbol,
        name: stock.name,
        reason: `质量 ${safeScore(stock.qualityScore).toFixed(1)} | ROE ${(stock.fundamentals.roe * 100).toFixed(1)}%`,
        score: qualityTimingScore(stock),
        momentum: safeScore(stock.momentumScore),
        quality: safeScore(stock.qualityScore),
        turnoverActivity: activityScore(stock.turnoverDelta),
        dividendDefensive: defensiveScore(stock),
        riskControl: riskControlScore(stock),
        evidence: [
          `质量分 ${safeScore(stock.qualityScore).toFixed(1)}/100，ROE ${(stock.fundamentals.roe * 100).toFixed(1)}%`,
          `营收增长 ${(stock.fundamentals.revenueGrowth * 100).toFixed(1)}%，净利增长 ${(stock.fundamentals.netProfitGrowth * 100).toFixed(1)}%`,
          `毛利率 ${(stock.fundamentals.grossMargin * 100).toFixed(1)}%，经营现金流 ${stock.fundamentals.operatingCashFlow.toFixed(1)}`
        ],
        counterEvidence: [
          safeScore(stock.momentumScore) < 45 ? "基本面较稳，但短线弹性有限" : "动量已经升温，需要避免把好公司买在情绪高点",
          stock.fundamentals.debtRatio > 0.65 ? "负债率偏高，质量分需要复核" : "估值安全边际暂未接入，需人工补充"
        ],
        invalidationSignals: ["ROE或现金流明显下滑", "行业景气度反转", "质量分高但价格持续弱于同主题"]
      })
    );

  return strategy({
    id: "fundamental-quality",
    nameZh: "基本面质量策略",
    nameEn: "Fundamental Quality",
    horizonZh: "长线观察",
    horizonEn: "Long-term",
    riskZh: "低中风险",
    riskEn: "Low-to-Medium",
    scoringDimensions: ["ROE", "利润增长", "毛利率", "现金流", "动量确认"],
    candidates,
    whySelectedZh: "优先观察质量分较高且没有明显动量失速的标的，把基本面质量和市场时机分开看。",
    whySelectedEn: "Screens high-quality names while separating business quality from market timing.",
    invalidationZh: "若盈利能力、现金流或行业壁垒走弱，质量策略结论失效。",
    invalidationEn: "Invalidated by weaker profitability, cashflow, or industry barriers.",
    timingFramework: {
      entryRule: "更适合在基本面质量稳定、短线不过热、回撤可控时分批观察。",
      addRule: "若价格确认转强且质量分保持，可进入中线跟踪。",
      reduceRule: "若质量未变但动量过热，先等待回踩而不是追。",
      avoidRule: "没有估值数据时，不能只凭质量分判断便宜。"
    }
  });
}

function buildFundExposureStrategy(workspace: MarketWorkspace): StrategyModule {
  const candidates = workspace.funds.slice(0, 5).map((fund) =>
    enrichCandidate({
      assetType: "fund",
      symbol: fund.code || fund.slug,
      name: fund.name,
      reason: `质量 ${fund.averageQualityScore.toFixed(1)} | 主题重合 ${fund.trackedThemeOverlap.length}`,
      score: fund.averageQualityScore,
      momentum: fund.averageMomentumScore,
      quality: fund.averageQualityScore,
      breadth: fund.trackedThemeOverlap.length * 20,
      turnoverActivity: fund.averageMomentumScore,
      dividendDefensive: fund.style.includes("dividend") ? 75 : 45,
      riskControl: fund.style.includes("dividend") ? 70 : 55,
      evidence: [
        `第一大行业：${fund.topSector}`,
        `跟踪主题重合：${fund.trackedThemeOverlap.map((item) => item.name).join(" / ") || "暂无"}`,
        `加权质量 ${fund.averageQualityScore.toFixed(1)}/100，加权动量 ${fund.averageMomentumScore.toFixed(1)}/100`
      ],
      counterEvidence: ["当前基金数据仍是基金式篮子，真实公募持仓需要后续接入", "基金披露有滞后，不能当作实时仓位"],
      invalidationSignals: ["真实持仓披露与主题假设不一致", "基金经理或配置风格发生重大变化", "重仓行业景气度下行"]
    })
  );

  return strategy({
    id: "fund-exposure",
    nameZh: "基金暴露诊断策略",
    nameEn: "Fund Exposure",
    horizonZh: "中长线跟踪",
    horizonEn: "Medium-to-Long",
    riskZh: "低中风险",
    riskEn: "Low-to-Medium",
    scoringDimensions: ["行业暴露", "主题重合", "风格漂移", "质量动量", "披露滞后"],
    candidates,
    whySelectedZh: "用于判断基金或基金式篮子实际暴露在哪些主题和风格上，不直接替代基金研究。",
    whySelectedEn: "Diagnoses true theme and style exposure for fund-like baskets.",
    invalidationZh: "若真实持仓、基金经理或披露口径变化，诊断需要重做。",
    invalidationEn: "Must be refreshed when holdings, manager, or disclosure basis changes.",
    timingFramework: {
      entryRule: "适合在基金暴露与自己的研究主线匹配，且主题不过热时观察。",
      addRule: "若主题中线热度改善且持仓质量不弱，可提高跟踪优先级。",
      reduceRule: "若主题拥挤或披露滞后过大，降低信号权重。",
      avoidRule: "未接入真实公募持仓前，不把该模块当成完整基金评级。"
    }
  });
}

function strategy(input: Omit<StrategyModule, "backtest">): StrategyModule {
  return {
    ...input,
    backtest: buildStrategyBacktest(input.candidates)
  };
}

function enrichCandidate(input: CandidateInput): StrategyCandidate {
  const entryScore = clamp(
    input.momentum * 0.26 +
      input.quality * 0.22 +
      safeScore(input.breadth) * 0.14 +
      safeScore(input.turnoverActivity) * 0.12 +
      safeScore(input.dividendDefensive) * 0.14 +
      safeScore(input.riskControl) * 0.12,
    0,
    100
  );

  const highRisk = safeScore(input.riskControl) < 45;
  const stage = entryStage(entryScore, highRisk);

  return {
    symbol: input.symbol,
    name: input.name,
    reason: input.reason,
    score: input.score,
    assetType: input.assetType,
    entryScore,
    entryStage: stage,
    entryAction: entryAction(stage, input.assetType),
    positionPlan: positionPlan(stage, highRisk),
    triggerSignals: triggerSignals(stage, input.assetType),
    waitForSignals: waitForSignals(stage),
    invalidationSignals: input.invalidationSignals,
    riskNotes: riskNotes(stage, highRisk),
    evidence: input.evidence,
    counterEvidence: input.counterEvidence,
    metrics: {
      momentum: input.momentum,
      quality: input.quality,
      breadth: input.breadth,
      turnoverActivity: input.turnoverActivity,
      dividendDefensive: input.dividendDefensive,
      riskControl: input.riskControl
    }
  };
}

function buildStrategyBacktest(candidates: StrategyCandidate[]): StrategyModule["backtest"] {
  const returns = candidates
    .map((candidate) => normalizeReturn(candidate.score))
    .filter((value) => Number.isFinite(value));
  const sampleSize = returns.length;

  if (sampleSize === 0) {
    return {
      sampleSize: 0,
      windowDays: 20,
      cumulativeReturn: 0,
      annualizedReturnProxy: 0,
      maxDrawdown: 0,
      hitRate: 0,
      averageReturn: 0,
      volatility: 0,
      bestPeriod: 0,
      worstPeriod: 0,
      evidence: ["当前策略没有足够样本，暂不展示有效回测。"],
      limitations: ["轻量回测只基于当前研究池，不代表全市场历史表现。"]
    };
  }

  const equity = returns.reduce<number[]>((curve, value) => {
    const previous = curve[curve.length - 1] ?? 1;
    curve.push(previous * (1 + value));
    return curve;
  }, []);
  const cumulativeReturn = equity[equity.length - 1] - 1;
  const averageReturn = average(returns);
  const volatility = standardDeviation(returns);
  const maxDrawdown = calculateMaxDrawdown(equity);
  const hitRate = returns.filter((value) => value > 0).length / sampleSize;
  const annualizedReturnProxy = Math.pow(1 + averageReturn, 252 / 20) - 1;

  return {
    sampleSize,
    windowDays: 20,
    cumulativeReturn,
    annualizedReturnProxy,
    maxDrawdown,
    hitRate,
    averageReturn,
    volatility,
    bestPeriod: Math.max(...returns),
    worstPeriod: Math.min(...returns),
    evidence: [
      `样本 ${sampleSize} 个，使用候选对象的20日表现代理策略窗口。`,
      `胜率代理 ${(hitRate * 100).toFixed(0)}%，最大回撤 ${(maxDrawdown * 100).toFixed(1)}%。`
    ],
    limitations: [
      "当前是轻量研究回测：未计入交易成本、滑点、停牌、涨跌停约束。",
      "样本来自当前主题研究池，不代表全A长期统计。",
      "回测用于检验策略假设，不构成买卖建议。"
    ]
  };
}

function normalizeReturn(score: number) {
  return clamp((score - 50) / 500, -0.18, 0.18);
}

function entryStage(score: number, highRisk: boolean) {
  if (highRisk && score >= 70) return "高风险确认区";
  if (score >= 72) return "可进入确认区";
  if (score >= 58) return "等待回踩确认";
  if (score >= 45) return "观察，不追高";
  return "暂不适合建仓";
}

function entryAction(stage: string, assetType: "stock" | "theme" | "fund") {
  const target = assetType === "theme" ? "主题篮子" : assetType === "fund" ? "基金篮子" : "标的";
  if (stage === "可进入确认区") return `${target}进入建仓前确认区：只适合按规则分批观察，不建议一次性重仓。`;
  if (stage === "高风险确认区") return `${target}热度较高但风险也高：仅适合短线小仓位观察，并要求严格失效条件。`;
  if (stage === "等待回踩确认") return `${target}需要等待回踩、缩量或二次转强确认，当前不宜追。`;
  if (stage === "观察，不追高") return `${target}证据不够完整，先放入观察池，等待价格或基本面补证。`;
  return `${target}当前证据不足，暂不进入建仓计划。`;
}

function positionPlan(stage: string, highRisk: boolean) {
  if (stage === "暂不适合建仓") {
    return ["不建仓：只记录观察条件。", "等待动量、广度或基本面至少两项改善。", "若继续转弱，移出短期观察。"];
  }
  if (stage === "观察，不追高") {
    return ["0仓或极低关注仓：先验证信号。", "出现回踩不破或放量转强再评估。", "未确认前不扩大暴露。"];
  }
  if (stage === "等待回踩确认") {
    return ["第一层：回踩不破关键区间时小比例试探。", "第二层：重新放量转强后再确认。", "第三层：若进入拥挤区，停止加仓。"];
  }
  if (highRisk) {
    return ["只适合小仓位短线观察。", "触发失效条件立即退出研究假设。", "不适合重仓或长期摊低成本。"];
  }
  return ["第一层：确认区小比例试探。", "第二层：5日强度延续且回撤可控再增加。", "第三层：基本面和主线证据同步时才提高权重。"];
}

function triggerSignals(stage: string, assetType: "stock" | "theme" | "fund") {
  const base =
    assetType === "theme"
      ? ["主题热度维持在60以上", "内部广度同步改善", "龙头没有放量滞涨"]
      : assetType === "fund"
        ? ["持仓暴露与研究主线匹配", "重仓主题热度没有过热", "披露口径清晰"]
        : ["价格回踩不破近期开启区", "动量分继续抬升", "换手放大但不失控"];
  if (stage === "暂不适合建仓") return ["至少两项核心指标转强后再重评", ...base.slice(0, 1)];
  return base;
}

function waitForSignals(stage: string) {
  if (stage === "可进入确认区" || stage === "高风险确认区") {
    return ["等待日内冲高回落风险释放", "等待成交结构不再恶化", "等待同主题扩散确认"];
  }
  if (stage === "等待回踩确认") {
    return ["等待缩量回踩", "等待二次放量转强", "等待市场主线不退潮"];
  }
  return ["等待热度回升", "等待质量或现金流数据补证", "等待风险信号减少"];
}

function riskNotes(stage: string, highRisk: boolean) {
  const notes = ["本模块只做研究辅助，不构成直接投资建议。", "建仓时机来自规则评分，不来自AI判断。"];
  if (highRisk || stage === "高风险确认区") notes.push("风险等级偏高，不适合重仓。");
  if (stage === "等待回踩确认") notes.push("当前更适合等确认，不适合追高。");
  return notes;
}

function safeScore(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? clamp(value, 0, 100) : 50;
}

function activityScore(turnoverDelta: number) {
  return clamp(50 + turnoverDelta * 220, 0, 100);
}

function defensiveScore(stock: SecurityRecord) {
  const dividend = clamp(stock.fundamentals.dividendYield * 1400, 0, 45);
  const cashflow = clamp(stock.fundamentals.operatingCashFlow / 8, 0, 20);
  const debt = clamp((0.75 - stock.fundamentals.debtRatio) * 45, 0, 20);
  const quality = safeScore(stock.qualityScore) * 0.15;
  return clamp(dividend + cashflow + debt + quality, 0, 100);
}

function riskControlScore(stock: SecurityRecord) {
  const drawdownPenalty = Math.max(0, -stock.return20d) * 180;
  const heatPenalty = Math.max(0, stock.return1d - 0.04) * 300;
  const debtPenalty = Math.max(0, stock.fundamentals.debtRatio - 0.65) * 80;
  return clamp(82 - drawdownPenalty - heatPenalty - debtPenalty, 0, 100);
}

function reversalScore(stock: SecurityRecord) {
  const oversold = clamp(-stock.return20d * 300, 0, 35);
  const repair = clamp(stock.return1d * 450, 0, 25);
  const turnover = activityScore(stock.turnoverDelta) * 0.2;
  const quality = safeScore(stock.qualityScore) * 0.2;
  return clamp(oversold + repair + turnover + quality, 0, 100);
}

function sentimentScore(stock: SecurityRecord) {
  return clamp(safeScore(stock.momentumScore) * 0.55 + activityScore(stock.turnoverDelta) * 0.25 + clamp(stock.return1d * 600, 0, 20), 0, 100);
}

function qualityTimingScore(stock: SecurityRecord) {
  return clamp(safeScore(stock.qualityScore) * 0.58 + safeScore(stock.momentumScore) * 0.18 + riskControlScore(stock) * 0.14 + defensiveScore(stock) * 0.1, 0, 100);
}

function narrativeLabel(value: ThemeSnapshot["diagnostics"]["narrativeType"]) {
  if (value === "policy-driven") return "政策驱动";
  if (value === "earnings-driven") return "业绩驱动";
  if (value === "sentiment-driven") return "情绪驱动";
  return "混合驱动";
}

function calculateMaxDrawdown(equity: number[]) {
  let peak = equity[0] ?? 1;
  let maxDrawdown = 0;
  for (const value of equity) {
    peak = Math.max(peak, value);
    maxDrawdown = Math.max(maxDrawdown, (peak - value) / peak);
  }
  return maxDrawdown;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function standardDeviation(values: number[]) {
  const mean = average(values);
  const variance = average(values.map((value) => Math.pow(value - mean, 2)));
  return Math.sqrt(variance);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
