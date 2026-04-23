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
  const leaderContribution = positive.map((stock) => stock[key] * stock.leaderScore).sort((a, b) => b - a);
  const totalPositiveContribution = sum(leaderContribution) || 1;
  const leaderConcentration = sum(leaderContribution.slice(0, 2)) / totalPositiveContribution;
  const heat = clamp(45 + average(returns) * 900 + breadth * 30 + turnoverChange * 500 - leaderConcentration * 10);

  let participationLabel = "选择性轮动";
  if (breadth >= 0.66 && leaderConcentration <= 0.48) participationLabel = "广泛参与";
  if (breadth <= 0.45 && leaderConcentration >= 0.58) participationLabel = "龙头主导";

  return {
    avgReturn: average(returns),
    breadth,
    turnoverChange,
    leaderConcentration,
    heat: Number(heat.toFixed(1)),
    participationLabel
  };
}

function buildThemeEvidence(theme: ThemeSnapshot): EvidenceItem[] {
  return [
    {
      source: "marketData",
      label: "价量结构",
      detail: `今日热度 ${theme.leadership.today.heat.toFixed(1)}，5 日热度 ${theme.leadership.fiveDay.heat.toFixed(1)}，换手变化 ${(theme.avgTurnoverDelta * 100).toFixed(2)}%。`
    },
    {
      source: "marketData",
      label: "内部扩散",
      detail: `${theme.positiveCount}/${theme.memberCount} 成员上涨，内部广度 ${(theme.internalBreadth * 100).toFixed(1)}%。`
    },
    {
      source: "financialData",
      label: "质量快照",
      detail: `平均质量分 ${theme.fundamentalSnapshot.averageQualityScore.toFixed(1)}，中位 ROE ${(theme.fundamentalSnapshot.medianRoe * 100).toFixed(1)}%。`
    },
    {
      source: "themeRules",
      label: "篮子规则",
      detail: `主题来自配置文件维护，当前包含 ${theme.memberCount} 只股票。`
    }
  ];
}

function buildThemeSummary(theme: ThemeSnapshot): RationalSummary {
  const emotionDriven = theme.leadership.today.turnoverChange > 0.01 && theme.leadership.today.leaderConcentration > 0.55;
  const fundamentalSupportive = theme.fundamentalSnapshot.averageQualityScore >= 60;

  return {
    marketNarrative: `${theme.name} 当前更像 ${theme.leadership.today.participationLabel} 的活跃方向，20 日窗口热度 ${theme.leadership.twentyDay.heat >= 60 ? "仍偏强" : "暂属中性"}。`,
    driverNarrative: emotionDriven
      ? `短线更偏情绪与题材驱动，原因是换手抬升明显、龙头集中度偏高${fundamentalSupportive ? "，但基本面并非完全缺位。" : "。"}`
      : fundamentalSupportive
        ? "更接近基本面和景气共同驱动，说明并非只有少数高弹性个股在拉动。"
        : "更像价量先行、基本面跟随验证的混合驱动。",
    supportingEvidence: [
      `5 日平均涨幅 ${(theme.leadership.fiveDay.avgReturn * 100).toFixed(1)}%，今日广度 ${(theme.leadership.today.breadth * 100).toFixed(1)}%。`,
      `龙头集中度 ${(theme.leadership.today.leaderConcentration * 100).toFixed(0)}%，可区分是扩散还是只拉龙头。`,
      `平均质量分 ${theme.fundamentalSnapshot.averageQualityScore.toFixed(1)}，中位股息率 ${(theme.fundamentalSnapshot.medianDividendYield * 100).toFixed(1)}%。`
    ],
    risks: [
      theme.leadership.today.participationLabel === "龙头主导" ? "上涨集中于少数核心标的，扩散不足时容易回撤。" : "若增量成交减弱，板块热度可能回落。",
      fundamentalSupportive ? "基本面支持存在，但仍需后续财报持续确认。" : "篮子内公司质量差异较大，主题持续性需继续验证。",
      "结论仅用于研究支持，不构成投资建议。"
    ],
    sources: ["marketData", "financialData", "themeRules", "aiSynthesis"]
  };
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

  const themes: ThemeSnapshot[] = raw.themeBaskets.map((basket) => {
    const members = securities.filter((security) => basket.symbols.includes(security.symbol));
    const theme: ThemeSnapshot = {
      slug: basket.slug,
      name: basket.nameZh,
      description: basket.descriptionZh,
      focus: basket.focus,
      memberCount: members.length,
      positiveCount: members.filter((security) => security.return1d > 0).length,
      internalBreadth: members.filter((security) => security.return1d > 0).length / Math.max(1, members.length),
      avgTurnoverDelta: average(members.map((security) => security.turnoverDelta)),
      leadership: {
        today: buildThemeLeadership(members, "return1d"),
        fiveDay: buildThemeLeadership(members, "return5d"),
        twentyDay: buildThemeLeadership(members, "return20d")
      },
      topLeaders: [...members].sort((a, b) => b.return5d * b.leaderScore - a.return5d * a.leaderScore).slice(0, 3),
      constituents: members,
      fundamentalSnapshot: {
        averageQualityScore: Number(average(members.map((security) => security.qualityScore)).toFixed(1)),
        averageMomentumScore: Number(average(members.map((security) => security.momentumScore)).toFixed(1)),
        medianRevenueGrowth: median(members.map((security) => security.fundamentals.revenueGrowth)),
        medianRoe: median(members.map((security) => security.fundamentals.roe)),
        medianDividendYield: median(members.map((security) => security.fundamentals.dividendYield))
      },
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
      marketNarrative: `当前最强主题集中在 ${strongestThemes.map((theme) => theme.name).join("、")}。`,
      driverNarrative:
        overallBreadth >= 0.62 && averageQuality >= 58
          ? "主线更像景气与基本面共同驱动，不是单纯少数龙头拉抬。"
          : overallBreadth < 0.5
            ? "更偏结构性情绪轮动，少数龙头和题材热点主导。"
            : "当前属于价量与基本面交织的混合驱动。",
      supportingEvidence: [
        `主题平均广度 ${(overallBreadth * 100).toFixed(1)}%。`,
        `今日前三强主题为 ${strongestThemes.map((theme) => theme.name).join("、")}。`,
        `主题平均质量分 ${averageQuality.toFixed(1)}，用于区分热度与质量。`
      ],
      risks: [
        "高热主题若成交无法延续，轮动速度可能加快。",
        "题材走强并不等于基本面同步改善，仍需结合财报验证。",
        "结论仅用于研究支持，不构成投资建议。"
      ],
      sources: ["marketData", "financialData", "themeRules", "aiSynthesis"]
    }
  };
}
