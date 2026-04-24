import { opportunityAgentWorkflow } from "@/lib/ai/workflows";
import {
  FundDiagnostic,
  MarketWorkspace,
  OpportunityCategory,
  OpportunityConfidence,
  OpportunityDiagnostic,
  OpportunityDriver,
  OpportunityHorizon,
  OpportunityItem,
  OpportunityLab,
  OpportunityRisk,
  OpportunityScoreBreakdown,
  OpportunityStyle,
  SecurityRecord,
  ThemeSnapshot
} from "@/lib/types";

type SectorSnapshot = {
  name: string;
  members: SecurityRecord[];
  avgReturn1d: number;
  avgReturn5d: number;
  avgReturn20d: number;
  breadth: number;
  turnoverDelta: number;
  avgQuality: number;
  avgDividendYield: number;
  avgMomentum: number;
  topThemes: Array<{ name: string; weight: number }>;
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

function topEntries(input: Record<string, number>, count = 4) {
  return Object.entries(input)
    .map(([name, weight]) => ({ name, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count);
}

function confidenceFromScore(score: number): OpportunityConfidence {
  if (score >= 72) return "high";
  if (score >= 56) return "medium";
  return "low";
}

function riskFromCategory(category: OpportunityCategory, activity: number, quality: number): OpportunityRisk {
  if (category === "high-risk" || activity >= 78 || quality < 45) return "high";
  if (category === "short-term" || activity >= 62) return "medium";
  return "low";
}

function driverFromInputs(narrativeSupport: number, fundamentalQuality: number, activity: number): OpportunityDriver {
  if (fundamentalQuality >= 68 && narrativeSupport >= 68) return "fundamentals-driven";
  if (activity >= 76 && fundamentalQuality < 58) return "sentiment-driven";
  if (narrativeSupport >= 78 && activity >= 55) return "policy-driven";
  return "mixed";
}

function pickStyles(source: string[], fallback: OpportunityStyle[] = ["quality"]): OpportunityStyle[] {
  const styles: OpportunityStyle[] = [];
  if (source.some((tag) => tag.includes("dividend") || tag.includes("cash-flow") || tag.includes("value"))) styles.push("dividend");
  if (source.some((tag) => tag.includes("growth") || tag.includes("ai"))) styles.push("growth");
  if (source.some((tag) => tag.includes("cyclical") || tag.includes("rotation") || tag.includes("resources"))) styles.push("cyclical");
  if (source.some((tag) => tag.includes("policy") || tag.includes("state-owned"))) styles.push("policy");
  if (source.some((tag) => tag.includes("theme") || tag.includes("beta") || tag.includes("small-cap"))) styles.push("sentiment");
  if (source.some((tag) => tag.includes("quality") || tag.includes("financial"))) styles.push("quality");
  return styles.length ? Array.from(new Set(styles)) : fallback;
}

function categoryFromSignals({
  quality,
  marketStrength,
  breadth,
  activity,
  concentration,
  defensiveness,
  driver
}: {
  quality: number;
  marketStrength: number;
  breadth: number;
  activity: number;
  concentration: number;
  defensiveness: number;
  driver: OpportunityDriver;
}) {
  if (driver === "sentiment-driven" && activity >= 72 && quality < 58) return "high-risk" as const;
  if (quality >= 68 && defensiveness >= 62 && marketStrength >= 50) return "long-term" as const;
  if (marketStrength >= 62 && breadth >= 55) return "medium-term" as const;
  if (activity >= 64 || concentration >= 72) return "short-term" as const;
  return "medium-term" as const;
}

function horizonFromCategory(category: OpportunityCategory): OpportunityHorizon {
  switch (category) {
    case "long-term":
      return "long";
    case "medium-term":
      return "medium";
    default:
      return "short";
  }
}

function makeScoreBreakdown(input: Omit<OpportunityScoreBreakdown, "composite">): OpportunityScoreBreakdown {
  const composite = (
    input.marketStrength * 0.2 +
    input.breadthParticipation * 0.14 +
    input.turnoverActivity * 0.12 +
    input.leaderConcentration * 0.08 +
    input.fundamentalQuality * 0.18 +
    input.defensiveness * 0.1 +
    input.narrativeSupport * 0.1 +
    input.institutionalRelevance * 0.08
  );

  return {
    ...input,
    composite: Number(composite.toFixed(1))
  };
}

function buildSectorSnapshots(workspace: MarketWorkspace): SectorSnapshot[] {
  const sectorMap = new Map<string, SecurityRecord[]>();

  workspace.fundamentals.stocks.forEach((stock) => {
    const group = sectorMap.get(stock.sector) ?? [];
    group.push(stock);
    sectorMap.set(stock.sector, group);
  });

  return [...sectorMap.entries()].map(([name, members]) => {
    const topThemes = topEntries(
      members.reduce<Record<string, number>>((accumulator, member) => {
        member.themeTags.forEach((tag) => {
          accumulator[tag] = (accumulator[tag] ?? 0) + 1;
        });
        return accumulator;
      }, {})
    );

    return {
      name,
      members,
      avgReturn1d: average(members.map((item) => item.return1d)),
      avgReturn5d: average(members.map((item) => item.return5d)),
      avgReturn20d: average(members.map((item) => item.return20d)),
      breadth: members.filter((item) => item.return1d > 0).length / Math.max(1, members.length),
      turnoverDelta: average(members.map((item) => item.turnoverDelta)),
      avgQuality: average(members.map((item) => item.qualityScore ?? 0)),
      avgDividendYield: average(members.map((item) => item.fundamentals.dividendYield)),
      avgMomentum: average(members.map((item) => item.momentumScore ?? 0)),
      topThemes: topThemes.map((item) => ({
        name: workspace.themes.find((theme) => theme.slug === item.name)?.name ?? item.name,
        weight: item.weight / Math.max(1, members.length)
      }))
    };
  });
}

function buildStockOpportunity(stock: SecurityRecord, workspace: MarketWorkspace): OpportunityItem {
  const relatedThemes = workspace.themes.filter((theme) => stock.themeTags.includes(theme.slug));
  const themeBreadth = average(relatedThemes.map((theme) => theme.internalBreadth));
  const themeNarrative = average(
    relatedThemes.map((theme) =>
      theme.diagnostics.narrativeType === "earnings-driven"
        ? 82
        : theme.diagnostics.narrativeType === "policy-driven"
          ? 74
          : theme.diagnostics.narrativeType === "sentiment-driven"
            ? 64
            : 58
    )
  );
  const fundOverlap = sum(
    workspace.funds.map((fund) => fund.holdings.filter((holding) => holding.symbol === stock.symbol).reduce((acc, item) => acc + item.weight, 0))
  );
  const scoreBreakdown = makeScoreBreakdown({
    marketStrength: clamp(45 + stock.return20d * 220 + stock.return5d * 260 + stock.return1d * 160),
    breadthParticipation: clamp(themeBreadth * 100),
    turnoverActivity: clamp(34 + stock.turnoverRate * 1200 + stock.turnoverDelta * 3200),
    leaderConcentration: clamp(stock.leaderScore * 100),
    fundamentalQuality: clamp(stock.qualityScore ?? 0),
    defensiveness: clamp(stock.fundamentals.dividendYield * 1500 + (1 - stock.fundamentals.debtRatio) * 42 + stock.fundamentals.roe * 90),
    narrativeSupport: clamp(themeNarrative),
    institutionalRelevance: clamp(fundOverlap * 240 + Math.min(stock.marketCapCnyBn, 400) * 0.12)
  });
  const driver = driverFromInputs(scoreBreakdown.narrativeSupport, scoreBreakdown.fundamentalQuality, scoreBreakdown.turnoverActivity);
  const category = categoryFromSignals({
    quality: scoreBreakdown.fundamentalQuality,
    marketStrength: scoreBreakdown.marketStrength,
    breadth: scoreBreakdown.breadthParticipation,
    activity: scoreBreakdown.turnoverActivity,
    concentration: scoreBreakdown.leaderConcentration,
    defensiveness: scoreBreakdown.defensiveness,
    driver
  });

  return {
    id: `stock:${stock.symbol}`,
    title: stock.name,
    assetType: "stock",
    assetRef: stock.symbol,
    category,
    style: pickStyles(stock.styleTags),
    timeHorizon: horizonFromCategory(category),
    confidence: confidenceFromScore(scoreBreakdown.composite),
    riskLevel: riskFromCategory(category, scoreBreakdown.turnoverActivity, scoreBreakdown.fundamentalQuality),
    driver,
    scoreBreakdown,
    whyNow: `${stock.name} 入选，主要因为价格强度 ${scoreBreakdown.marketStrength.toFixed(0)}、质量 ${scoreBreakdown.fundamentalQuality.toFixed(0)}、题材支持 ${scoreBreakdown.narrativeSupport.toFixed(0)}。`,
    supportingEvidence: [
      `20日涨幅 ${(stock.return20d * 100).toFixed(1)}%，5日涨幅 ${(stock.return5d * 100).toFixed(1)}%。`,
      `关联主题广度 ${(themeBreadth * 100).toFixed(1)}%，换手变化 ${(stock.turnoverDelta * 100).toFixed(1)}%。`,
      `质量分 ${(stock.qualityScore ?? 0).toFixed(1)}，股息率 ${(stock.fundamentals.dividendYield * 100).toFixed(1)}%。`
    ],
    counterEvidence: [
      `单股受主题轮动影响较大，当前集中度 ${scoreBreakdown.leaderConcentration.toFixed(0)}。`,
      stock.fundamentals.netProfitGrowth < 0 ? "利润增速仍未转正，基本面确认不足。" : "若主题扩散转弱，个股相对强势也可能回落。"
    ],
    thesisInvalidation: [
      "5日强度显著回落且换手同步降温。",
      "关联主题从广泛参与退回龙头独走。",
      "财报兑现弱于当前预期。"
    ],
    bullishCase: "如果主题热度维持、扩散没有塌、财务指标继续兑现，这类个股更容易从题材走向趋势。",
    bearishCase: "如果只是资金抱团式脉冲，或者市场风格切回防御，高弹性个股通常会先回撤。"
  };
}

function buildThemeOpportunity(theme: ThemeSnapshot, workspace: MarketWorkspace): OpportunityItem {
  const overlap = sum(
    workspace.funds.flatMap((fund) => fund.themeExposure.filter((item) => item.slug === theme.slug).map((item) => item.weight))
  );
  const scoreBreakdown = makeScoreBreakdown({
    marketStrength: clamp((theme.leadership.today.heat + theme.leadership.fiveDay.heat + theme.leadership.twentyDay.heat) / 3),
    breadthParticipation: clamp(theme.internalBreadth * 100),
    turnoverActivity: clamp(38 + theme.avgTurnoverDelta * 3600),
    leaderConcentration: clamp(theme.leadership.today.topFiveContribution * 100),
    fundamentalQuality: clamp(theme.fundamentalSnapshot.averageQualityScore),
    defensiveness: clamp(theme.diagnostics.stabilityScore * 0.65 + theme.diagnostics.dividendProxy * 900),
    narrativeSupport: clamp(
      theme.diagnostics.narrativeType === "earnings-driven"
        ? 84
        : theme.diagnostics.narrativeType === "policy-driven"
          ? 78
          : theme.diagnostics.narrativeType === "sentiment-driven"
            ? 66
            : 60
    ),
    institutionalRelevance: clamp(overlap * 180 + theme.memberCount * 5)
  });
  const driver = driverFromInputs(scoreBreakdown.narrativeSupport, scoreBreakdown.fundamentalQuality, scoreBreakdown.turnoverActivity);
  const category = categoryFromSignals({
    quality: scoreBreakdown.fundamentalQuality,
    marketStrength: scoreBreakdown.marketStrength,
    breadth: scoreBreakdown.breadthParticipation,
    activity: scoreBreakdown.turnoverActivity,
    concentration: scoreBreakdown.leaderConcentration,
    defensiveness: scoreBreakdown.defensiveness,
    driver
  });

  return {
    id: `theme:${theme.slug}`,
    title: theme.name,
    assetType: "theme",
    assetRef: theme.slug,
    category,
    style: pickStyles([theme.focus, theme.diagnostics.characteristicLabel, theme.diagnostics.narrativeType], ["quality"]),
    timeHorizon: horizonFromCategory(category),
    confidence: confidenceFromScore(scoreBreakdown.composite),
    riskLevel: riskFromCategory(category, scoreBreakdown.turnoverActivity, scoreBreakdown.fundamentalQuality),
    driver,
    scoreBreakdown,
    whyNow: `${theme.name} 进入机会列表，因为热度、广度和质量分没有被混成一个黑箱分，当前三项同时在线。`,
    supportingEvidence: [
      `今日热度 ${theme.leadership.today.heat.toFixed(1)}，5日热度 ${theme.leadership.fiveDay.heat.toFixed(1)}，20日热度 ${theme.leadership.twentyDay.heat.toFixed(1)}。`,
      `内部广度 ${(theme.internalBreadth * 100).toFixed(1)}%，前五贡献 ${(theme.leadership.today.topFiveContribution * 100).toFixed(0)}%。`,
      `质量均分 ${theme.fundamentalSnapshot.averageQualityScore.toFixed(1)}，股息代理 ${(theme.diagnostics.dividendProxy * 100).toFixed(1)}%。`
    ],
    counterEvidence: [
      theme.leadership.today.rallyType === "leader-driven" ? "上涨仍偏龙头驱动，扩散不够完整。" : "虽然扩散较好，但若成交衰减，趋势仍可能放缓。",
      theme.diagnostics.narrativeType === "sentiment-driven" ? "情绪占比偏高，后续更需要财务和订单验证。" : "若政策或业绩催化不兑现，主线地位可能松动。"
    ],
    thesisInvalidation: [
      "热度连续回落且广度跌破50%。",
      "前五贡献快速抬升，板块退回抱团式上涨。",
      "相关龙头出现明显放量滞涨。"
    ],
    bullishCase: "如果广度保持、核心股不掉队、财务或政策催化继续强化，主题更容易从短炒演变成趋势。",
    bearishCase: "如果只剩少数龙头维持强势，板块内部赚钱效应会迅速变差。"
  };
}

function buildSectorOpportunity(sector: SectorSnapshot): OpportunityItem {
  const scoreBreakdown = makeScoreBreakdown({
    marketStrength: clamp(42 + sector.avgReturn20d * 220 + sector.avgReturn5d * 260 + sector.avgReturn1d * 150),
    breadthParticipation: clamp(sector.breadth * 100),
    turnoverActivity: clamp(35 + sector.turnoverDelta * 3400),
    leaderConcentration: clamp(sector.members.length <= 2 ? 78 : 52),
    fundamentalQuality: clamp(sector.avgQuality),
    defensiveness: clamp(sector.avgDividendYield * 1500 + sector.avgQuality * 0.45),
    narrativeSupport: clamp(58 + sector.topThemes.length * 6),
    institutionalRelevance: clamp(sector.members.length * 12 + sector.avgMomentum * 0.35)
  });
  const driver = driverFromInputs(scoreBreakdown.narrativeSupport, scoreBreakdown.fundamentalQuality, scoreBreakdown.turnoverActivity);
  const category = categoryFromSignals({
    quality: scoreBreakdown.fundamentalQuality,
    marketStrength: scoreBreakdown.marketStrength,
    breadth: scoreBreakdown.breadthParticipation,
    activity: scoreBreakdown.turnoverActivity,
    concentration: scoreBreakdown.leaderConcentration,
    defensiveness: scoreBreakdown.defensiveness,
    driver
  });

  return {
    id: `sector:${sector.name}`,
    title: sector.name,
    assetType: "sector",
    assetRef: sector.name,
    category,
    style: pickStyles(sector.topThemes.map((item) => item.name), sector.avgDividendYield >= 0.03 ? ["dividend"] : ["quality"]),
    timeHorizon: horizonFromCategory(category),
    confidence: confidenceFromScore(scoreBreakdown.composite),
    riskLevel: riskFromCategory(category, scoreBreakdown.turnoverActivity, scoreBreakdown.fundamentalQuality),
    driver,
    scoreBreakdown,
    whyNow: `${sector.name} 入选，主要看的是行业层面的强度变化和参与扩散，而不是单只龙头行情。`,
    supportingEvidence: [
      `1日/5日/20日行业均涨分别为 ${(sector.avgReturn1d * 100).toFixed(1)}% / ${(sector.avgReturn5d * 100).toFixed(1)}% / ${(sector.avgReturn20d * 100).toFixed(1)}%。`,
      `行业广度 ${(sector.breadth * 100).toFixed(1)}%，平均质量分 ${sector.avgQuality.toFixed(1)}。`,
      `主导主题包括 ${sector.topThemes.map((item) => item.name).join("、") || "暂无明显主题"}。`
    ],
    counterEvidence: [
      "行业内公司数量有限时，广度信号会放大波动。",
      sector.avgDividendYield < 0.015 ? "防御垫较弱，回撤时缺少高股息缓冲。" : "虽然防御属性较好，但进攻弹性可能不如高景气板块。"
    ],
    thesisInvalidation: [
      "行业广度重新转弱。",
      "主导主题热度同步下降。",
      "个股强势无法向板块扩散。"
    ],
    bullishCase: "如果行业景气和主题催化同步延续，行业层面的修复通常比单只个股更稳。",
    bearishCase: "如果只是个别大市值公司带动，行业机会很容易被高估。"
  };
}

function buildFundOpportunity(fund: FundDiagnostic, workspace: MarketWorkspace): OpportunityItem {
  const weightedReturn5d = sum(fund.holdings.map((holding) => holding.return5d * holding.weight));
  const weightedReturn20d = sum(fund.holdings.map((holding) => holding.return20d * holding.weight));
  const breadth = sum(fund.holdings.filter((holding) => holding.return1d > 0).map((holding) => holding.weight));
  const topThemeWeight = fund.themeExposure[0]?.weight ?? 0;
  const scoreBreakdown = makeScoreBreakdown({
    marketStrength: clamp(46 + weightedReturn20d * 240 + weightedReturn5d * 260),
    breadthParticipation: clamp(breadth * 100),
    turnoverActivity: clamp(35 + average(fund.holdings.map((holding) => holding.return1d > 0 ? 0.03 : 0.01)) * 900),
    leaderConcentration: clamp(topThemeWeight * 100),
    fundamentalQuality: clamp(fund.averageQualityScore),
    defensiveness: clamp(
      average(fund.holdings.map((holding) => holding.qualityScore)) * 0.35 +
      sum(fund.styleExposure.filter((item) => item.name.includes("high-dividend")).map((item) => item.weight)) * 160
    ),
    narrativeSupport: clamp(fund.themeExposure.length ? 60 + fund.themeExposure.length * 5 : 52),
    institutionalRelevance: clamp(50 + fund.trackedThemeOverlap.reduce((acc, item) => acc + item.weight, 0) * 120)
  });
  const driver = driverFromInputs(scoreBreakdown.narrativeSupport, scoreBreakdown.fundamentalQuality, scoreBreakdown.turnoverActivity);
  const category = categoryFromSignals({
    quality: scoreBreakdown.fundamentalQuality,
    marketStrength: scoreBreakdown.marketStrength,
    breadth: scoreBreakdown.breadthParticipation,
    activity: scoreBreakdown.turnoverActivity,
    concentration: scoreBreakdown.leaderConcentration,
    defensiveness: scoreBreakdown.defensiveness,
    driver
  });

  return {
    id: `fund:${fund.slug}`,
    title: fund.name,
    assetType: "fund",
    assetRef: fund.code ?? fund.slug,
    category,
    style: pickStyles([fund.style, ...fund.styleExposure.map((item) => item.name)], ["quality"]),
    timeHorizon: horizonFromCategory(category),
    confidence: confidenceFromScore(scoreBreakdown.composite),
    riskLevel: riskFromCategory(category, scoreBreakdown.turnoverActivity, scoreBreakdown.fundamentalQuality),
    driver,
    scoreBreakdown,
    whyNow: `${fund.name} 入选，因为它能把板块机会和资金配置放到同一个框架里看。`,
    supportingEvidence: [
      `加权5日强度 ${(weightedReturn5d * 100).toFixed(1)}%，加权20日强度 ${(weightedReturn20d * 100).toFixed(1)}%。`,
      `正收益持仓权重 ${(breadth * 100).toFixed(1)}%，跟踪主题重合 ${(fund.trackedThemeOverlap.reduce((acc, item) => acc + item.weight, 0) * 100).toFixed(1)}%。`,
      `加权质量分 ${fund.averageQualityScore.toFixed(1)}，加权动量分 ${fund.averageMomentumScore.toFixed(1)}。`
    ],
    counterEvidence: [
      topThemeWeight >= 0.45 ? "主题暴露较集中，若核心方向退潮，回撤会更快。" : "风格分散会降低单一主线带来的弹性。",
      "当前仍是研究篮子，后续需要真实公募持仓进一步验证。"
    ],
    thesisInvalidation: [
      "主题重合度下降且强度同步走弱。",
      "质量分和动量分同时回落。",
      "主导板块从趋势行情退回短炒。"
    ],
    bullishCase: "如果主导主题继续强化，组合式篮子更容易平衡个股波动和主线收益。",
    bearishCase: "如果市场切换过快，组合暴露也可能变成钝化，失去相对收益。"
  };
}

export async function buildOpportunityLab(workspace: MarketWorkspace): Promise<OpportunityLab> {
  const sectors = buildSectorSnapshots(workspace);
  const stockOpportunities = workspace.fundamentals.stocks.map((stock) => buildStockOpportunity(stock, workspace));
  const themeOpportunities = workspace.themes.map((theme) => buildThemeOpportunity(theme, workspace));
  const sectorOpportunities = sectors.map((sector) => buildSectorOpportunity(sector));
  const fundOpportunities = workspace.funds.map((fund) => buildFundOpportunity(fund, workspace));

  const opportunities = [...stockOpportunities, ...themeOpportunities, ...sectorOpportunities, ...fundOpportunities]
    .sort((a, b) => b.scoreBreakdown.composite - a.scoreBreakdown.composite);

  const byCategory: OpportunityLab["byCategory"] = {
    "long-term": opportunities.filter((item) => item.category === "long-term").slice(0, 6),
    "medium-term": opportunities.filter((item) => item.category === "medium-term").slice(0, 6),
    "short-term": opportunities.filter((item) => item.category === "short-term").slice(0, 6),
    "high-risk": opportunities.filter((item) => item.category === "high-risk").slice(0, 6)
  };

  return {
    opportunities: opportunities.slice(0, 16),
    byCategory,
    aiSummary: await opportunityAgentWorkflow.generateOpportunityLabAiSummary(opportunities.slice(0, 8))
  };
}

function diagnosticExposureFromOpportunity(item: OpportunityItem): Array<{ name: string; weight: number }> {
  return item.style.map((style) => ({ name: style, weight: 1 / Math.max(item.style.length, 1) }));
}

export function buildOpportunityDiagnostic(workspace: MarketWorkspace, query: string): OpportunityDiagnostic {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return {
      query,
      matchedType: "not-found",
      matchedName: "未输入代码或主题",
      sectorExposure: [],
      themeExposure: [],
      styleExposure: [],
      trackedThemeOverlap: [],
      longTermSuitability: "请先输入股票代码、基金代码或主题名称。",
      shortTermSuitability: "等待输入后生成诊断。",
      recentStrength: "暂无。",
      majorRisks: ["未提供查询对象。"],
      relatedOpportunityIds: []
    };
  }

  const stock = workspace.fundamentals.stocks.find((item) => item.symbol.toLowerCase() === normalized || item.name.toLowerCase().includes(normalized));
  if (stock) {
    const relatedThemes = workspace.themes.filter((theme) => stock.themeTags.includes(theme.slug));
    const relatedOpportunities = workspace.opportunityLab.opportunities.filter((item) => item.assetType === "stock" && item.assetRef === stock.symbol);
    return {
      query,
      matchedType: "stock",
      matchedName: stock.name,
      matchedRef: stock.symbol,
      sectorExposure: [{ name: stock.sector, weight: 1 }],
      themeExposure: relatedThemes.map((theme) => ({ name: theme.name, weight: 1 / Math.max(relatedThemes.length, 1) })),
      styleExposure: pickStyles(stock.styleTags).map((style) => ({ name: style, weight: 1 / Math.max(pickStyles(stock.styleTags).length, 1) })),
      trackedThemeOverlap: relatedThemes.map((theme) => ({ name: theme.name, weight: 1 / Math.max(relatedThemes.length, 1) })),
      longTermSuitability: (stock.qualityScore ?? 0) >= 65 ? "质量分较高，更适合放入长线跟踪名单。" : "质量分一般，更适合跟踪而不是直接上升到长线框架。",
      shortTermSuitability: stock.turnoverDelta >= 0.008 ? "短线活跃度在抬升，适合放在交易观察区。" : "短线活跃度一般，适合等二次确认。",
      recentStrength: `1日/5日/20日分别为 ${(stock.return1d * 100).toFixed(1)}% / ${(stock.return5d * 100).toFixed(1)}% / ${(stock.return20d * 100).toFixed(1)}%。`,
      majorRisks: [
        "个股容易受主题轮动与资金偏好影响。",
        stock.fundamentals.netProfitGrowth < 0 ? "利润增速偏弱，基本面验证不足。" : "若主题扩散降温，强势可能难以延续。"
      ],
      relatedOpportunityIds: relatedOpportunities.map((item) => item.id)
    };
  }

  const fund = workspace.funds.find((item) => item.slug.toLowerCase() === normalized || (item.code ?? "").toLowerCase() === normalized || item.name.toLowerCase().includes(normalized));
  if (fund) {
    const relatedOpportunities = workspace.opportunityLab.opportunities.filter((item) => item.assetType === "fund" && item.assetRef === (fund.code ?? fund.slug));
    return {
      query,
      matchedType: "fund",
      matchedName: fund.name,
      matchedRef: fund.code ?? fund.slug,
      sectorExposure: fund.sectorExposure.slice(0, 4),
      themeExposure: fund.themeExposure.slice(0, 4).map((item) => ({ name: item.name, weight: item.weight })),
      styleExposure: fund.styleExposure.slice(0, 4).map((item) => ({ name: item.name, weight: item.weight })),
      trackedThemeOverlap: fund.trackedThemeOverlap.map((item) => ({ name: item.name, weight: item.weight })),
      longTermSuitability: fund.averageQualityScore >= 62 ? "组合质量分偏高，更适合中长期跟踪。" : "质量分一般，长线适配度取决于后续持仓明细。",
      shortTermSuitability: fund.averageMomentumScore >= 65 ? "近期动量不弱，适合作为趋势跟踪篮子。" : "短线更像配置观察，而不是交易弹性载体。",
      recentStrength: `加权质量分 ${fund.averageQualityScore.toFixed(1)}，加权动量分 ${fund.averageMomentumScore.toFixed(1)}。`,
      majorRisks: [
        "当前仍是 fund-like basket，不是公募真实持仓。",
        "主导主题过于集中时，组合回撤也会放大。"
      ],
      relatedOpportunityIds: relatedOpportunities.map((item) => item.id)
    };
  }

  const theme = workspace.themes.find((item) => item.slug.toLowerCase() === normalized || item.name.toLowerCase().includes(normalized));
  if (theme) {
    const relatedOpportunities = workspace.opportunityLab.opportunities.filter((item) => item.assetType === "theme" && item.assetRef === theme.slug);
    return {
      query,
      matchedType: "theme",
      matchedName: theme.name,
      matchedRef: theme.slug,
      sectorExposure: topEntries(
        theme.constituents.reduce<Record<string, number>>((accumulator, item) => {
          accumulator[item.sector] = (accumulator[item.sector] ?? 0) + 1;
          return accumulator;
        }, {})
      ).map((item) => ({ name: item.name, weight: item.weight / Math.max(theme.memberCount, 1) })),
      themeExposure: [{ name: theme.name, weight: 1 }],
      styleExposure: diagnosticExposureFromOpportunity(relatedOpportunities[0] ?? workspace.opportunityLab.opportunities[0]).slice(0, 4),
      trackedThemeOverlap: [{ name: theme.name, weight: 1 }],
      longTermSuitability: theme.fundamentalSnapshot.averageQualityScore >= 60 ? "主题质量分不低，适合放入长线观察。" : "主题更适合事件驱动或趋势跟踪，长线需要更多财务验证。",
      shortTermSuitability: theme.leadership.today.turnoverChange >= 0 ? "当前热度仍在，短线交易属性存在。" : "短线活跃度走平，更适合等待新的催化。",
      recentStrength: `今日热度 ${theme.leadership.today.heat.toFixed(1)}，5日热度 ${theme.leadership.fiveDay.heat.toFixed(1)}，20日热度 ${theme.leadership.twentyDay.heat.toFixed(1)}。`,
      majorRisks: [
        theme.leadership.today.rallyType === "leader-driven" ? "主题仍偏龙头驱动，广度不够。" : "若扩散衰减，主题可能重新回到分化。",
        "后续需要结合政策、财报或订单继续验证。"
      ],
      relatedOpportunityIds: relatedOpportunities.map((item) => item.id)
    };
  }

  const sector = buildSectorSnapshots(workspace).find((item) => item.name.toLowerCase().includes(normalized));
  if (sector) {
    const relatedOpportunities = workspace.opportunityLab.opportunities.filter((item) => item.assetType === "sector" && item.assetRef === sector.name);
    return {
      query,
      matchedType: "sector",
      matchedName: sector.name,
      matchedRef: sector.name,
      sectorExposure: [{ name: sector.name, weight: 1 }],
      themeExposure: sector.topThemes.map((item) => ({ name: item.name, weight: item.weight })),
      styleExposure: diagnosticExposureFromOpportunity(relatedOpportunities[0] ?? workspace.opportunityLab.opportunities[0]).slice(0, 4),
      trackedThemeOverlap: sector.topThemes.map((item) => ({ name: item.name, weight: item.weight })),
      longTermSuitability: sector.avgQuality >= 60 ? "行业质量分不差，可以作为中长期配置观察。" : "行业更适合趋势跟踪，长线仍需等待质量改善。",
      shortTermSuitability: sector.turnoverDelta >= 0 ? "行业层面有活跃资金参与。" : "行业活跃度一般，短线胜率依赖个股龙头。",
      recentStrength: `行业1日/5日/20日均涨 ${(sector.avgReturn1d * 100).toFixed(1)}% / ${(sector.avgReturn5d * 100).toFixed(1)}% / ${(sector.avgReturn20d * 100).toFixed(1)}%。`,
      majorRisks: [
        "行业样本较少时，均值会放大个股扰动。",
        "主导主题退潮会迅速传导到行业机会。"
      ],
      relatedOpportunityIds: relatedOpportunities.map((item) => item.id)
    };
  }

  return {
    query,
    matchedType: "not-found",
    matchedName: "未找到匹配对象",
    sectorExposure: [],
    themeExposure: [],
    styleExposure: [],
    trackedThemeOverlap: [],
    longTermSuitability: "未找到匹配代码或主题。",
    shortTermSuitability: "请尝试股票代码、基金代码、主题名或行业名。",
    recentStrength: "暂无匹配结果。",
    majorRisks: ["当前研究快照中没有匹配对象。"],
    relatedOpportunityIds: []
  };
}
