import { StrategyId } from "@/lib/types";

export type Locale = "en" | "zh";

export const defaultLocale: Locale = "zh";
export const localeCookieName = "signaldeck-locale";

const dictionaries = {
  en: {
    nav: {
      dashboard: "Dashboard",
      backtest: "Backtest",
      watchlist: "Watchlist",
      subtitle: "Research signals, locally"
    },
    footer: {
      disclaimer: "SignalDeck is for research and education. It is not a live trading product.",
      roadmap: "Local-first v1 built for a clean path to Vercel and Supabase later."
    },
    common: {
      defaultBadge: "v1 local prototype",
      noSampleData: "No sample data",
      noChartData: "No chart data available for this view.",
      latestValue: "Latest value",
      endingEquity: "Ending equity",
      rankPrefix: "Rank #",
      syntheticData: "Synthetic signal, deterministic sample data",
      daily: "Daily",
      sampleWindow: "Sample window",
      recentTrades: "Recent trades",
      newestFirst: "Newest first",
      currentModelRead: "Current model read",
      jumpToAnotherSymbol: "Jump to another symbol",
      educationalDisclaimer: "Educational disclaimer",
      viewBacktest: "View backtest",
      dashboardBack: "Dashboard",
      openWatchlist: "Open watchlist",
      openSymbolDetail: "Open symbol detail",
      compareStrategies: "Compare strategies",
      confidence: "Confidence",
      signalEngine: "Signal engine",
      tradeCount: "Trade count",
      exposure: "Exposure",
      researchNotes: "Research notes",
      strategyPlaybook: "Strategy playbook",
      setup: "Setup",
      quality: "Quality",
      notes: "Notes",
      bullish: "Bullish",
      neutral: "Neutral",
      defensive: "Defensive",
      strong: "Strong",
      balanced: "Balanced",
      cautious: "Cautious"
    },
    actions: {
      Buy: "Buy",
      Hold: "Hold",
      Reduce: "Reduce"
    },
    assetClasses: {
      ETF: "ETF",
      Equity: "Equity",
      Crypto: "Crypto"
    },
    assetMeta: {
      SPY: { sector: "US broad market", description: "Large-cap US equity market proxy." },
      QQQ: { sector: "US growth", description: "Nasdaq 100 technology-heavy equity proxy." },
      IWM: { sector: "US small caps", description: "Small-cap US equity market proxy." },
      TLT: { sector: "Rates", description: "Long-duration US Treasury exposure." },
      GLD: { sector: "Commodities", description: "Gold price exposure through a listed trust." },
      NVDA: { sector: "Semiconductors", description: "AI infrastructure and accelerated computing leader." },
      AAPL: { sector: "Consumer technology", description: "Consumer hardware, services, and ecosystem business." },
      TSLA: { sector: "Electric vehicles", description: "Electric vehicles, energy storage, and autonomy platform." },
      "BTC-USD": { sector: "Digital assets", description: "Bitcoin quoted in US dollars." },
      "ETH-USD": { sector: "Digital assets", description: "Ethereum quoted in US dollars." }
    },
    strategies: {
      "dual-ma": {
        name: "Dual Moving Average Crossover",
        description: "Long when the fast moving average is above the slow moving average."
      },
      "rsi-mean-reversion": {
        name: "RSI Mean Reversion",
        description: "Long after oversold RSI conditions, flat after overbought conditions."
      },
      "breakout-52w": {
        name: "52-week Breakout",
        description: "Long when price breaks above the prior 252-session high."
      }
    },
    rationales: {
      constructive: "Momentum and relative strength remain constructive in the sample series.",
      weakened: "Trend quality weakened and recent volatility is elevated in the sample series.",
      mixed: "Conditions are mixed, so the model stays neutral until confirmation improves."
    },
    marketSummary: {
      trackedAssets: { label: "Tracked assets", detail: "ETFs, equities, crypto" },
      buySignals: { label: "Buy signals", detail: "Based on mock data" },
      averageSharpe: { label: "Average Sharpe", detail: "Across top-ranked symbol models" }
    },
    dashboard: {
      eyebrow: "Local-first research prototype",
      heroTitle: "SignalDeck",
      heroDescription:
        "A polished signal dashboard and lightweight backtesting workspace for personal quant research and education.",
      topOpportunity: "Top opportunity",
      highestModelScore: "Highest model score today",
      lastPrice: "Last price",
      latestSession: "on latest session",
      signalWorkbench: "Signal workbench",
      signalWorkbenchBody: "Daily ranking combines live rule state, recent return quality, drawdown discipline, and trade consistency.",
      researchFlow: "Research flow",
      flow1: "Scan daily signal cards for ranking, action, and rationale.",
      flow2: "Open a symbol page to review the sample trend and current model read.",
      flow3: "Move into backtests to compare rule behavior before adding real data.",
      watchlistCoverage: "Watchlist coverage",
      dailySignals: "Daily signals",
      dailySignalsDescription: "Ranked by synthetic model score across the local sample universe.",
      dashboardSectionDescription: "Use the cards below to compare conviction, recent behavior, and strategy fit before drilling into detail.",
      researchScope: "Research scope",
      researchScopeBody:
        "Signals and backtests are generated from local sample data. They are intended for learning workflow design, not trading execution.",
      disclaimerBody:
        "SignalDeck does not provide financial advice. Backtest results are hypothetical and do not account for slippage, taxes, fees, liquidity, or live market risk."
    },
    signalCard: {
      modelStrategy: "Model strategy",
      price: "Price",
      change: "Change",
      score: "Score",
      signal: "Signal",
      horizon: "Horizon",
      cumulativeReturn: "1Y return",
      winRate: "Win rate",
      maxDrawdown: "Max DD",
      tradeCount: "Trades",
      reviewSymbol: "Review symbol"
    },
    backtest: {
      eyebrow: "Lightweight backtest",
      title: "Strategy Backtest",
      description:
        "Compare simple rule-based strategies against deterministic local sample data. This v1 model is deliberately transparent and easy to replace with real data later.",
      strategyExplainer:
        "Each strategy uses the same mock price history, so differences come from the trading rule itself rather than a separate data feed.",
      selectedInstrument: "Selected instrument",
      strategy: "Strategy",
      universe: "Universe",
      deterministicHistory: "Deterministic local history",
      listedBelow: "Most recent trades listed below",
      ruleSummary: "Rule summary",
      ruleSummaryBody:
        "All metrics use close-to-close sample returns with simple long-or-flat exposure. This keeps v1 easy to inspect and easy to replace later.",
      cumulativeReturn: "Cumulative Return",
      maxDrawdown: "Max Drawdown",
      sharpeRatio: "Sharpe Ratio",
      winRate: "Win Rate",
      averageHoldingPeriod: "Average Holding Period",
      equityCurveResult: "Equity curve result",
      worstPeakToTrough: "Worst peak-to-trough",
      annualizedSample: "Annualized sample",
      recentTradesShown: "recent trades shown",
      calendarDays: "Calendar days",
      equityCurve: " equity curve",
      equityCurveSummary:
        "Starting equity: $10,000. Strategy stays fully invested or fully flat based on the selected rule.",
      entry: "Entry",
      exit: "Exit",
      entryPrice: "Entry price",
      exitPrice: "Exit price",
      return: "Return",
      hold: "Hold",
      noTrades:
        "No trades were triggered in this sample window. Try another symbol or a different strategy to inspect behavior.",
      assumptions: "Backtest assumptions",
      assumptionsBody:
        "This prototype uses close-to-close returns, all-in or flat exposure, no position sizing, and no transaction costs. Results are hypothetical and educational only.",
      assumption1: "Signals are generated from deterministic mock histories.",
      assumption2: "There is no benchmark, exposure model, or portfolio optimizer yet.",
      assumption3: "v2 and v3 can plug into the same lib interfaces with real data and persistence.",
      assumption4: "Trade tags and setup notes are heuristic labels to make the mock research flow more believable.",
      liveState: "Live state",
      currentlyActive: "Currently active",
      currentlyFlat: "Currently flat",
      strategyBehavior: "Strategy behavior",
      recentExecution: "Recent execution",
      tradeJournal: "Trade journal",
      confidencePanel: "Model context"
    },
    watchlist: {
      eyebrow: "Local sample watchlist",
      title: "Watchlist",
      description:
        "A curated set of tracked assets for the local SignalDeck prototype. Persistence is intentionally simple in v1.",
      tracked: "Tracked",
      trackedDetail: "Assets pinned in mock data",
      buySignals: "Buy signals",
      buySignalsDetail: "Current synthetic reads",
      averageScore: "Average score",
      averageScoreDetail: "Across watchlist",
      sectionDescription: "A tighter list for names worth reviewing daily. Signals here should align with the same backtest engine used elsewhere."
    },
    symbol: {
      runBacktest: "Run backtest",
      watchlist: "Watchlist",
      lastClose: "Last close",
      sampleReturn: "Sample return",
      sinceSampleStart: "Since sample start",
      sampleHigh: "Sample high",
      sessions320: "320 sessions",
      sampleLow: "Sample low",
      samplePriceHistory: "sample price history",
      signal: "Signal",
      score: "Score",
      dailyChange: "Daily change",
      syntheticConfidence: "Synthetic confidence score",
      latestSampleDay: "Latest sample day",
      researchLens: "Research lens",
      currentSetup: "Current setup",
      strategyFit: "Strategy fit",
      recentBehavior: "Recent behavior",
      strategyContext:
        "This page combines local price history, top-ranked strategy, and sample performance to support a quick research decision.",
      historySummary: "Recent trend, volatility, and strategy fit on the same mock dataset."
    },
    notFound: {
      title: "Symbol not found",
      body: "That symbol is not available in the local sample universe.",
      action: "Return to dashboard"
    }
  },
  zh: {
    nav: {
      dashboard: "仪表盘",
      backtest: "回测",
      watchlist: "自选列表",
      subtitle: "本地研究信号平台"
    },
    footer: {
      disclaimer: "SignalDeck 仅用于研究与教学，不用于实盘交易。",
      roadmap: "当前为本地优先 v1，后续可平滑扩展到 Vercel 与 Supabase。"
    },
    common: {
      defaultBadge: "v1 本地原型",
      noSampleData: "暂无样本数据",
      noChartData: "当前视图暂无图表数据。",
      latestValue: "最新数值",
      endingEquity: "期末权益",
      rankPrefix: "排名 #",
      syntheticData: "合成信号，基于确定性样本数据",
      daily: "日频",
      sampleWindow: "样本区间",
      recentTrades: "近期交易",
      newestFirst: "最新优先",
      currentModelRead: "当前模型判断",
      jumpToAnotherSymbol: "切换其他标的",
      educationalDisclaimer: "教学研究用途声明",
      viewBacktest: "查看回测",
      dashboardBack: "返回仪表盘",
      openWatchlist: "打开自选列表",
      openSymbolDetail: "查看标的详情",
      compareStrategies: "比较策略",
      confidence: "置信度",
      signalEngine: "信号引擎",
      tradeCount: "交易次数",
      exposure: "持仓覆盖",
      researchNotes: "研究备注",
      strategyPlaybook: "策略说明",
      setup: "形态",
      quality: "质量",
      notes: "备注",
      bullish: "偏多",
      neutral: "中性",
      defensive: "防守",
      strong: "强",
      balanced: "均衡",
      cautious: "谨慎"
    },
    actions: {
      Buy: "买入",
      Hold: "观望",
      Reduce: "减仓"
    },
    assetClasses: {
      ETF: "ETF",
      Equity: "股票",
      Crypto: "加密资产"
    },
    assetMeta: {
      SPY: { sector: "美股大盘", description: "用于代表美国大盘股市场走势的 ETF。" },
      QQQ: { sector: "美股成长", description: "偏科技成长风格的纳斯达克 100 指数 ETF。" },
      IWM: { sector: "美股小盘", description: "用于观察美国小盘股表现的 ETF。" },
      TLT: { sector: "利率", description: "提供美国长期国债价格敞口的 ETF。" },
      GLD: { sector: "商品", description: "通过上市信托形式跟踪黄金价格表现。" },
      NVDA: { sector: "半导体", description: "以 AI 基础设施与加速计算为核心的半导体公司。" },
      AAPL: { sector: "消费科技", description: "覆盖硬件、服务与生态业务的消费科技公司。" },
      TSLA: { sector: "电动车", description: "涵盖电动车、储能与自动驾驶平台的公司。" },
      "BTC-USD": { sector: "数字资产", description: "以美元计价的比特币样本序列。" },
      "ETH-USD": { sector: "数字资产", description: "以美元计价的以太坊样本序列。" }
    },
    strategies: {
      "dual-ma": {
        name: "双均线交叉",
        description: "当短期均线位于长期均线上方时持有。"
      },
      "rsi-mean-reversion": {
        name: "RSI 均值回归",
        description: "RSI 进入超卖后开仓，进入超买后离场。"
      },
      "breakout-52w": {
        name: "52 周突破",
        description: "价格突破过去 252 个交易日高点时持有。"
      }
    },
    rationales: {
      constructive: "样本序列中的动量与相对强弱仍然偏强。",
      weakened: "样本序列的趋势质量走弱，近期波动有所抬升。",
      mixed: "当前条件偏中性，等待进一步确认信号。"
    },
    marketSummary: {
      trackedAssets: { label: "覆盖资产", detail: "ETF、股票、加密资产" },
      buySignals: { label: "买入信号", detail: "基于本地样本数据" },
      averageSharpe: { label: "平均夏普", detail: "按各标的最优策略汇总" }
    },
    dashboard: {
      eyebrow: "本地优先研究原型",
      heroTitle: "SignalDeck",
      heroDescription: "一个用于量化研究与教学的信号仪表盘与轻量回测工作台。",
      topOpportunity: "当前重点机会",
      highestModelScore: "今日模型评分最高",
      lastPrice: "最新价格",
      latestSession: "最新样本日",
      signalWorkbench: "信号工作台",
      signalWorkbenchBody: "日度排名综合考虑当前规则状态、近期收益质量、回撤控制与交易稳定性。",
      researchFlow: "研究流程",
      flow1: "先浏览每张日度信号卡片，查看排名、动作与理由。",
      flow2: "进入标的详情页，确认样本趋势与当前模型判断。",
      flow3: "再切换到回测页，对比规则表现后再考虑接入真实数据。",
      watchlistCoverage: "自选覆盖",
      dailySignals: "日度信号",
      dailySignalsDescription: "按合成模型评分，对本地样本标的进行排序展示。",
      dashboardSectionDescription: "下面的卡片用于快速比较置信度、近期表现与策略适配，再决定是否深入研究。",
      researchScope: "研究范围",
      researchScopeBody: "信号与回测均来自本地样本数据，适合研究流程演示与教学用途。",
      disclaimerBody: "SignalDeck 不构成投资建议。回测结果为假设结果，不包含滑点、税费、流动性与真实交易风险。"
    },
    signalCard: {
      modelStrategy: "模型策略",
      price: "价格",
      change: "涨跌",
      score: "评分",
      signal: "信号",
      horizon: "周期",
      cumulativeReturn: "一年收益",
      winRate: "胜率",
      maxDrawdown: "最大回撤",
      tradeCount: "交易数",
      reviewSymbol: "研究标的"
    },
    backtest: {
      eyebrow: "轻量回测",
      title: "策略回测",
      description: "基于确定性的本地样本数据，对简单规则策略进行对比。v1 强调透明与易替换，便于后续接入真实数据。",
      strategyExplainer: "所有策略共享同一套 mock 价格历史，因此差异主要来自交易规则本身，而不是数据源差异。",
      selectedInstrument: "当前标的",
      strategy: "策略",
      universe: "资产类别",
      deterministicHistory: "确定性本地历史",
      listedBelow: "下方展示最近交易",
      ruleSummary: "规则说明",
      ruleSummaryBody: "所有指标基于收盘到收盘收益，持仓状态仅为满仓或空仓，便于理解与后续替换。",
      cumulativeReturn: "累计收益",
      maxDrawdown: "最大回撤",
      sharpeRatio: "夏普比率",
      winRate: "胜率",
      averageHoldingPeriod: "平均持有期",
      equityCurveResult: "权益曲线结果",
      worstPeakToTrough: "峰值到谷值最大跌幅",
      annualizedSample: "样本年化",
      recentTradesShown: "笔近期交易",
      calendarDays: "自然日",
      equityCurve: "权益曲线",
      equityCurveSummary: "初始资金为 10,000 美元。策略根据所选规则在满仓与空仓之间切换。",
      entry: "开仓日",
      exit: "平仓日",
      entryPrice: "开仓价",
      exitPrice: "平仓价",
      return: "收益率",
      hold: "持有",
      noTrades: "该样本区间内未触发交易。可切换其他标的或策略继续观察。",
      assumptions: "回测假设",
      assumptionsBody: "当前原型采用收盘到收盘收益，不含仓位管理、交易成本与滑点，结果仅供研究与教学参考。",
      assumption1: "信号来自确定性的本地样本历史。",
      assumption2: "当前尚未加入基准比较、仓位暴露模型或组合优化。",
      assumption3: "后续 v2 / v3 可在现有 lib 接口上接入真实数据与持久化。",
      assumption4: "交易标签与备注为启发式生成，用于让研究流程更接近真实产品。",
      liveState: "当前状态",
      currentlyActive: "当前持仓中",
      currentlyFlat: "当前空仓",
      strategyBehavior: "策略行为",
      recentExecution: "近期执行",
      tradeJournal: "交易记录",
      confidencePanel: "模型上下文"
    },
    watchlist: {
      eyebrow: "本地样本自选",
      title: "自选列表",
      description: "这是 SignalDeck v1 的本地自选标的集合，当前保持轻量，不做复杂持久化。",
      tracked: "跟踪数量",
      trackedDetail: "已加入本地自选",
      buySignals: "买入信号",
      buySignalsDetail: "当前合成判断",
      averageScore: "平均评分",
      averageScoreDetail: "基于当前自选池",
      sectionDescription: "这是更适合日常盯盘的研究清单，信号与回测共用同一套引擎。"
    },
    symbol: {
      runBacktest: "运行回测",
      watchlist: "自选",
      lastClose: "最新收盘",
      sampleReturn: "样本收益",
      sinceSampleStart: "自样本起点以来",
      sampleHigh: "样本高点",
      sessions320: "320 个交易日",
      sampleLow: "样本低点",
      samplePriceHistory: "样本价格走势",
      signal: "信号",
      score: "评分",
      dailyChange: "日度涨跌",
      syntheticConfidence: "合成置信评分",
      latestSampleDay: "最新样本日",
      researchLens: "研究视角",
      currentSetup: "当前形态",
      strategyFit: "策略适配",
      recentBehavior: "近期行为",
      strategyContext: "本页把本地价格历史、当前最优策略与样本表现放在一起，方便快速完成研究判断。",
      historySummary: "同一组 mock 数据下的趋势、波动和策略适配情况。"
    },
    notFound: {
      title: "未找到该标的",
      body: "当前本地样本资产池中没有这个标的。",
      action: "返回仪表盘"
    }
  }
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function localizeStrategy(strategyId: StrategyId, locale: Locale) {
  return dictionaries[locale].strategies[strategyId];
}

export function localizeAction(action: "Buy" | "Hold" | "Reduce", locale: Locale) {
  return dictionaries[locale].actions[action];
}

export function localizeAssetClass(assetClass: "ETF" | "Equity" | "Crypto", locale: Locale) {
  return dictionaries[locale].assetClasses[assetClass];
}

export function localizeAssetMeta(symbol: string, locale: Locale) {
  return dictionaries[locale].assetMeta[symbol as keyof (typeof dictionaries)[typeof locale]["assetMeta"]];
}
