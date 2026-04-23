# SignalDeck

SignalDeck is a local-first quant research prototype built with Next.js, TypeScript, and Tailwind CSS.

It is designed as a realistic research workspace rather than a toy dashboard:

- daily signal ranking
- symbol research views
- lightweight single-symbol backtests
- a watchlist aligned with the same research engine
- deterministic mock data with internally consistent signals and equity curves

The product is for research and education only. It is not a live trading system.

## Current features

- Dashboard with ranked signals, conviction scores, and strategy-fit context
- Symbol detail pages with research-oriented summaries and sample history
- Backtest page with:
  - cumulative return
  - max drawdown
  - Sharpe ratio
  - win rate
  - average holding period
  - exposure rate
  - recent trade journal
- Watchlist view powered by the same signal and backtest logic
- Chinese UI by default, with a simple `zh` / `en` localization structure
- Dark polished dashboard UI optimized for local exploration

## Local development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd install
npm.cmd run dev
```

Run a full project check:

```bash
npm run check
```

Or on Windows PowerShell:

```bash
npm.cmd run check
```

Build for production:

```bash
npm run build
```

Start the production server locally:

```bash
npm run start
```

## Current architecture

The app is intentionally simple, but the code is now separated so mock data can later be replaced with real integrations.

### UI

- `app/` contains route-level pages
- `components/` contains reusable dashboard and chart components

### Domain logic

- `lib/research/engine.ts` contains deterministic market simulation, signal composition, and backtest calculations
- `lib/indicators.ts` contains reusable technical indicator helpers
- `lib/format.ts` contains formatting helpers for values shown in the UI

### Mock data provider

- `lib/research/catalog.ts` defines the local asset universe and strategy catalog
- `lib/research/provider.ts` defines the provider interface and the current mock provider
- `lib/mock-data.ts` is a thin facade used by the UI today
- `lib/backtest.ts` is a thin wrapper for running strategy backtests through the provider

### Localization

- `lib/i18n.ts` contains the text dictionary for `en` and `zh`
- `lib/locale.ts` resolves the active locale
- `components/language-toggle.tsx` prepares the navbar for a future polished language toggle

## How mock data is organized

The current mock system is deterministic and local-first.

Each asset in `lib/research/catalog.ts` includes:

- base price
- trend profile
- volatility level
- market beta
- mean reversion tendency
- strategy bias weights

The engine then generates a consistent synthetic history per symbol and uses that same history for:

- dashboard signals
- watchlist summaries
- symbol detail charts
- strategy backtests

This keeps the product believable while staying completely local and dependency-light.

## What is still mocked

The following are still mock or heuristic:

- price histories
- signal confidence scores
- strategy suitability by symbol
- trade annotations and setup notes
- equity curves and trade logs
- watchlist persistence

There is still:

- no auth
- no Supabase
- no paid API
- no real market data
- no live trading functionality

## GitHub push

This repository is ready to initialize and push.

If git is not initialized yet:

```bash
git init -b main
git add .
git commit -m "Initial commit"
```

Create an empty GitHub repository, then connect and push:

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

Example remote URLs:

- HTTPS: `https://github.com/<your-name>/<repo-name>.git`
- SSH: `git@github.com:<your-name>/<repo-name>.git`

## Vercel deployment

This project is Vercel-friendly as-is because it is a standard Next.js App Router application and does not require a backend service for v1.

Recommended deployment flow:

1. Push the repository to GitHub
2. Import the repo into Vercel
3. Let Vercel detect `Next.js`
4. Use the default build settings
5. Deploy

### Minimum Vercel requirements

- a Vercel account
- a connected GitHub repository

### Environment variables

No environment variables are required for the current local-first mock-data version.

### Build settings

Vercel defaults should work:

- Framework Preset: `Next.js`
- Build Command: `next build`
- Output setting: default Next.js output

## Recommended next steps

The best next step after this deployment preparation is:

1. push the repo to GitHub
2. deploy the current local-first app to Vercel
3. keep the mock provider in place for preview environments
4. add a real market data adapter behind the same provider interface
5. add Supabase only after the data shape and workflows feel stable

## Notes for future integration

- A future Vercel deployment can keep the current App Router structure unchanged.
- A future real-data adapter can implement the same provider contract now used by the mock provider.
- Supabase should be introduced only for auth, watchlists, saved presets, and persistence layers, not for basic rendering.
