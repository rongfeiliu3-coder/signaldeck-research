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
  name: string;
  style: string;
  description: string;
  holdings: Array<{
    symbol: string;
    weight: number;
  }>;
};

export type FundDiagnostic = {
  slug: string;
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
};

export type MarketLeadershipBoard = {
  key: "today" | "fiveDay" | "twentyDay";
  label: string;
  themes: ThemeSnapshot[];
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
  marketSummary: RationalSummary;
};
