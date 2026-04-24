import themeBaskets from "@/config/theme-baskets.json";
import { AShareDataAdapter } from "@/lib/data/adapters/base";
import { BasketConfig, FundBasket, LinePoint, RawResearchData, SecurityRecord } from "@/lib/types";

function createLineSeries(start: number, returns: number[]): LinePoint[] {
  const endDate = new Date("2026-04-24T00:00:00Z");
  let price = start;

  return returns.map((dailyReturn, index) => {
    const date = new Date(endDate);
    date.setUTCDate(endDate.getUTCDate() - (returns.length - index - 1));
    price *= 1 + dailyReturn;
    return {
      date: date.toISOString().slice(0, 10),
      value: Number(price.toFixed(2))
    };
  });
}

function createProfile(seed: number, tone: "defensive" | "rotation" | "growth") {
  const length = 20;
  const baseDrift = tone === "defensive" ? 0.0022 : tone === "rotation" ? 0.0046 : 0.0034;
  const waveA = tone === "growth" ? 0.012 : 0.008;
  const waveB = tone === "rotation" ? 0.017 : 0.011;

  return Array.from({ length }, (_, index) => {
    const swing = Math.sin((index + 1) * 0.55 + seed) * waveA + Math.cos((index + 1) * 0.23 + seed * 0.7) * waveB;
    return Number((baseDrift + swing * 0.12).toFixed(4));
  });
}

const securities: SecurityRecord[] = [
  {
    symbol: "600900.SH",
    name: "长江电力",
    exchange: "SH",
    industry: "Power Utilities",
    sector: "Utilities",
    styleTags: ["high-dividend", "state-owned", "cash-flow"],
    themeTags: ["power-utilities", "high-dividend"],
    description: "大型水电龙头，具备稳健现金流与分红属性。",
    price: 31.86,
    marketCapCnyBn: 780,
    turnoverRate: 0.013,
    turnoverDelta: 0.001,
    return1d: 0.012,
    return5d: 0.039,
    return20d: 0.081,
    leaderScore: 0.72,
    fundamentals: {
      revenueGrowth: 0.081,
      netProfitGrowth: 0.132,
      roe: 0.164,
      grossMargin: 0.53,
      debtRatio: 0.42,
      operatingCashFlow: 36600000000,
      dividendYield: 0.036
    },
    history: createLineSeries(27.4, createProfile(1.1, "defensive"))
  },
  {
    symbol: "600795.SH",
    name: "国电电力",
    exchange: "SH",
    industry: "Thermal Power",
    sector: "Utilities",
    styleTags: ["high-dividend", "state-owned"],
    themeTags: ["power-utilities", "high-dividend"],
    description: "火电与新能源运营并存，兼具红利与景气修复观察价值。",
    price: 5.34,
    marketCapCnyBn: 95,
    turnoverRate: 0.026,
    turnoverDelta: 0.004,
    return1d: 0.021,
    return5d: 0.065,
    return20d: 0.118,
    leaderScore: 0.69,
    fundamentals: {
      revenueGrowth: 0.104,
      netProfitGrowth: 0.196,
      roe: 0.132,
      grossMargin: 0.214,
      debtRatio: 0.63,
      operatingCashFlow: 15200000000,
      dividendYield: 0.041
    },
    history: createLineSeries(4.3, createProfile(1.5, "rotation"))
  },
  {
    symbol: "600886.SH",
    name: "国投电力",
    exchange: "SH",
    industry: "Power Generation",
    sector: "Utilities",
    styleTags: ["quality", "cash-flow"],
    themeTags: ["power-utilities"],
    description: "水火并举的综合电力平台，盈利韧性较强。",
    price: 18.24,
    marketCapCnyBn: 136,
    turnoverRate: 0.018,
    turnoverDelta: 0.002,
    return1d: 0.016,
    return5d: 0.048,
    return20d: 0.094,
    leaderScore: 0.63,
    fundamentals: {
      revenueGrowth: 0.076,
      netProfitGrowth: 0.144,
      roe: 0.148,
      grossMargin: 0.292,
      debtRatio: 0.56,
      operatingCashFlow: 11800000000,
      dividendYield: 0.031
    },
    history: createLineSeries(15.8, createProfile(1.7, "defensive"))
  },
  {
    symbol: "600011.SH",
    name: "华能国际",
    exchange: "SH",
    industry: "Thermal Power",
    sector: "Utilities",
    styleTags: ["turnaround", "value"],
    themeTags: ["power-utilities"],
    description: "火电业绩弹性明显，偏周期修复逻辑。",
    price: 9.62,
    marketCapCnyBn: 150,
    turnoverRate: 0.032,
    turnoverDelta: 0.008,
    return1d: 0.028,
    return5d: 0.074,
    return20d: 0.136,
    leaderScore: 0.76,
    fundamentals: {
      revenueGrowth: 0.092,
      netProfitGrowth: 0.242,
      roe: 0.116,
      grossMargin: 0.176,
      debtRatio: 0.71,
      operatingCashFlow: 17400000000,
      dividendYield: 0.022
    },
    history: createLineSeries(7.1, createProfile(1.9, "rotation"))
  },
  {
    symbol: "601985.SH",
    name: "中国核电",
    exchange: "SH",
    industry: "Nuclear Power",
    sector: "Utilities",
    styleTags: ["high-dividend", "policy"],
    themeTags: ["power-utilities", "high-dividend", "low-carbon-energy"],
    description: "核电运营核心标的，兼具低碳与现金流属性。",
    price: 11.43,
    marketCapCnyBn: 215,
    turnoverRate: 0.015,
    turnoverDelta: 0.001,
    return1d: 0.011,
    return5d: 0.031,
    return20d: 0.067,
    leaderScore: 0.58,
    fundamentals: {
      revenueGrowth: 0.064,
      netProfitGrowth: 0.109,
      roe: 0.127,
      grossMargin: 0.381,
      debtRatio: 0.62,
      operatingCashFlow: 20700000000,
      dividendYield: 0.029
    },
    history: createLineSeries(9.8, createProfile(2.1, "defensive"))
  },
  {
    symbol: "300274.SZ",
    name: "阳光电源",
    exchange: "SZ",
    industry: "Energy Storage",
    sector: "New Energy",
    styleTags: ["growth", "equipment"],
    themeTags: ["low-carbon-energy"],
    description: "储能与逆变器龙头，兼具出海与景气弹性。",
    price: 89.6,
    marketCapCnyBn: 186,
    turnoverRate: 0.044,
    turnoverDelta: 0.011,
    return1d: 0.033,
    return5d: 0.085,
    return20d: 0.176,
    leaderScore: 0.84,
    fundamentals: {
      revenueGrowth: 0.216,
      netProfitGrowth: 0.281,
      roe: 0.252,
      grossMargin: 0.297,
      debtRatio: 0.49,
      operatingCashFlow: 10700000000,
      dividendYield: 0.008
    },
    history: createLineSeries(68.2, createProfile(2.5, "growth"))
  },
  {
    symbol: "601012.SH",
    name: "隆基绿能",
    exchange: "SH",
    industry: "Solar",
    sector: "New Energy",
    styleTags: ["cyclical", "value"],
    themeTags: ["low-carbon-energy"],
    description: "光伏龙头，适合观察产业链景气修复与资金回流。",
    price: 22.14,
    marketCapCnyBn: 168,
    turnoverRate: 0.038,
    turnoverDelta: 0.009,
    return1d: 0.024,
    return5d: 0.079,
    return20d: 0.141,
    leaderScore: 0.79,
    fundamentals: {
      revenueGrowth: 0.031,
      netProfitGrowth: -0.084,
      roe: 0.071,
      grossMargin: 0.181,
      debtRatio: 0.55,
      operatingCashFlow: 4800000000,
      dividendYield: 0.012
    },
    history: createLineSeries(18.9, createProfile(2.7, "rotation"))
  },
  {
    symbol: "002594.SZ",
    name: "比亚迪",
    exchange: "SZ",
    industry: "EV & Battery",
    sector: "New Energy",
    styleTags: ["growth", "quality"],
    themeTags: ["low-carbon-energy"],
    description: "新能源整车与电池双重龙头，兼具产业链代表性。",
    price: 232.4,
    marketCapCnyBn: 675,
    turnoverRate: 0.027,
    turnoverDelta: 0.005,
    return1d: 0.014,
    return5d: 0.049,
    return20d: 0.113,
    leaderScore: 0.71,
    fundamentals: {
      revenueGrowth: 0.163,
      netProfitGrowth: 0.187,
      roe: 0.224,
      grossMargin: 0.218,
      debtRatio: 0.61,
      operatingCashFlow: 33100000000,
      dividendYield: 0.006
    },
    history: createLineSeries(198.5, createProfile(3.1, "growth"))
  },
  {
    symbol: "688223.SH",
    name: "晶科能源",
    exchange: "SH",
    industry: "Solar Components",
    sector: "New Energy",
    styleTags: ["beta", "cyclical"],
    themeTags: ["low-carbon-energy"],
    description: "光伏组件代表标的，波动与题材弹性更明显。",
    price: 8.93,
    marketCapCnyBn: 90,
    turnoverRate: 0.051,
    turnoverDelta: 0.013,
    return1d: 0.041,
    return5d: 0.097,
    return20d: 0.188,
    leaderScore: 0.87,
    fundamentals: {
      revenueGrowth: 0.055,
      netProfitGrowth: -0.021,
      roe: 0.084,
      grossMargin: 0.132,
      debtRatio: 0.67,
      operatingCashFlow: 2800000000,
      dividendYield: 0.0
    },
    history: createLineSeries(6.4, createProfile(3.4, "rotation"))
  },
  {
    symbol: "600406.SH",
    name: "国电南瑞",
    exchange: "SH",
    industry: "Grid Equipment",
    sector: "Electrical Equipment",
    styleTags: ["quality", "policy"],
    themeTags: ["low-carbon-energy", "power-utilities"],
    description: "电网自动化龙头，连接电力设备与新能源消纳。",
    price: 24.52,
    marketCapCnyBn: 197,
    turnoverRate: 0.019,
    turnoverDelta: 0.003,
    return1d: 0.019,
    return5d: 0.044,
    return20d: 0.089,
    leaderScore: 0.61,
    fundamentals: {
      revenueGrowth: 0.126,
      netProfitGrowth: 0.148,
      roe: 0.201,
      grossMargin: 0.274,
      debtRatio: 0.34,
      operatingCashFlow: 9200000000,
      dividendYield: 0.019
    },
    history: createLineSeries(20.4, createProfile(3.6, "growth"))
  },
  {
    symbol: "600118.SH",
    name: "中国卫星",
    exchange: "SH",
    industry: "Satellite Manufacturing",
    sector: "Aerospace",
    styleTags: ["policy", "theme"],
    themeTags: ["satellite-aerospace"],
    description: "卫星制造与应用代表标的，题材属性较强。",
    price: 26.32,
    marketCapCnyBn: 31,
    turnoverRate: 0.067,
    turnoverDelta: 0.021,
    return1d: 0.045,
    return5d: 0.101,
    return20d: 0.172,
    leaderScore: 0.9,
    fundamentals: {
      revenueGrowth: 0.047,
      netProfitGrowth: 0.061,
      roe: 0.073,
      grossMargin: 0.184,
      debtRatio: 0.37,
      operatingCashFlow: 1500000000,
      dividendYield: 0.004
    },
    history: createLineSeries(20.6, createProfile(4.1, "rotation"))
  },
  {
    symbol: "300455.SZ",
    name: "航天智装",
    exchange: "SZ",
    industry: "Aerospace Electronics",
    sector: "Aerospace",
    styleTags: ["theme", "small-cap"],
    themeTags: ["satellite-aerospace"],
    description: "军工电子与卫星产业链弹性品种。",
    price: 16.84,
    marketCapCnyBn: 12,
    turnoverRate: 0.098,
    turnoverDelta: 0.028,
    return1d: 0.061,
    return5d: 0.148,
    return20d: 0.231,
    leaderScore: 0.95,
    fundamentals: {
      revenueGrowth: 0.082,
      netProfitGrowth: 0.119,
      roe: 0.096,
      grossMargin: 0.266,
      debtRatio: 0.29,
      operatingCashFlow: 620000000,
      dividendYield: 0.002
    },
    history: createLineSeries(12.1, createProfile(4.3, "rotation"))
  },
  {
    symbol: "600879.SH",
    name: "航天电子",
    exchange: "SH",
    industry: "Defense Electronics",
    sector: "Aerospace",
    styleTags: ["policy", "mid-cap"],
    themeTags: ["satellite-aerospace"],
    description: "军工电子中军，兼顾卫星链条与订单预期。",
    price: 11.72,
    marketCapCnyBn: 40,
    turnoverRate: 0.056,
    turnoverDelta: 0.012,
    return1d: 0.026,
    return5d: 0.079,
    return20d: 0.121,
    leaderScore: 0.73,
    fundamentals: {
      revenueGrowth: 0.093,
      netProfitGrowth: 0.112,
      roe: 0.087,
      grossMargin: 0.237,
      debtRatio: 0.41,
      operatingCashFlow: 2100000000,
      dividendYield: 0.011
    },
    history: createLineSeries(9.5, createProfile(4.5, "rotation"))
  },
  {
    symbol: "688297.SH",
    name: "中无人机",
    exchange: "SH",
    industry: "Unmanned Aerial",
    sector: "Aerospace",
    styleTags: ["theme", "growth"],
    themeTags: ["satellite-aerospace"],
    description: "无人机及装备平台，题材活跃时弹性较大。",
    price: 42.88,
    marketCapCnyBn: 29,
    turnoverRate: 0.074,
    turnoverDelta: 0.019,
    return1d: 0.039,
    return5d: 0.109,
    return20d: 0.164,
    leaderScore: 0.82,
    fundamentals: {
      revenueGrowth: 0.068,
      netProfitGrowth: 0.094,
      roe: 0.074,
      grossMargin: 0.305,
      debtRatio: 0.22,
      operatingCashFlow: 890000000,
      dividendYield: 0.0
    },
    history: createLineSeries(33.6, createProfile(4.7, "rotation"))
  },
  {
    symbol: "000547.SZ",
    name: "航天发展",
    exchange: "SZ",
    industry: "Aerospace Systems",
    sector: "Aerospace",
    styleTags: ["theme", "turnaround"],
    themeTags: ["satellite-aerospace"],
    description: "航天信息化与系统平台，偏事件驱动。",
    price: 8.44,
    marketCapCnyBn: 14,
    turnoverRate: 0.088,
    turnoverDelta: 0.024,
    return1d: 0.052,
    return5d: 0.128,
    return20d: 0.186,
    leaderScore: 0.88,
    fundamentals: {
      revenueGrowth: -0.012,
      netProfitGrowth: -0.063,
      roe: 0.031,
      grossMargin: 0.143,
      debtRatio: 0.46,
      operatingCashFlow: -180000000,
      dividendYield: 0.0
    },
    history: createLineSeries(6.2, createProfile(4.9, "rotation"))
  },
  {
    symbol: "601088.SH",
    name: "中国神华",
    exchange: "SH",
    industry: "Coal",
    sector: "Resources",
    styleTags: ["high-dividend", "cash-flow"],
    themeTags: ["high-dividend"],
    description: "高分红央企资源龙头，红利风格代表。",
    price: 42.78,
    marketCapCnyBn: 851,
    turnoverRate: 0.012,
    turnoverDelta: -0.001,
    return1d: 0.007,
    return5d: 0.024,
    return20d: 0.052,
    leaderScore: 0.54,
    fundamentals: {
      revenueGrowth: 0.028,
      netProfitGrowth: 0.044,
      roe: 0.194,
      grossMargin: 0.357,
      debtRatio: 0.29,
      operatingCashFlow: 103000000000,
      dividendYield: 0.068
    },
    history: createLineSeries(39.2, createProfile(5.1, "defensive"))
  },
  {
    symbol: "601398.SH",
    name: "工商银行",
    exchange: "SH",
    industry: "Bank",
    sector: "Financials",
    styleTags: ["high-dividend", "financial"],
    themeTags: ["high-dividend"],
    description: "大行代表，风格上偏红利与低波。",
    price: 6.03,
    marketCapCnyBn: 2150,
    turnoverRate: 0.005,
    turnoverDelta: 0,
    return1d: 0.005,
    return5d: 0.017,
    return20d: 0.046,
    leaderScore: 0.46,
    fundamentals: {
      revenueGrowth: 0.018,
      netProfitGrowth: 0.011,
      roe: 0.114,
      grossMargin: 0,
      debtRatio: 0.91,
      operatingCashFlow: 78000000000,
      dividendYield: 0.073
    },
    history: createLineSeries(5.6, createProfile(5.3, "defensive"))
  },
  {
    symbol: "601857.SH",
    name: "中国石油",
    exchange: "SH",
    industry: "Energy",
    sector: "Resources",
    styleTags: ["high-dividend", "resources"],
    themeTags: ["high-dividend"],
    description: "资源央企代表，兼顾红利与油气价格观察。",
    price: 9.56,
    marketCapCnyBn: 1749,
    turnoverRate: 0.008,
    turnoverDelta: 0.001,
    return1d: 0.009,
    return5d: 0.026,
    return20d: 0.049,
    leaderScore: 0.48,
    fundamentals: {
      revenueGrowth: 0.024,
      netProfitGrowth: 0.052,
      roe: 0.121,
      grossMargin: 0.192,
      debtRatio: 0.42,
      operatingCashFlow: 156000000000,
      dividendYield: 0.059
    },
    history: createLineSeries(8.7, createProfile(5.5, "defensive"))
  },
  {
    symbol: "600028.SH",
    name: "中国石化",
    exchange: "SH",
    industry: "Energy",
    sector: "Resources",
    styleTags: ["high-dividend", "value"],
    themeTags: ["high-dividend"],
    description: "高分红资源央企，适合观察红利风格强弱。",
    price: 6.97,
    marketCapCnyBn: 840,
    turnoverRate: 0.011,
    turnoverDelta: 0.001,
    return1d: 0.008,
    return5d: 0.022,
    return20d: 0.044,
    leaderScore: 0.44,
    fundamentals: {
      revenueGrowth: 0.019,
      netProfitGrowth: 0.037,
      roe: 0.099,
      grossMargin: 0.164,
      debtRatio: 0.47,
      operatingCashFlow: 92100000000,
      dividendYield: 0.064
    },
    history: createLineSeries(6.5, createProfile(5.7, "defensive"))
  },
  {
    symbol: "300308.SZ",
    name: "中际旭创",
    exchange: "SZ",
    industry: "Optical Modules",
    sector: "Technology",
    styleTags: ["growth", "ai"],
    themeTags: ["compute-ai"],
    description: "AI 光模块龙头，算力景气的高弹性观察标的。",
    price: 147.8,
    marketCapCnyBn: 165,
    turnoverRate: 0.052,
    turnoverDelta: 0.014,
    return1d: 0.037,
    return5d: 0.091,
    return20d: 0.168,
    leaderScore: 0.86,
    fundamentals: {
      revenueGrowth: 0.312,
      netProfitGrowth: 0.418,
      roe: 0.274,
      grossMargin: 0.336,
      debtRatio: 0.28,
      operatingCashFlow: 4200000000,
      dividendYield: 0.002
    },
    history: createLineSeries(118.4, createProfile(6.1, "growth"))
  },
  {
    symbol: "603019.SH",
    name: "中科曙光",
    exchange: "SH",
    industry: "Servers",
    sector: "Technology",
    styleTags: ["ai", "infrastructure"],
    themeTags: ["compute-ai"],
    description: "国产算力平台代表，适合观察算力主线中军。",
    price: 58.2,
    marketCapCnyBn: 85,
    turnoverRate: 0.047,
    turnoverDelta: 0.012,
    return1d: 0.029,
    return5d: 0.076,
    return20d: 0.143,
    leaderScore: 0.74,
    fundamentals: {
      revenueGrowth: 0.166,
      netProfitGrowth: 0.201,
      roe: 0.124,
      grossMargin: 0.248,
      debtRatio: 0.38,
      operatingCashFlow: 1700000000,
      dividendYield: 0.003
    },
    history: createLineSeries(46.8, createProfile(6.3, "growth"))
  },
  {
    symbol: "000977.SZ",
    name: "浪潮信息",
    exchange: "SZ",
    industry: "Servers",
    sector: "Technology",
    styleTags: ["ai", "beta"],
    themeTags: ["compute-ai"],
    description: "服务器龙头，算力板块中常见风向标。",
    price: 43.48,
    marketCapCnyBn: 64,
    turnoverRate: 0.061,
    turnoverDelta: 0.016,
    return1d: 0.034,
    return5d: 0.083,
    return20d: 0.152,
    leaderScore: 0.8,
    fundamentals: {
      revenueGrowth: 0.153,
      netProfitGrowth: 0.173,
      roe: 0.111,
      grossMargin: 0.144,
      debtRatio: 0.61,
      operatingCashFlow: 2300000000,
      dividendYield: 0.002
    },
    history: createLineSeries(35.9, createProfile(6.5, "growth"))
  },
  {
    symbol: "300394.SZ",
    name: "天孚通信",
    exchange: "SZ",
    industry: "Optical Components",
    sector: "Technology",
    styleTags: ["ai", "quality"],
    themeTags: ["compute-ai"],
    description: "光器件细分龙头，盈利质量相对更优。",
    price: 116.2,
    marketCapCnyBn: 64,
    turnoverRate: 0.039,
    turnoverDelta: 0.008,
    return1d: 0.021,
    return5d: 0.063,
    return20d: 0.127,
    leaderScore: 0.68,
    fundamentals: {
      revenueGrowth: 0.284,
      netProfitGrowth: 0.322,
      roe: 0.249,
      grossMargin: 0.557,
      debtRatio: 0.16,
      operatingCashFlow: 1900000000,
      dividendYield: 0.004
    },
    history: createLineSeries(95.1, createProfile(6.7, "growth"))
  },
  {
    symbol: "002281.SZ",
    name: "光迅科技",
    exchange: "SZ",
    industry: "Optical Modules",
    sector: "Technology",
    styleTags: ["ai", "mid-cap"],
    themeTags: ["compute-ai"],
    description: "光模块景气链条中的中坚力量。",
    price: 39.12,
    marketCapCnyBn: 31,
    turnoverRate: 0.054,
    turnoverDelta: 0.015,
    return1d: 0.036,
    return5d: 0.087,
    return20d: 0.149,
    leaderScore: 0.78,
    fundamentals: {
      revenueGrowth: 0.171,
      netProfitGrowth: 0.193,
      roe: 0.134,
      grossMargin: 0.231,
      debtRatio: 0.35,
      operatingCashFlow: 1050000000,
      dividendYield: 0.006
    },
    history: createLineSeries(31.4, createProfile(6.9, "growth"))
  }
];

const funds: FundBasket[] = [
  {
    slug: "grid-dividend-basket",
    code: "017001",
    name: "公用事业红利篮子",
    style: "防御收益",
    description: "偏电力、公用事业与高股息权重，用于观察防御资金配置。",
    holdings: [
      { symbol: "600900.SH", weight: 0.24 },
      { symbol: "600795.SH", weight: 0.14 },
      { symbol: "600886.SH", weight: 0.12 },
      { symbol: "601985.SH", weight: 0.11 },
      { symbol: "601088.SH", weight: 0.13 },
      { symbol: "601398.SH", weight: 0.12 },
      { symbol: "601857.SH", weight: 0.08 },
      { symbol: "600028.SH", weight: 0.06 }
    ]
  },
  {
    slug: "new-energy-upgrade",
    code: "017002",
    name: "低碳升级混合篮子",
    style: "景气成长",
    description: "偏新能源、算力和设备链条，适合观察成长轮动。",
    holdings: [
      { symbol: "300274.SZ", weight: 0.18 },
      { symbol: "002594.SZ", weight: 0.16 },
      { symbol: "601012.SH", weight: 0.12 },
      { symbol: "688223.SH", weight: 0.08 },
      { symbol: "600406.SH", weight: 0.12 },
      { symbol: "300308.SZ", weight: 0.1 },
      { symbol: "603019.SH", weight: 0.09 },
      { symbol: "000977.SZ", weight: 0.08 },
      { symbol: "300394.SZ", weight: 0.07 }
    ]
  },
  {
    slug: "satcom-growth-basket",
    code: "017003",
    name: "卫星算力进攻篮子",
    style: "主题进攻",
    description: "偏卫星航天与算力方向，主题活跃度更高。",
    holdings: [
      { symbol: "600118.SH", weight: 0.16 },
      { symbol: "300455.SZ", weight: 0.12 },
      { symbol: "600879.SH", weight: 0.1 },
      { symbol: "688297.SH", weight: 0.1 },
      { symbol: "000547.SZ", weight: 0.08 },
      { symbol: "300308.SZ", weight: 0.14 },
      { symbol: "002281.SZ", weight: 0.1 },
      { symbol: "300394.SZ", weight: 0.1 },
      { symbol: "603019.SH", weight: 0.1 }
    ]
  }
];

export class MockAshareAdapter implements AShareDataAdapter {
  readonly id = "mock" as const;
  readonly label = "Mock A-share Dataset";
  readonly mode = "mock" as const;

  isAvailable() {
    return true;
  }

  async fetchResearchData(): Promise<RawResearchData> {
    return {
      asOfDate: "2026-04-24",
      universeName: "A-share Theme Research Universe",
      themeBaskets: themeBaskets as BasketConfig[],
      securities,
      funds
    };
  }

  async refreshSnapshot() {
    return {
      ok: true,
      message: "已重新装载当前数据适配器；若未配置实时源，将继续使用本地 mock 快照。"
    };
  }
}
