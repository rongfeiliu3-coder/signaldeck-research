export type Locale = "en" | "zh";

export const defaultLocale: Locale = "zh";
export const localeCookieName = "signaldeck-locale";

const dictionaries = {
  en: {
    nav: {
      market: "Market",
      themes: "Themes",
      fundamentals: "Fundamentals",
      funds: "Funds",
      subtitle: "A-share research workspace"
    },
    footer: {
      disclaimer: "Research support only. Not a live trading or investment-advice product.",
      roadmap: "Built for pluggable data providers and end-of-day refresh."
    },
    common: {
      defaultBadge: "A-share research support",
      noSampleData: "No sample data",
      noChartData: "No chart data available.",
      latestValue: "Latest",
      manualRefresh: "Refresh",
      refreshing: "Refreshing...",
      refreshReady: "Workspace refreshed.",
      rationalSummary: "Rational Summary",
      educationalDisclaimer: "Research disclaimer",
      backToThemes: "Back to themes"
    },
    evidenceSources: {
      marketData: "Market data",
      financialData: "Financial data",
      themeRules: "Theme rules",
      aiSynthesis: "AI synthesis"
    },
    marketLeadership: {
      eyebrow: "Structured market rotation",
      title: "Market Leadership",
      description:
        "Track A-share themes across today, 5 days, and 20 days with heat, breadth, turnover change, and leader concentration kept separate.",
      heat: "Heat",
      breadth: "Breadth",
      turnover: "Turnover change",
      concentration: "Leader concentration",
      today: "Today",
      fiveDay: "5D",
      twentyDay: "20D",
      boardTitle: "Theme ranking",
      boardBody: "Use the three windows together to tell apart fresh rotation from durable leadership."
    },
    themeResearch: {
      eyebrow: "Curated theme baskets",
      title: "Theme Research",
      description:
        "Curated A-share theme pages combine performance, breadth, leaders, and fundamentals snapshots with evidence-based summaries.",
      configHint: "Theme baskets are editable through config files instead of hardcoded UI lists.",
      curatedBasket: "Curated basket",
      breadth: "Internal breadth",
      turnoverChange: "Turnover change",
      fundamentalQuality: "Fundamental quality",
      activityClue: "Activity clue",
      marketMomentumScore: (value: number) => `Momentum ${value.toFixed(1)}/100`,
      positiveMembers: (positive: number, total: number) => `${positive}/${total} members positive`,
      configFile: "Config file",
      leaderTrend: "Leader trend",
      chartBody: "Uses the top leader's recent path as a quick proxy for chase intensity inside the theme.",
      latestLeaderPrice: "Leader latest price",
      leaderStocks: "Leader stocks",
      evidencePanel: "Structured evidence",
      constituents: "Current constituents",
      medianRoe: (value: number) => `Median ROE ${(value * 100).toFixed(1)}%`,
      leaderConcentration: (value: number) => `Leader concentration ${(value * 100).toFixed(0)}%`
    },
    fundamentals: {
      eyebrow: "Transparent scoring",
      title: "Fundamentals Dashboard",
      description:
        "Review A-share fundamentals with a transparent scoring system that keeps business quality separate from market momentum.",
      transparency: "Transparent and adjustable",
      weightHint: "Weights come from config and can be changed without rewriting the page.",
      methodTitle: "Scoring method",
      methodBody: "Quality score uses weighted thresholds. Momentum is shown separately so price strength does not masquerade as business quality.",
      tableTitle: "Fundamental panel",
      tableBody: "Use the table below to compare quality and momentum across the research universe.",
      stock: "Stock",
      qualityScore: "Quality score",
      momentumScore: "Momentum score",
      revenueGrowth: "Revenue growth",
      netProfitGrowth: "Net profit growth",
      grossMargin: "Gross margin",
      debtRatio: "Debt ratio",
      operatingCashFlow: "Operating cash flow",
      dividendYield: "Dividend yield"
    },
    funds: {
      eyebrow: "Exposure diagnostics",
      title: "Fund Diagnostics",
      description:
        "Inspect fund-like baskets through sector, theme, and style exposure so research focuses on actual allocation instead of labels alone.",
      topSector: "Top sector",
      themeOverlap: "Tracked-theme overlap",
      themeExposure: "Theme exposure",
      styleExposure: "Style exposure",
      qualityScore: "Weighted quality",
      momentumScore: "Weighted momentum",
      architectureTitle: "Prepared for public fund data",
      architectureBody: "The page uses mock fund baskets today, but the exposure logic is ready for public fund holdings later.",
      architecture1: "Replace the holdings input, not the page logic.",
      architecture2: "Keep disclosure date and source metadata with future live holdings.",
      architecture3: "Continue separating theme, sector, and style exposure instead of collapsing them into one label."
    },
    summary: {
      marketQuestion: "What is the market trading?",
      driverQuestion: "Is it sentiment-led or fundamentals-led?",
      evidenceQuestion: "What evidence supports it?",
      riskQuestion: "What are the risks or counter-evidence?"
    },
    symbol: {
      titleSuffix: "Research Card",
      themeMembership: "Theme membership",
      qualityScore: "Quality score",
      momentumScore: "Momentum score",
      turnoverRate: "Turnover rate",
      marketCap: "Market cap",
      recentPerformance: "Recent performance",
      recentBody: "This page keeps the stock inside its sector, theme, and quality-vs-momentum context."
    },
    notFound: {
      title: "Not found",
      body: "This symbol or theme is not available in the current workspace snapshot.",
      action: "Return to market page"
    }
  },
  zh: {
    nav: {
      market: "市场主线",
      themes: "主题研究",
      fundamentals: "基本面看板",
      funds: "基金透视",
      subtitle: "A 股研究工作台"
    },
    footer: {
      disclaimer: "本产品仅用于研究支持，不用于实盘交易，也不构成投资建议。",
      roadmap: "当前版本已为可插拔数据源与收盘后刷新流程预留清晰路径。"
    },
    common: {
      defaultBadge: "A 股研究支持",
      noSampleData: "暂无样本数据",
      noChartData: "当前没有可展示的图表数据。",
      latestValue: "最新值",
      manualRefresh: "手动刷新",
      refreshing: "刷新中...",
      refreshReady: "研究工作台已刷新。",
      rationalSummary: "研究结论",
      educationalDisclaimer: "研究用途声明",
      backToThemes: "返回主题研究"
    },
    evidenceSources: {
      marketData: "市场数据",
      financialData: "财务数据",
      themeRules: "主题规则",
      aiSynthesis: "AI 综合归纳"
    },
    marketLeadership: {
      eyebrow: "结构化观察市场轮动",
      title: "市场主线",
      description: "按今日、5 日、20 日三个窗口观察 A 股主题强弱，并把热度、广度、换手变化和龙头集中度拆开看。",
      heat: "热度",
      breadth: "广度",
      turnover: "换手变化",
      concentration: "龙头集中度",
      today: "今日",
      fiveDay: "5日",
      twentyDay: "20日",
      boardTitle: "主题强弱排序",
      boardBody: "把三个窗口放在一起，才能分辨是短线爆发还是更持续的主线。"
    },
    themeResearch: {
      eyebrow: "可编辑主题篮子",
      title: "主题研究",
      description: "围绕自定义 A 股主题篮子，展示近期表现、内部广度、龙头股、基本面快照和证据化结论。",
      configHint: "主题篮子来自配置文件，便于你持续维护自己的研究框架。",
      curatedBasket: "主题篮子",
      breadth: "内部广度",
      turnoverChange: "换手变化",
      fundamentalQuality: "基本面质量",
      activityClue: "观察增量资金是否跟进",
      marketMomentumScore: (value: number) => `动量 ${value.toFixed(1)}/100`,
      positiveMembers: (positive: number, total: number) => `${positive}/${total} 只成员上涨`,
      configFile: "配置文件",
      leaderTrend: "龙头走势",
      chartBody: "以主题内领先个股的近期走势作为板块情绪与追涨强度的快速参考。",
      latestLeaderPrice: "龙头最新价",
      leaderStocks: "龙头股",
      evidencePanel: "结构化证据",
      constituents: "当前成分",
      medianRoe: (value: number) => `中位数 ROE ${(value * 100).toFixed(1)}%`,
      leaderConcentration: (value: number) => `龙头集中度 ${(value * 100).toFixed(0)}%`
    },
    fundamentals: {
      eyebrow: "透明评分框架",
      title: "基本面看板",
      description: "把 A 股公司的成长、盈利、杠杆、现金流和分红放在同一个透明评分框架下，同时单独显示市场动量。",
      transparency: "透明且可调",
      weightHint: "权重来自配置文件，可按你的研究框架继续调整。",
      methodTitle: "评分方法",
      methodBody: "质量分使用加权阈值法，动量分单独展示，避免把价格强势误当成基本面强势。",
      tableTitle: "基本面面板",
      tableBody: "下表用于快速对照研究池内个股的质量分与动量分。",
      stock: "个股",
      qualityScore: "质量分",
      momentumScore: "动量分",
      revenueGrowth: "营收增长",
      netProfitGrowth: "净利润增长",
      grossMargin: "毛利率",
      debtRatio: "负债率",
      operatingCashFlow: "经营现金流",
      dividendYield: "股息率"
    },
    funds: {
      eyebrow: "持仓与暴露诊断",
      title: "基金透视",
      description: "从行业、主题、风格三层拆解基金或基金式篮子的真实暴露，帮助你理解资金究竟配向哪里。",
      topSector: "第一大行业",
      themeOverlap: "跟踪主题重合度",
      themeExposure: "主题暴露",
      styleExposure: "风格暴露",
      qualityScore: "加权质量分",
      momentumScore: "加权动量分",
      architectureTitle: "为公募数据接入预留架构",
      architectureBody: "当前页面使用 mock 基金篮子验证透视逻辑，未来只需替换持仓输入层即可接入公开基金数据。",
      architecture1: "替换的是 holdings 输入，不是页面逻辑。",
      architecture2: "未来接入真实基金时，应保留披露日期与来源字段。",
      architecture3: "继续把主题、行业、风格分开展示，而不是压缩成单一标签。"
    },
    summary: {
      marketQuestion: "市场在炒什么",
      driverQuestion: "这个方向更像情绪驱动还是基本面驱动",
      evidenceQuestion: "有哪些支持证据",
      riskQuestion: "有哪些风险或反证"
    },
    symbol: {
      titleSuffix: "研究卡片",
      themeMembership: "所属主题",
      qualityScore: "质量分",
      momentumScore: "动量分",
      turnoverRate: "换手率",
      marketCap: "市值",
      recentPerformance: "近期表现",
      recentBody: "本页把个股放回行业、主题与质量/动量框架里看，而不是只看单日涨跌。"
    },
    notFound: {
      title: "未找到相关对象",
      body: "当前研究快照中没有这个主题或个股。",
      action: "返回市场主线"
    }
  }
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
