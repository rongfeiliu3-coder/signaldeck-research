import scoringConfig from "@/config/fundamental-scoring.json";
import {
  EvidenceItem,
  FundDiagnostic,
  FundamentalsBreakdown,
  LeadershipWindow,
  MarketLeadershipBoard,
  MarketWorkspace,
  RationalSummary,
  RawResearchData,
  ScoreComponent,
  SecurityRecord,
  ThemeSnapshot
} from "@/lib/types";

const trackedThemeSlugs = ["power-utilities", "low-carbon-energy", "satellite-aerospace", "high-dividend", "compute-ai"];

type EnrichedSecurity = SecurityRecord & {
  qualityScore: number;
  momentumScore: number;
  fundamentalsBreakdown: FundamentalsBreakdown;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function scoreByThreshold(value: number, weak: number, strong: number, invert = false) {
  const normalized = invert
    ? (weak - value) / Math.max(1e-9, weak - strong)
    : (value - weak) / Math.max(1e-9, strong - weak);
  return clamp(normalized * 100);
}

function formatPercent(value: number, digits = 1) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(digits)}%`;
}

function toPercentText(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

function buildFundamentalBreakdown(security: SecurityRecord): FundamentalsBreakdown {
  const thresholds = scoringConfig.thresholds;
  const weights = scoringConfig.weights;

  const components: ScoreComponent[] = [
    {
      key: "revenueGrowth",
      label: "Revenue Growth",
      rawValue: security.fundamentals.revenueGrowth,
      weight: weights.revenueGrowth,
      score: scoreByThreshold(security.fundamentals.revenueGrowth, thresholds.revenueGrowth.weak, thresholds.revenueGrowth.strong)
    },
    {
      key: "netProfitGrowth",
      label: "Net Profit Growth",
      rawValue: security.fundamentals.netProfitGrowth,
      weight: weights.netProfitGrowth,
      score: scoreByThreshold(security.fundamentals.netProfitGrowth, thresholds.netProfitGrowth.weak, thresholds.netProfitGrowth.strong)
    },
    {
      key: "roe",
      label: "ROE",
      rawValue: security.fundamentals.roe,
      weight: weights.roe,
      score: scoreByThreshold(security.fundamentals.roe, thresholds.roe.weak, thresholds.roe.strong)
    },
    {
      key: "grossMargin",
      label: "Gross Margin",
      rawValue: security.fundamentals.grossMargin,
      weight: weights.grossMargin,
      score: scoreByThreshold(security.fundamentals.grossMargin, thresholds.grossMargin.weak, thresholds.grossMargin.strong)
    },
    {
      key: "debtRatio",
      label: "Debt Ratio",
      rawValue: security.fundamentals.debtRatio,
      weight: weights.debtRatio,
      score: scoreByThreshold(security.fundamentals.debtRatio, thresholds.debtRatio.weak, thresholds.debtRatio.strong, true)
    },
    {
      key: "operatingCashFlow",
      label: "Operating Cash Flow",
      rawValue: security.fundamentals.operatingCashFlow,
      weight: weights.operatingCashFlow,
      score: scoreByThreshold(
        security.fundamentals.operatingCashFlow,
        thresholds.operatingCashFlow.weak,
        thresholds.operatingCashFlow.strong
      )
    },
    {
      key: "dividendYield",
      label: "Dividend Yield",
      rawValue: security.fundamentals.dividendYield,
      weight: weights.dividendYield,
      score: scoreByThreshold(security.fundamentals.dividendYield, thresholds.dividendYield.weak, thresholds.dividendYield.strong)
    }
  ];

  return {
    totalScore: Number(sum(components.map((component) => component.score * component.weight)).toFixed(1)),
    components
  };
}

function buildMomentumScore(security: SecurityRecord) {
  return Number(
    clamp(
      50 +
        security.return1d * 700 +
        security.return5d * 280 +
        security.return20d * 120 +
        security.turnoverDelta * 500
    ).toFixed(1)
  );
}

function buildThemeLeadership(stocks: EnrichedSecurity[], key: "return1d" | "return5d" | "return20d"): LeadershipWindow {
  const returns = stocks.map((stock) => stock[key]);
  const positive = stocks.filter((stock) => stock[key] > 0);
  const breadth = positive.length / Math.max(1, stocks.length);
  const turnoverChange = average(stocks.map((stock) => stock.turnoverDelta));
  const weightedContributors = positive
    .map((stock) => Math.max(0, stock[key]) * Math.max(stock.leaderScore, 0.1))
    .sort((a, b) => b - a);
  const totalPositiveContribution = sum(weightedContributors) || 1;
  const leaderConcentration = sum(weightedContributors.slice(0, 2)) / totalPositiveContribution;
  const topFiveContribution = sum(weightedContributors.slice(0, 5)) / totalPositiveContribution;

  let rallyType: LeadershipWindow["rallyType"] = "mixed";
  let participationLabel = "分化轮动";

  if (breadth >= 0.66 && topFiveContribution <= 0.72) {
    rallyType = "broad-participation";
    participationLabel = "广泛参与";
  } else if (breadth <= 0.45 || topFiveContribution >= 0.82 || leaderConcentration >= 0.58) {
    rallyType = "leader-driven";
    participationLabel = "龙头驱动";
  }

  const heat = clamp(45 + average(returns) * 900 + breadth * 28 + turnoverChange * 420 - topFiveContribution * 8);

  return {
    avgReturn: average(returns),
    breadth,
    turnoverChange,
    leaderConcentration,
    topFiveContribution,
    heat: Number(heat.toFixed(1)),
    participationLabel,
    rallyType
  };
}

function isPolicyTheme(slug: string) {
  return ["power-utilities", "satellite-aerospace", "low-carbon-energy"].includes(slug);
}

function isIncomeTheme(slug: string) {
  return ["power-utilities", "high-dividend"].includes(slug);
}

function classifyNarrative(theme: Pick<ThemeSnapshot, "slug" | "leadership" | "fundamentalSnapshot">) {
  const today = theme.leadership.today;
  const quality = theme.fundamentalSnapshot.averageQualityScore;
  const growth = theme.fundamentalSnapshot.medianRevenueGrowth;
  const roe = theme.fundamentalSnapshot.medianRoe;

  if (quality >= 60 && growth >= 0.1 && roe >= 0.1 && today.breadth >= 0.5) {
    return "earnings-driven" as const;
  }

  if (isPolicyTheme(theme.slug) && today.turnoverChange >= -0.005 && today.topFiveContribution <= 0.82) {
    return "policy-driven" as const;
  }

  if (today.turnoverChange >= 0.012 || (today.topFiveContribution >= 0.8 && quality < 58)) {
    return "sentiment-driven" as const;
  }

  return "mixed" as const;
}

function buildThemeDiagnostics(theme: Pick<ThemeSnapshot, "slug" | "leadership" | "fundamentalSnapshot" | "avgTurnoverDelta">) {
  const dividendProxy = theme.fundamentalSnapshot.medianDividendYield;
  const stabilityScore = clamp(
    30 +
      dividendProxy * 1200 +
      theme.fundamentalSnapshot.averageQualityScore * 0.45 +
      (1 - Math.max(theme.avgTurnoverDelta, 0)) * 14
  );
  const growthScore = clamp(
    25 +
      theme.fundamentalSnapshot.medianRevenueGrowth * 160 +
      theme.fundamentalSnapshot.averageMomentumScore * 0.3 +
      theme.leadership.twentyDay.avgReturn * 800
  );

  let stabilityStyle: ThemeSnapshot["diagnostics"]["stabilityStyle"] = "balanced";
  if (isIncomeTheme(theme.slug) || stabilityScore - growthScore >= 10) stabilityStyle = "defensive";
  if (theme.slug === "low-carbon-energy" || theme.slug === "compute-ai" || growthScore - stabilityScore >= 10) {
    stabilityStyle = "cyclical";
  }

  const narrativeType = classifyNarrative(theme);

  let characteristicLabel = "均衡";
  if (stabilityStyle === "defensive") {
    characteristicLabel = dividendProxy >= 0.035 ? "高股息防御" : "稳健防御";
  } else if (stabilityStyle === "cyclical") {
    characteristicLabel = theme.fundamentalSnapshot.medianRevenueGrowth >= 0.12 ? "成长弹性" : "景气周期";
  }

  return {
    narrativeType,
    stabilityStyle,
    dividendProxy: Number(dividendProxy.toFixed(4)),
    stabilityScore: Number(stabilityScore.toFixed(1)),
    growthScore: Number(growthScore.toFixed(1)),
    characteristicLabel
  };
}

function narrativeLabel(narrativeType: ThemeSnapshot["diagnostics"]["narrativeType"]) {
  switch (narrativeType) {
    case "policy-driven":
      return "政策驱动";
    case "sentiment-driven":
      return "情绪驱动";
    case "earnings-driven":
      return "业绩驱动";
    default:
      return "混合驱动";
  }
}

function stabilityLabel(stabilityStyle: ThemeSnapshot["diagnostics"]["stabilityStyle"]) {
  switch (stabilityStyle) {
    case "defensive":
      return "偏防御";
    case "cyclical":
      return "偏周期";
    default:
      return "攻守均衡";
  }
}

function buildThemeEvidence(theme: ThemeSnapshot): EvidenceItem[] {
  return [
    {
      source: "marketData",
      label: "价格与扩散",
      detail: `今日日内热度 ${theme.leadership.today.heat.toFixed(1)}，广度 ${toPercentText(theme.leadership.today.breadth, 1)}，前五贡献 ${toPercentText(theme.leadership.today.topFiveContribution)}。`
    },
    {
      source: "marketData",
      label: "资金结构",
      detail: `${theme.leadership.today.participationLabel}，换手变化 ${formatPercent(theme.avgTurnoverDelta)}，可区分龙头拉升还是普涨扩散。`
    },
    {
      source: "financialData",
      label: "基本面快照",
      detail: `质量均分 ${theme.fundamentalSnapshot.averageQualityScore.toFixed(1)}，中位 ROE ${toPercentText(theme.fundamentalSnapshot.medianRoe, 1)}，股息代理 ${toPercentText(theme.diagnostics.dividendProxy, 1)}。`
    },
    {
      source: "themeRules",
      label: "主题篮子规则",
      detail: `当前篮子共 ${theme.memberCount} 只，成分来自配置文件维护，便于持续修订研究边界。`
    }
  ];
}

function buildThemeSummary(theme: ThemeSnapshot): RationalSummary {
  const today = theme.leadership.today;
  const narrative = narrativeLabel(theme.diagnostics.narrativeType);
  const style = `${stabilityLabel(theme.diagnostics.stabilityStyle)}，${theme.diagnostics.characteristicLabel}`;

  return {
    marketNarrative: `${theme.name} 当前是 ${narrative} 交易，日内表现偏 ${today.participationLabel}。`,
    driverNarrative: `${style}。${today.rallyType === "leader-driven" ? "核心股拉动更明显。" : today.rallyType === "broad-participation" ? "板块扩散更完整。" : "扩散和龙头效应并存。"}`
      + ` 结论以市场数据、财务数据和主题规则为主，AI 仅做归纳。`,
    supportingEvidence: [
      `5 日均涨 ${formatPercent(theme.leadership.fiveDay.avgReturn)}，20 日热度 ${theme.leadership.twentyDay.heat.toFixed(1)}。`,
      `上涨家数 ${theme.positiveCount}/${theme.memberCount}，广度 ${toPercentText(theme.internalBreadth, 1)}，前五贡献 ${toPercentText(today.topFiveContribution)}。`,
      `质量均分 ${theme.fundamentalSnapshot.averageQualityScore.toFixed(1)}，中位营收增速 ${toPercentText(theme.fundamentalSnapshot.medianRevenueGrowth, 1)}，股息代理 ${toPercentText(theme.diagnostics.dividendProxy, 1)}。`
    ],
    risks: [
      today.rallyType === "leader-driven" ? "上涨偏集中，核心股一旦回撤，板块热度容易快速降温。" : "若后续成交跟不上，普涨结构也可能回到分化。",
      theme.diagnostics.narrativeType === "sentiment-driven"
        ? "当前更依赖情绪和换手，基本面验证仍待后续财报。"
        : theme.diagnostics.narrativeType === "policy-driven"
          ? "政策预期若边际放缓，估值扩张可能先于业绩回落。"
          : "即便业绩支撑较强，也仍需跟踪订单、利润率和现金流兑现。",
      "研究结论仅供复盘和跟踪，不构成投资建议。"
    ],
    sources: ["marketData", "financialData", "themeRules", "aiSynthesis"]
  };
}

function buildThemeSnapshot(basket: RawResearchData["themeBaskets"][number], members: EnrichedSecurity[]): ThemeSnapshot {
  const todayLeadership = buildThemeLeadership(members, "return1d");
  const fiveDayLeadership = buildThemeLeadership(members, "return5d");
  const twentyDayLeadership = buildThemeLeadership(members, "return20d");

  const baseTheme = {
    slug: basket.slug,
    name: basket.nameZh,
    description: basket.descriptionZh,
    focus: basket.focus,
    memberCount: members.length,
    positiveCount: members.filter((security) => security.return1d > 0).length,
    internalBreadth: members.filter((security) => security.return1d > 0).length / Math.max(1, members.length),
    avgTurnoverDelta: average(members.map((security) => security.turnoverDelta)),
    leadership: {
      today: todayLeadership,
      fiveDay: fiveDayLeadership,
      twentyDay: twentyDayLeadership
    },
    topLeaders: [...members].sort((a, b) => b.return5d * b.leaderScore - a.return5d * a.leaderScore).slice(0, 3),
    constituents: members,
    fundamentalSnapshot: {
      averageQualityScore: Number(average(members.map((security) => security.qualityScore)).toFixed(1)),
      averageMomentumScore: Number(average(members.map((security) => security.momentumScore)).toFixed(1)),
      medianRevenueGrowth: median(members.map((security) => security.fundamentals.revenueGrowth)),
      medianRoe: median(members.map((security) => security.fundamentals.roe)),
      medianDividendYield: median(members.map((security) => security.fundamentals.dividendYield))
    }
  };

  const diagnostics = buildThemeDiagnostics({
    ...baseTheme,
  });

  const theme: ThemeSnapshot = {
    ...baseTheme,
    diagnostics,
    evidence: [],
    summary: {
      marketNarrative: "",
      driverNarrative: "",
      supportingEvidence: [],
      risks: [],
      sources: []
    }
  };

  theme.evidence = buildThemeEvidence(theme);
  theme.summary = buildThemeSummary(theme);

  return theme;
}

export function buildWorkspace(raw: RawResearchData): MarketWorkspace {
  const basketMap = new Map(raw.themeBaskets.map((basket) => [basket.slug, basket]));
  const securities: EnrichedSecurity[] = raw.securities.map((security) => {
    const fundamentalsBreakdown = buildFundamentalBreakdown(security);
    return {
      ...security,
      qualityScore: fundamentalsBreakdown.totalScore,
      momentumScore: buildMomentumScore(security),
      fundamentalsBreakdown
    };
  });

  const themes = raw.themeBaskets.map((basket) => {
    const members = securities.filter((security) => basket.symbols.includes(security.symbol));
    return buildThemeSnapshot(basket, members);
  });

  const marketLeadership: MarketLeadershipBoard[] = [
    { key: "today", label: "今日", themes: [...themes].sort((a, b) => b.leadership.today.heat - a.leadership.today.heat) },
    { key: "fiveDay", label: "5日", themes: [...themes].sort((a, b) => b.leadership.fiveDay.heat - a.leadership.fiveDay.heat) },
    { key: "twentyDay", label: "20日", themes: [...themes].sort((a, b) => b.leadership.twentyDay.heat - a.leadership.twentyDay.heat) }
  ];

  const funds: FundDiagnostic[] = raw.funds.map((fund) => {
    const holdings = fund.holdings.reduce<Array<{ security: EnrichedSecurity; weight: number }>>((accumulator, holding) => {
      const security = securities.find((item) => item.symbol === holding.symbol);
      if (security) {
        accumulator.push({ security, weight: holding.weight });
      }
      return accumulator;
    }, []);

    const sectorExposure = Object.entries(
      holdings.reduce<Record<string, number>>((accumulator, holding) => {
        accumulator[holding.security.sector] = (accumulator[holding.security.sector] ?? 0) + holding.weight;
        return accumulator;
      }, {})
    )
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight);

    const themeExposure = Object.entries(
      holdings.reduce<Record<string, number>>((accumulator, holding) => {
        holding.security.themeTags.forEach((slug) => {
          accumulator[slug] = (accumulator[slug] ?? 0) + holding.weight;
        });
        return accumulator;
      }, {})
    )
      .map(([slug, weight]) => ({ slug, name: basketMap.get(slug)?.nameZh ?? slug, weight }))
      .sort((a, b) => b.weight - a.weight);

    const styleExposure = Object.entries(
      holdings.reduce<Record<string, number>>((accumulator, holding) => {
        holding.security.styleTags.forEach((tag) => {
          accumulator[tag] = (accumulator[tag] ?? 0) + holding.weight;
        });
        return accumulator;
      }, {})
    )
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight);

    return {
      slug: fund.slug,
      name: fund.name,
      style: fund.style,
      description: fund.description,
      topSector: sectorExposure[0]?.name ?? "N/A",
      sectorExposure,
      themeExposure,
      styleExposure,
      trackedThemeOverlap: themeExposure.filter((item) => trackedThemeSlugs.includes(item.slug)),
      averageQualityScore: Number(sum(holdings.map((holding) => holding.security.qualityScore * holding.weight)).toFixed(1)),
      averageMomentumScore: Number(sum(holdings.map((holding) => holding.security.momentumScore * holding.weight)).toFixed(1))
    };
  });

  const strongestThemes = marketLeadership[0].themes.slice(0, 3);
  const overallBreadth = average(themes.map((theme) => theme.leadership.today.breadth));
  const averageQuality = average(themes.map((theme) => theme.fundamentalSnapshot.averageQualityScore));
  const avgTopFiveContribution = average(themes.map((theme) => theme.leadership.today.topFiveContribution));
  const narrativeCounts = themes.reduce<Record<string, number>>((accumulator, theme) => {
    const key = theme.diagnostics.narrativeType;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
  const leadingNarrative =
    (Object.entries(narrativeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as ThemeSnapshot["diagnostics"]["narrativeType"] | undefined) ??
    "mixed";

  return {
    asOfDate: raw.asOfDate,
    universeName: raw.universeName,
    providerStatus: {
      current: "Unknown",
      mode: "mock",
      available: []
    },
    marketLeadership,
    themes,
    fundamentals: {
      scoringMethod: {
        weights: scoringConfig.weights
      },
      stocks: [...securities].sort((a, b) => b.qualityScore - a.qualityScore)
    },
    funds,
    marketSummary: {
      marketNarrative: `当前最强主线集中在 ${strongestThemes.map((theme) => theme.name).join("、")}，市场主叙事偏 ${narrativeLabel(leadingNarrative)}。`,
      driverNarrative:
        overallBreadth >= 0.62 && averageQuality >= 58
          ? "扩散在走强，市场不是只抱少数龙头，结构上更接近景气和业绩共振。"
          : avgTopFiveContribution >= 0.78
            ? "主线赚钱效应偏向核心股，短线更要盯龙头分歧和换手衰减。"
            : "当前属于轮动市，价格、广度和基本面信号并不完全同步。",
      supportingEvidence: [
        `主题平均广度 ${toPercentText(overallBreadth, 1)}，前五贡献均值 ${toPercentText(avgTopFiveContribution)}。`,
        `今日前三主题为 ${strongestThemes.map((theme) => theme.name).join("、")}。`,
        `主题平均质量分 ${averageQuality.toFixed(1)}，用于区分热度与质量。`
      ],
      risks: [
        avgTopFiveContribution >= 0.78 ? "赚钱效应过度集中，龙头一旦松动，板块回撤会更快。" : "若成交继续回落，当前扩散结构仍可能重新收缩。",
        "政策、情绪和业绩三类驱动会来回切换，单日表现不宜直接外推。",
        "研究结论仅供复盘和跟踪，不构成投资建议。"
      ],
      sources: ["marketData", "financialData", "themeRules", "aiSynthesis"]
    }
  };
}
