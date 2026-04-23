# SignalDeck Roadmap

## Phase 2 - Product realism and local-first hardening

- Add tests for signal composition, backtest metrics, and mock data consistency.
- Add parameter controls for strategy variants without changing the provider interface.
- Add a benchmark comparison layer for SPY / BTC-sensitive assets.
- Improve symbol research notes with rolling regime summaries and recent signal history.
- Add local-only saved views or backtest presets.

## Phase 3 - Deploy to Vercel

- Add Vercel project configuration and environment guidance.
- Confirm the current mock provider works cleanly in preview and production deployments.
- Document deployment flow, branch previews, and runtime assumptions.
- Replace `next lint` with direct ESLint CLI usage before Next.js 16.

## Phase 4 - Add real market data

- Introduce a real data adapter behind the existing provider interface.
- Add a refresh model for historical data and daily signal recomputation.
- Support benchmark data, OHLCV history, and asset metadata from a real source.
- Add loading and partial-data states for async providers.

## Phase 5 - Add auth and watchlist persistence with Supabase

- Add Supabase Auth for personal research accounts.
- Persist watchlists, saved symbols, and strategy presets.
- Add row-level security for user-owned research data.
- Add lightweight server actions or route handlers only where persistence requires them.

## Later improvements

- Add portfolio-level backtests.
- Add transaction costs, slippage, and cash drag assumptions.
- Add exports for research notes and backtest summaries.
- Add a more polished language switcher and localization coverage for docs.
