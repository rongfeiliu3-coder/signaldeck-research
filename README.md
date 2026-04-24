# Quantize A-share Research Workspace

Quantize is a Chinese A-share research workspace built with Next.js, TypeScript, and Tailwind CSS.

It is designed for rational daily study of market rotation, theme strength, fundamentals, fund exposure, and opportunity analysis. It is not a live trading product and does not provide direct investment advice.

## Core modules

- 市场主线 / Market Leadership
- 机会分析 / Opportunity Lab
- 主题研究 / Theme Research
- 基本面看板 / Fundamentals
- 基金透视 / Fund Diagnostics

## Data architecture

The app uses a pluggable provider layer:

- `mock`
- `akshare`
- `tushare`

Main files:

- `lib/data/adapters/base.ts`
- `lib/data/adapters/mock.ts`
- `lib/data/adapters/akshare.ts`
- `lib/data/adapters/tushare.ts`
- `lib/data/provider.ts`
- `lib/research/analytics.ts`
- `lib/research/opportunities.ts`
- `lib/research/workspace.ts`

Editable config:

- `config/theme-baskets.json`
- `config/fundamental-scoring.json`

## Opportunity Lab

Opportunity Lab supports ranking and comparing stocks, themes, sectors, and fund-like baskets.

Opportunity categories:

- 长线观察机会
- 中线趋势机会
- 短线交易机会
- 高风险题材机会

Supported ranking views:

- 综合机会分：高到低
- 风险等级：高到低
- 风险等级：低到高
- 股息/防御属性：高到低
- 基本面质量：高到低
- 市场强度：高到低
- 短线适配度：高到低
- 长线适配度：高到低

Supported filters:

- asset type: stock, theme, sector, fund basket
- time horizon: long-term, medium-term, short-term, high-risk
- risk level: low, medium, high, very-high
- style: dividend, growth, cyclical, policy, sentiment, quality, AI, energy
- tracked themes: 电力, 低碳新能源, 卫星航天, 高股息, 算力AI

## Opportunity scoring

The opportunity model keeps sub-scores visible and does not hide everything behind a single black-box score.

Core dimensions:

- market strength
- breadth / participation
- turnover / activity
- leader concentration
- fundamental quality
- dividend / defensiveness
- thematic narrative support
- institutional relevance

Long-term tracking score prioritizes:

- fundamental quality
- dividend, cash flow, and defensiveness
- lower activity / lower speculative heat
- institutional relevance
- durable sector or theme support

Short-term trading score prioritizes:

- market strength
- breadth
- turnover activity
- narrative heat
- leader concentration
- momentum confirmation

The comparison table shows:

- name
- type
- risk level
- defensive score
- long-term score
- short-term score
- market strength
- fundamental quality
- main driver
- first invalidation condition

## AI architecture

The app includes a provider-agnostic AI layer under `lib/ai/`.

Current adapters:

- `mock`
- `deepseek` prepared for future use

AI is limited to:

- narrative compression
- evidence synthesis
- counterargument generation
- watchlist note generation

AI does not override structured scoring and should not introduce unsupported claims.

## DeepSeek setup

The app works without DeepSeek. If no key is configured, it falls back to mock AI automatically.

DeepSeek is only read through server-side code. Do not prefix the key with `NEXT_PUBLIC_`, and do not use it in client components.

Local setup:

1. Create `.env.local` from `.env.example`.
2. Set:

```bash
RESEARCH_AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

Vercel setup:

1. Open the Vercel project.
2. Go to `Settings` -> `Environment Variables`.
3. Add `RESEARCH_AI_PROVIDER` with value `deepseek`.
4. Add `DEEPSEEK_API_KEY` with your DeepSeek API key.
5. Optionally add `DEEPSEEK_BASE_URL` with `https://api.deepseek.com`.
6. Optionally add `DEEPSEEK_MODEL` with `deepseek-chat`.
7. Apply the variables to Production, Preview, and Development as needed.
8. Redeploy the project.

Never commit real API keys. `.env.example` contains placeholders only.

Test endpoint:

- `GET /api/ai/test`

The endpoint returns whether DeepSeek is configured, which adapter answered, whether mock fallback was used, and a short test summary. It never returns the API key.

## What is real now

With the Python bridge running and `DATA_PROVIDER=akshare`, the following are backed by real A-share data:

- tracked A-share stock names and latest prices
- recent daily history used by charts
- 1 day / 5 day / 20 day returns
- turnover rate and simple turnover change
- basic industry information when available from Akshare
- market-cap fields when available from Akshare
- minimal financial indicator fields when available from Akshare
- theme breadth derived from real constituent moves

## What is still mocked or simplified

- only the tracked theme universe is fetched, not the whole market
- Opportunity Lab sector views are derived from the tracked research universe, not full-market industry breadth
- fund diagnostics still use generated fund-like baskets, not real public fund holdings
- current fund codes are placeholder mock codes for diagnostics
- AI summaries use mock AI unless DeepSeek is configured
- some fundamentals may be `0` when Akshare does not return a stable field
- no database, no cache layer, no streaming, no historical snapshot persistence

## Python data bridge

The repo includes a simple server-side bridge in `data-service/`.

Endpoints:

- `GET /health`
- `GET /snapshot/workspace`
- `GET /snapshot/market-leadership`
- `GET /snapshot/themes`
- `GET /snapshot/fundamentals`

Run locally:

```bash
cd data-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Default local address:

- `http://127.0.0.1:8000`

## Next.js live data setup

Mock only:

- no environment variables required

Akshare:

- `DATA_PROVIDER=akshare`
- `AKSHARE_API_URL=http://127.0.0.1:8000`
- `AKSHARE_API_KEY=<optional bearer token>`

Tushare:

- `DATA_PROVIDER=tushare`
- `TUSHARE_API_URL=<your bridge endpoint>`
- `TUSHARE_TOKEN=<your token>`

## Refresh behavior

- manual refresh button calls `POST /api/refresh`
- cron refresh calls `GET /api/cron/refresh`
- refresh does not persist data yet; it checks bridge availability and the next page render fetches fresh data

## Roadmap focus

- richer live A-share industry and valuation coverage
- public fund holdings integration
- live AI provider expansion
- scheduled end-of-day refresh hardening
- opportunity journaling and watchlist notes

## Development

```bash
npm install
npm run dev
```

Checks:

```bash
npm run typecheck
npm run build
```
