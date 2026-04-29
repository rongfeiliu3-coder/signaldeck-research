#!/usr/bin/env tsx
/**
 * Overnight Research Runner
 * 
 * This script runs the complete research workflow:
 * - Fetches market/theme data
 * - Runs opportunity screening
 * - Runs strategy scoring
 * - Generates a structured Chinese research report
 * 
 * Usage:
 *   npm run research:nightly
 *   or
 *   npx tsx scripts/nightly-research.ts
 */

import fs from 'fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';
import { getResearchWorkspace } from '../lib/research/workspace';
import { MarketWorkspace, OpportunityItem } from '../lib/types';

loadEnvConfig(process.cwd());

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const NIGHTLY_TIMEOUT_MS = Number(process.env.NIGHTLY_RESEARCH_TIMEOUT_MS ?? 90000);

interface ResearchReport {
  metadata: {
    generatedAt: string;
    dataProvider: string;
    providerMode: string;
    fallbackTriggered: boolean;
    fallbackReason?: string;
    selectedProvider?: string;
    bridgeUrl?: string;
    realSymbolsLoaded?: number;
    symbolsScanned: number;
    themesScanned: number;
    fundsScanned: number;
    durationSeconds: number;
  };
  marketLeadership: {
    topThemesToday: string[];
    topThemes5Day: string[];
    topThemes20Day: string[];
    marketNarrative: string;
    driverNarrative: string;
    overallBreadth: number;
    averageQuality: number;
  };
  opportunities: {
    lowRiskToHighRisk: OpportunityItem[];
    highRiskToLowRisk: OpportunityItem[];
    dividendDefensive: OpportunityItem[];
    longTerm: OpportunityItem[];
    shortTerm: OpportunityItem[];
    fundamentalQuality: OpportunityItem[];
    marketStrength: OpportunityItem[];
  };
  bullishEvidence: string[];
  bearishEvidence: string[];
  invalidationConditions: string[];
  finalWatchlistNotes: string[];
  safetyNotice: string[];
}

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function validateWorkspace(workspace: MarketWorkspace) {
  if (!workspace.fundamentals.stocks.length) {
    throw new Error('Workspace contains zero symbols.');
  }
  if (!workspace.themes.length) {
    throw new Error('Workspace contains zero themes.');
  }
}

async function loadNightlyWorkspace() {
  const selectedProvider = process.env.DATA_PROVIDER?.toLowerCase() || 'mock';
  const bridgeUrl = process.env.AKSHARE_API_URL?.trim() || '';

  console.log('[provider] Selected provider:', selectedProvider);
  console.log('[provider] Akshare bridge URL:', bridgeUrl || '(not configured)');
  console.log('[provider] Workspace timeout:', `${NIGHTLY_TIMEOUT_MS}ms`);

  try {
    const workspace = await withTimeout(getResearchWorkspace(), NIGHTLY_TIMEOUT_MS, 'Research workspace load');
    validateWorkspace(workspace);

    const fallbackHappened = selectedProvider === 'akshare' && workspace.providerStatus.mode !== 'live';
    console.log('[provider] Fallback happened:', fallbackHappened ? 'yes' : 'no');
    console.log('[provider] Active provider:', `${workspace.providerStatus.current} (${workspace.providerStatus.mode})`);
    console.log('[provider] Symbols loaded:', workspace.fundamentals.stocks.length);

    return {
      workspace,
      selectedProvider,
      bridgeUrl,
      realSymbolsLoaded: workspace.providerStatus.mode === 'live' ? workspace.fundamentals.stocks.length : 0,
      fallbackReason: fallbackHappened ? 'Akshare bridge unavailable or returned invalid data; mock fallback was used.' : undefined
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown workspace error';
    console.warn('[provider] Primary provider failed:', reason);
    console.warn('[provider] Falling back to mock data.');

    const previousProvider = process.env.DATA_PROVIDER;
    process.env.DATA_PROVIDER = 'mock';
    const workspace = await withTimeout(getResearchWorkspace(), NIGHTLY_TIMEOUT_MS, 'Mock fallback workspace load');
    validateWorkspace(workspace);
    if (previousProvider === undefined) {
      delete process.env.DATA_PROVIDER;
    } else {
      process.env.DATA_PROVIDER = previousProvider;
    }

    console.log('[provider] Fallback happened: yes');
    console.log('[provider] Active provider:', `${workspace.providerStatus.current} (${workspace.providerStatus.mode})`);
    console.log('[provider] Symbols loaded:', workspace.fundamentals.stocks.length);

    return {
      workspace,
      selectedProvider,
      bridgeUrl,
      realSymbolsLoaded: 0,
      fallbackReason: reason
    };
  }
}

function formatPercent(value: number, digits = 1): string {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(digits)}%`;
}

function toPercentText(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function generateMarkdownReport(workspace: MarketWorkspace, report: ResearchReport): string {
  const lines: string[] = [];
  
  // Header
  lines.push('# A股夜盘研究报告');
  lines.push('');
  lines.push(`**生成时间**: ${report.metadata.generatedAt}`);
  lines.push(`**数据来源**: ${report.metadata.dataProvider} (${report.metadata.providerMode})`);
  if (report.metadata.fallbackTriggered) {
    lines.push(`**⚠️ 回退模式**: 实时数据不可用，使用模拟数据`);
  }
  lines.push(`**扫描范围**: ${report.metadata.symbolsScanned} 只股票 / ${report.metadata.themesScanned} 个主题 / ${report.metadata.fundsScanned} 只基金`);
  lines.push(`**耗时**: ${report.metadata.durationSeconds.toFixed(1)} 秒`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Safety Notice
  lines.push('## ⚠️ 重要声明');
  lines.push('');
  report.safetyNotice.forEach(notice => {
    lines.push(`- ${notice}`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Market Leadership
  lines.push('## 市场主线');
  lines.push('');
  lines.push('### 今日热度排行');
  workspace.marketLeadership[0].themes.slice(0, 5).forEach((theme, idx) => {
    lines.push(`${idx + 1}. **${theme.name}** - 热度 ${theme.leadership.today.heat.toFixed(1)}`);
  });
  lines.push('');
  
  lines.push('### 5日热度排行');
  workspace.marketLeadership[1].themes.slice(0, 5).forEach((theme, idx) => {
    lines.push(`${idx + 1}. **${theme.name}** - 热度 ${theme.leadership.fiveDay.heat.toFixed(1)}`);
  });
  lines.push('');
  
  lines.push('### 市场综述');
  lines.push('');
  lines.push(workspace.marketSummary.marketNarrative);
  lines.push('');
  lines.push(workspace.marketSummary.driverNarrative);
  lines.push('');
  lines.push('**支撑证据**:');
  workspace.marketSummary.supportingEvidence.forEach(evidence => {
    lines.push(`- ${evidence}`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Top Themes Detail
  lines.push('## 核心主题分析');
  lines.push('');
  const topThemes = workspace.marketLeadership[0].themes.slice(0, 3);
  topThemes.forEach(theme => {
    lines.push(`### ${theme.name}`);
    lines.push('');
    lines.push(`- **特征**: ${theme.diagnostics.characteristicLabel}`);
    lines.push(`- **驱动**: ${theme.diagnostics.narrativeType === 'policy-driven' ? '政策驱动' : theme.diagnostics.narrativeType === 'sentiment-driven' ? '情绪驱动' : theme.diagnostics.narrativeType === 'earnings-driven' ? '业绩驱动' : '混合驱动'}`);
    lines.push(`- **今日热度**: ${theme.leadership.today.heat.toFixed(1)}`);
    lines.push(`- **广度**: ${toPercentText(theme.leadership.today.breadth, 1)}`);
    lines.push(`- **前五贡献**: ${toPercentText(theme.leadership.today.topFiveContribution)}`);
    lines.push(`- **质量均分**: ${theme.fundamentalSnapshot.averageQualityScore.toFixed(1)}`);
    lines.push(`- **股息代理**: ${toPercentText(theme.diagnostics.dividendProxy, 1)}`);
    lines.push('');
    lines.push(theme.summary.marketNarrative);
    lines.push('');
  });
  lines.push('---');
  lines.push('');
  
  // Opportunities by Category
  lines.push('## 机会筛选');
  lines.push('');
  
  // Long-term
  lines.push('### 长线观察 (适合中长期跟踪)');
  lines.push('');
  if (report.opportunities.longTerm.length === 0) {
    lines.push('*暂无符合条件的标的*');
  } else {
    report.opportunities.longTerm.slice(0, 8).forEach((opp, idx) => {
      lines.push(`${idx + 1}. **${opp.title}** (${opp.assetType === 'stock' ? opp.assetRef : opp.assetType})`);
      lines.push(`   - 综合评分: ${opp.scoreBreakdown.composite.toFixed(1)}`);
      lines.push(`   - 长线评分: ${opp.scoreBreakdown.longTerm.toFixed(1)}`);
      lines.push(`   - 质量: ${opp.scoreBreakdown.fundamentalQuality.toFixed(1)}`);
      lines.push(`   - 防御: ${opp.scoreBreakdown.defensiveness.toFixed(1)}`);
      lines.push(`   - 理由: ${opp.whyNow}`);
      lines.push('');
    });
  }
  lines.push('');
  
  // Short-term
  lines.push('### 短线博弈 (偏短线交易)');
  lines.push('');
  if (report.opportunities.shortTerm.length === 0) {
    lines.push('*暂无符合条件的标的*');
  } else {
    report.opportunities.shortTerm.slice(0, 8).forEach((opp, idx) => {
      lines.push(`${idx + 1}. **${opp.title}** (${opp.assetType === 'stock' ? opp.assetRef : opp.assetType})`);
      lines.push(`   - 综合评分: ${opp.scoreBreakdown.composite.toFixed(1)}`);
      lines.push(`   - 短线评分: ${opp.scoreBreakdown.shortTerm.toFixed(1)}`);
      lines.push(`   - 市场强度: ${opp.scoreBreakdown.marketStrength.toFixed(1)}`);
      lines.push(`   - 换手活跃: ${opp.scoreBreakdown.turnoverActivity.toFixed(1)}`);
      lines.push(`   - 理由: ${opp.whyNow}`);
      lines.push('');
    });
  }
  lines.push('');
  
  // Dividend/Defensive
  lines.push('### 高股息 / 防御型');
  lines.push('');
  if (report.opportunities.dividendDefensive.length === 0) {
    lines.push('*暂无符合条件的标的*');
  } else {
    report.opportunities.dividendDefensive.slice(0, 8).forEach((opp, idx) => {
      lines.push(`${idx + 1}. **${opp.title}** (${opp.assetType === 'stock' ? opp.assetRef : opp.assetType})`);
      lines.push(`   - 综合评分: ${opp.scoreBreakdown.composite.toFixed(1)}`);
      lines.push(`   - 防御分: ${opp.scoreBreakdown.defensiveness.toFixed(1)}`);
      lines.push(`   - 质量分: ${opp.scoreBreakdown.fundamentalQuality.toFixed(1)}`);
      lines.push(`   - 理由: ${opp.whyNow}`);
      lines.push('');
    });
  }
  lines.push('');
  
  // High Risk
  lines.push('### 高风险题材 (仅观察，不适合重仓)');
  lines.push('');
  if (report.opportunities.highRiskToLowRisk.length === 0) {
    lines.push('*暂无符合条件的标的*');
  } else {
    report.opportunities.highRiskToLowRisk.slice(0, 8).forEach((opp, idx) => {
      lines.push(`${idx + 1}. **${opp.title}** (${opp.assetType === 'stock' ? opp.assetRef : opp.assetType})`);
      lines.push(`   - 综合评分: ${opp.scoreBreakdown.composite.toFixed(1)}`);
      lines.push(`   - 风险等级: ${opp.riskLevel}`);
      lines.push(`   - 驱动: ${opp.driver === 'sentiment-driven' ? '情绪驱动' : opp.driver === 'policy-driven' ? '政策驱动' : opp.driver === 'fundamentals-driven' ? '基本面驱动' : '混合'}`);
      lines.push(`   - 理由: ${opp.whyNow}`);
      lines.push('');
    });
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Evidence Analysis
  lines.push('## 证据分析');
  lines.push('');
  
  lines.push('### 看多证据');
  lines.push('');
  report.bullishEvidence.forEach(evidence => {
    lines.push(`- ${evidence}`);
  });
  lines.push('');
  
  lines.push('### 看空证据');
  lines.push('');
  report.bearishEvidence.forEach(evidence => {
    lines.push(`- ${evidence}`);
  });
  lines.push('');
  
  lines.push('### 失效条件');
  lines.push('');
  report.invalidationConditions.forEach(condition => {
    lines.push(`- ${condition}`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Final Notes
  lines.push('## 观察笔记');
  lines.push('');
  report.finalWatchlistNotes.forEach(note => {
    lines.push(`- ${note}`);
  });
  lines.push('');
  
  return lines.join('\n');
}

function buildResearchReport(
  workspace: MarketWorkspace,
  durationSeconds: number,
  providerRun: { selectedProvider: string; bridgeUrl: string; realSymbolsLoaded: number; fallbackReason?: string }
): ResearchReport {
  const opportunities = workspace.opportunityLab.opportunities;
  
  // Sort by different criteria
  const lowRiskToHighRisk = [...opportunities].sort((a, b) => {
    const riskOrder = { 'low': 0, 'medium': 1, 'high': 2, 'very-high': 3 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  }).slice(0, 10);
  
  const highRiskToLowRisk = [...opportunities].sort((a, b) => {
    const riskOrder = { 'low': 0, 'medium': 1, 'high': 2, 'very-high': 3 };
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  }).slice(0, 10);
  
  const dividendDefensive = [...opportunities]
    .filter(opp => opp.style.includes('dividend') || opp.scoreBreakdown.defensiveness >= 60)
    .sort((a, b) => b.scoreBreakdown.defensiveness - a.scoreBreakdown.defensiveness)
    .slice(0, 10);
  
  const longTerm = [...opportunities]
    .filter(opp => opp.category === 'long-term')
    .sort((a, b) => b.scoreBreakdown.longTerm - a.scoreBreakdown.longTerm)
    .slice(0, 10);
  
  const shortTerm = [...opportunities]
    .filter(opp => opp.category === 'short-term')
    .sort((a, b) => b.scoreBreakdown.shortTerm - a.scoreBreakdown.shortTerm)
    .slice(0, 10);
  
  const fundamentalQuality = [...opportunities]
    .sort((a, b) => b.scoreBreakdown.fundamentalQuality - a.scoreBreakdown.fundamentalQuality)
    .slice(0, 10);
  
  const marketStrength = [...opportunities]
    .sort((a, b) => b.scoreBreakdown.marketStrength - a.scoreBreakdown.marketStrength)
    .slice(0, 10);
  
  // Generate evidence from top opportunities
  const bullishEvidence: string[] = [];
  const bearishEvidence: string[] = [];
  const invalidationConditions: string[] = [];
  
  longTerm.slice(0, 5).forEach(opp => {
    bullishEvidence.push(`${opp.title}: ${opp.bullishCase}`);
    bearishEvidence.push(`${opp.title}: ${opp.bearishCase}`);
    opp.thesisInvalidation.forEach(condition => {
      if (!invalidationConditions.includes(condition)) {
        invalidationConditions.push(condition);
      }
    });
  });
  
  const finalWatchlistNotes: string[] = [
    `当前市场主线集中在 ${workspace.marketLeadership[0].themes.slice(0, 3).map(t => t.name).join('、')}`,
    `主题平均广度 ${toPercentText(workspace.marketLeadership[0].themes.reduce((sum, t) => sum + t.leadership.today.breadth, 0) / workspace.marketLeadership[0].themes.length, 1)}`,
    `长线候选 ${longTerm.length} 个，短线候选 ${shortTerm.length} 个，防御型 ${dividendDefensive.length} 个`,
    `数据质量: ${workspace.providerStatus.mode === 'mock' ? '模拟数据' : '实时数据'}，结论仅供参考`,
  ];
  
  return {
    metadata: {
      generatedAt: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      dataProvider: workspace.providerStatus.current,
      providerMode: workspace.providerStatus.mode,
      fallbackTriggered: Boolean(providerRun.fallbackReason),
      fallbackReason: providerRun.fallbackReason,
      selectedProvider: providerRun.selectedProvider,
      bridgeUrl: providerRun.bridgeUrl,
      realSymbolsLoaded: providerRun.realSymbolsLoaded,
      symbolsScanned: workspace.fundamentals.stocks.length,
      themesScanned: workspace.themes.length,
      fundsScanned: workspace.funds.length,
      durationSeconds,
    },
    marketLeadership: {
      topThemesToday: workspace.marketLeadership[0].themes.slice(0, 5).map(t => t.name),
      topThemes5Day: workspace.marketLeadership[1].themes.slice(0, 5).map(t => t.name),
      topThemes20Day: workspace.marketLeadership[2].themes.slice(0, 5).map(t => t.name),
      marketNarrative: workspace.marketSummary.marketNarrative,
      driverNarrative: workspace.marketSummary.driverNarrative,
      overallBreadth: workspace.marketLeadership[0].themes.reduce((sum, t) => sum + t.leadership.today.breadth, 0) / workspace.marketLeadership[0].themes.length,
      averageQuality: workspace.themes.reduce((sum, t) => sum + t.fundamentalSnapshot.averageQualityScore, 0) / workspace.themes.length,
    },
    opportunities: {
      lowRiskToHighRisk,
      highRiskToLowRisk,
      dividendDefensive,
      longTerm,
      shortTerm,
      fundamentalQuality,
      marketStrength,
    },
    bullishEvidence,
    bearishEvidence,
    invalidationConditions,
    finalWatchlistNotes,
    safetyNotice: [
      '本报告仅供研究使用，不构成投资建议',
      '所有结论依赖数据质量，模拟数据可能与实际市场存在差异',
      '不执行任何真实交易或下单操作',
      '请结合自身风险承受能力和投资目标独立判断',
    ],
  };
}

async function main() {
  const startTime = Date.now();
  console.log('='.repeat(60));
  console.log('Starting Overnight Research Workflow');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    console.log('[1/4] Fetching research workspace...');
    const providerRun = await loadNightlyWorkspace();
    const workspace = providerRun.workspace;
    console.log(`✓ Workspace loaded: ${workspace.asOfDate}`);
    console.log(`  - Provider: ${workspace.providerStatus.current} (${workspace.providerStatus.mode})`);
    console.log(`  - Securities: ${workspace.fundamentals.stocks.length}`);
    console.log(`  - Themes: ${workspace.themes.length}`);
    console.log(`  - Funds: ${workspace.funds.length}`);
    console.log(`  - Opportunities: ${workspace.opportunityLab.opportunities.length}`);
    console.log('');
    
    console.log('[2/4] Building research report...');
    const durationSeconds = (Date.now() - startTime) / 1000;
    const report = buildResearchReport(workspace, durationSeconds, providerRun);
    console.log('✓ Report built');
    console.log('');
    
    console.log('[3/4] Saving reports...');
    ensureReportsDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseFilename = `research-${timestamp}`;
    
    // Save JSON
    const jsonPath = path.join(REPORTS_DIR, `${baseFilename}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`✓ JSON saved: ${jsonPath}`);
    
    // Save Markdown
    const markdownPath = path.join(REPORTS_DIR, `${baseFilename}.md`);
    const markdown = generateMarkdownReport(workspace, report);
    fs.writeFileSync(markdownPath, markdown, 'utf-8');
    console.log(`✓ Markdown saved: ${markdownPath}`);
    
    // Save latest symlink (or copy for Windows compatibility)
    const latestJsonPath = path.join(REPORTS_DIR, 'latest-report.json');
    const latestMdPath = path.join(REPORTS_DIR, 'latest-report.md');
    fs.copyFileSync(jsonPath, latestJsonPath);
    fs.copyFileSync(markdownPath, latestMdPath);
    fs.copyFileSync(jsonPath, path.join(REPORTS_DIR, 'latest.json'));
    fs.copyFileSync(markdownPath, path.join(REPORTS_DIR, 'latest.md'));
    console.log(`✓ Latest report updated`);
    console.log('');
    
    console.log('[4/4] Summary');
    console.log('='.repeat(60));
    console.log(`Generated at: ${report.metadata.generatedAt}`);
    console.log(`Data provider: ${report.metadata.dataProvider}`);
    console.log(`Selected provider: ${report.metadata.selectedProvider}`);
    console.log(`Bridge URL: ${report.metadata.bridgeUrl || '(not configured)'}`);
    console.log(`Fallback happened: ${report.metadata.fallbackTriggered ? 'yes' : 'no'}`);
    console.log(`Real symbols loaded: ${report.metadata.realSymbolsLoaded ?? 0}`);
    console.log(`Symbols scanned: ${report.metadata.symbolsScanned}`);
    console.log(`Themes scanned: ${report.metadata.themesScanned}`);
    console.log(`Funds scanned: ${report.metadata.fundsScanned}`);
    console.log(`Duration: ${report.metadata.durationSeconds.toFixed(1)}s`);
    console.log('');
    console.log(`Top themes today: ${report.marketLeadership.topThemesToday.join(', ')}`);
    console.log(`Long-term opportunities: ${report.opportunities.longTerm.length}`);
    console.log(`Short-term opportunities: ${report.opportunities.shortTerm.length}`);
    console.log(`Dividend/defensive: ${report.opportunities.dividendDefensive.length}`);
    console.log('='.repeat(60));
    console.log('');
    console.log('✓ Overnight research completed successfully!');
    console.log('');
    
  } catch (error) {
    console.error('✗ Error during research workflow:');
    console.error(error);
    process.exit(1);
  }
}

main();
