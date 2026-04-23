# Quantize A-share Research Workspace

Quantize is a Chinese A-share research workspace built with Next.js, TypeScript, and Tailwind CSS.

It is designed for rational daily study of market rotation, theme strength, fundamentals, and fund exposure. It is not a live trading product.

## Core modules

- 市场主线 / Market Leadership
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
- `lib/research/workspace.ts`

Editable config:

- `config/theme-baskets.json`
- `config/fundamental-scoring.json`

## What is real vs mocked right now

Real:

- Page architecture and UI workflow
- Theme basket config system
- Transparent scoring logic
- Fund-exposure analytics logic
- Refresh and provider-selection plumbing

Mocked:

- A-share prices and short-term returns
- theme heat and breadth inputs
- financial fields
- fund holdings
- refresh persistence

## Live data setup

### Mock only

No environment variables required.

### Akshare

- `DATA_PROVIDER=akshare`
- `AKSHARE_API_URL=<your bridge endpoint>`
- `AKSHARE_API_KEY=<optional bearer token>`

### Tushare

- `DATA_PROVIDER=tushare`
- `TUSHARE_API_URL=<your bridge endpoint>`
- `TUSHARE_TOKEN=<your token>`

The current adapters assume a server-side bridge returns the workspace snapshot shape used by the app. This keeps secrets off the client and avoids hardwiring the UI to a single provider.

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
