export type EvidenceSource = "marketData" | "financialData" | "themeRules" | "aiSynthesis";

export type LinePoint = {
  date: string;
  value: number;
};

export type BasketConfig = {
  slug: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  focus: string;
  symbols: string[];
};

export type SecurityFundamentals = {
  revenueGrowth: number;
  netProfitGrowth: number;
  roe: number;
  grossMargin: number;
  debtRatio: number;
  operatingCashFlow: number;
  dividendYield: number;
};

export type ScoreComponent = {
  key: keyof SecurityFundamentals;
  label: string;
  rawValue: number;
  weight: number;
  score: number;
};

export type FundamentalsBreakdown = {
  totalScore: number;
  components: ScoreComponent[];
};

export type SecurityRecord = {
  symbol: string;
  name: string;
  exchange: "SH" | "SZ";
  industry: string;
  sector: string;
  styleTags: string[];
  themeTags: string[];
  description: string;
  price: number;
  marketCapCnyBn: number;
  turnoverRate: number;
  turnoverDelta: number;
  return1d: number;
  return5d: number;
  return20d: number;
  leaderScore: number;
  fundamentals: SecurityFundamentals;
  history: LinePoint[];
  qualityScore?: number;
  momentumScore?: number;
  fundamentalsBreakdown?: FundamentalsBreakdown;
};

export type LeadershipWindow = {
  avgReturn: number;
  breadth: number;
  turnoverChange: number;
  leaderConcentration: number;
  topFiveContribution: number;
  heat: number;
  participationLabel: string;
  rallyType: "leader-driven" | "broad-participation" | "mixed";
};

export type EvidenceItem = {
  source: EvidenceSource;
  label: string;
  detail: string;
};

export type RationalSummary = {
  marketNarrative: string;
  driverNarrative: string;
  supportingEvidence: string[];
  risks: string[];
  sources: EvidenceSource[];
};

export type ThemeSnapshot = {
  slug: string;
  name: string;
  description: string;
  focus: string;
  memberCount: number;
  positiveCount: number;
  internalBreadth: number;
  avgTurnoverDelta: number;
  leadership: {
    today: LeadershipWindow;
    fiveDay: LeadershipWindow;
    twentyDay: LeadershipWindow;
  };
  topLeaders: SecurityRecord[];
  constituents: SecurityRecord[];
  diagnostics: {
    narrativeType: "policy-driven" | "sentiment-driven" | "earnings-driven" | "mixed";
    stabilityStyle: "defensive" | "cyclical" | "balanced";
    dividendProxy: number;
    stabilityScore: number;
    growthScore: number;
    characteristicLabel: string;
  };
  fundamentalSnapshot: {
    averageQualityScore: number;
    averageMomentumScore: number;
    medianRevenueGrowth: number;
    medianRoe: number;
    medianDividendYield: number;
  };
  evidence: EvidenceItem[];
  summary: RationalSummary;
};

export type FundBasket = {
  slug: string;
  code?: string;
  name: string;
  style: string;
  description: string;
  holdings: Array<{
    symbol: string;
    weight: number;
  }>;
};

export type FundHoldingDiagnostic = {
  symbol: string;
  name: string;
  weight: number;
  sector: string;
  themeTags: string[];
  styleTags: string[];
  qualityScore: number;
  momentumScore: number;
  return1d: number;
  return5d: number;
  return20d: number;
};

export type FundDiagnostic = {
  slug: string;
  code?: string;
  name: string;
  style: string;
  description: string;
  topSector: string;
  sectorExposure: Array<{ name: string; weight: number }>;
  themeExposure: Array<{ slug: string; name: string; weight: number }>;
  styleExposure: Array<{ name: string; weight: number }>;
  trackedThemeOverlap: Array<{ slug: string; name: string; weight: number }>;
  averageQualityScore: number;
  averageMomentumScore: number;
  holdings: FundHoldingDiagnostic[];
};

export type OpportunityAssetType = "stock" | "fund" | "theme" | "sector";
export type OpportunityCategory = "long-term" | "medium-term" | "short-term" | "high-risk";
export type OpportunityStyle = "dividend" | "growth" | "cyclical" | "policy" | "sentiment" | "quality" | "ai" | "energy";
export type OpportunityHorizon = "long" | "medium" | "short";
export type OpportunityConfidence = "high" | "medium" | "low";
export type OpportunityRisk = "low" | "medium" | "high" | "very-high";
export type OpportunityDriver = "fundamentals-driven" | "sentiment-driven" | "policy-driven" | "mixed";

export type OpportunityScoreBreakdown = {
  marketStrength: number;
  breadthParticipation: number;
  turnoverActivity: number;
  leaderConcentration: number;
  fundamentalQuality: number;
  defensiveness: number;
  narrativeSupport: number;
  institutionalRelevance: number;
  longTerm: number;
  shortTerm: number;
  composite: number;
};

export type OpportunityItem = {
  id: string;
  title: string;
  assetType: OpportunityAssetType;
  assetRef: string;
  category: OpportunityCategory;
  style: OpportunityStyle[];
  timeHorizon: OpportunityHorizon;
  confidence: OpportunityConfidence;
  riskLevel: OpportunityRisk;
  driver: OpportunityDriver;
  trackedThemeSlugs: string[];
  scoreBreakdown: OpportunityScoreBreakdown;
  whyNow: string;
  supportingEvidence: string[];
  counterEvidence: string[];
  thesisInvalidation: string[];
  bullishCase: string;
  bearishCase: string;
};

export type OpportunityDiagnostic = {
  query: string;
  matchedType: OpportunityAssetType | "not-found";
  matchedName: string;
  matchedRef?: string;
  sectorExposure: Array<{ name: string; weight: number }>;
  themeExposure: Array<{ name: string; weight: number }>;
  styleExposure: Array<{ name: string; weight: number }>;
  trackedThemeOverlap: Array<{ name: string; weight: number }>;
  longTermSuitability: string;
  shortTermSuitability: string;
  recentStrength: string;
  majorRisks: string[];
  relatedOpportunityIds: string[];
};

export type OpportunityAiSummary = {
  provider: string;
  mode: "mock" | "live" | "disabled";
  overview: string;
  counterArgument: string;
  narrativeBias: string;
};

export type OpportunityLab = {
  opportunities: OpportunityItem[];
  byCategory: Record<OpportunityCategory, OpportunityItem[]>;
  aiSummary: OpportunityAiSummary;
};

export type MarketLeadershipBoard = {
  key: "today" | "fiveDay" | "twentyDay";
  label: string;
  themes: ThemeSnapshot[];
};

export type StrategyId = 
  | "high-dividend" 
  | "theme-rotation" 
  | "low-level-reversal" 
  | "short-term-sentiment" 
  | "fundamental-quality" 
  | "fund-exposure";

export type StrategyCandidate = {
  symbol: string;
  name: string;
  reason: string;
  score: number;
  assetType?: "stock" | "theme" | "fund";
  entryScore?: number;
  entryStage?: string;
  entryAction?: string;
  positionPlan?: string[];
  triggerSignals?: string[];
  waitForSignals?: string[];
  invalidationSignals?: string[];
  riskNotes?: string[];
  evidence?: string[];
  counterEvidence?: string[];
  metrics?: {
    momentum?: number;
    quality?: number;
    breadth?: number;
    turnoverActivity?: number;
    dividendDefensive?: number;
    riskControl?: number;
  };
};

export type StrategyModule = {
  id: StrategyId;
  nameZh: string;
  nameEn: string;
  horizonZh: string;
  horizonEn: string;
  riskZh: string;
  riskEn: string;
  scoringDimensions: string[];
  candidates: StrategyCandidate[];
  whySelectedZh: string;
  whySelectedEn: string;
  invalidationZh: string;
  invalidationEn: string;
  timingFramework?: {
    entryRule: string;
    addRule: string;
    reduceRule: string;
    avoidRule: string;
  };
  backtest?: {
    sampleSize: number;
    windowDays: number;
    cumulativeReturn: number;
    annualizedReturnProxy: number;
    maxDrawdown: number;
    hitRate: number;
    averageReturn: number;
    volatility: number;
    bestPeriod: number;
    worstPeriod: number;
    evidence: string[];
    limitations: string[];
  };
};

export type RawResearchData = {
  asOfDate: string;
  universeName: string;
  themeBaskets: BasketConfig[];
  securities: SecurityRecord[];
  funds: FundBasket[];
};

export type MarketWorkspace = {
  asOfDate: string;
  universeName: string;
  providerStatus: {
    current: string;
    mode: "mock" | "live";
    available: Array<{ id: string; label: string; mode: "mock" | "live" }>;
  };
  marketLeadership: MarketLeadershipBoard[];
  themes: ThemeSnapshot[];
  fundamentals: {
    scoringMethod: {
      weights: Record<string, number>;
    };
    stocks: SecurityRecord[];
  };
  funds: FundDiagnostic[];
  strategies: StrategyModule[];
  marketSummary: RationalSummary;
  opportunityLab: OpportunityLab;
};
