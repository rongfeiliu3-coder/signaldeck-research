# TODO Roadmap

## Phase A: A-share data model and theme architecture

- [x] Replace the generic asset model with A-share securities, themes, funds, and fundamentals.
- [x] Create pluggable adapters for `mock`, `akshare`, and `tushare`.
- [x] Move theme baskets and scoring weights into editable config files.

## Phase B: sector heat and theme dashboards

- [x] Build market leadership dashboard with today / 5 day / 20 day views.
- [x] Build theme list and theme detail pages with breadth, turnover, leaders, and evidence.
- [ ] Add industry-level drilldown beside theme-level drilldown.

## Phase C: fundamentals scoring and rational summaries

- [x] Build transparent fundamentals panel and separate quality vs momentum.
- [x] Add concise rational summary blocks with evidence-source tags.
- [ ] Add valuation snapshots once stable live fields are available.

## Phase D: fund diagnostics

- [x] Add mock fund basket diagnostics with sector, theme, and style exposures.
- [x] Compute overlap with tracked themes such as power and low-carbon energy.
- [ ] Connect public fund holdings and disclosure-date metadata.

## Phase E: scheduled refresh and deployment hardening

- [x] Add manual refresh endpoint and UI trigger.
- [x] Prepare Vercel cron entry for end-of-day refresh.
- [ ] Persist refresh snapshots to storage for historical comparisons.
- [ ] Add provider health checks and stale-data warnings.

## Phase F: Opportunity Lab vertical slice

- [x] Add Opportunity Lab page and navigation entry.
- [x] Add four opportunity classes: long-term, medium-term, short-term, and high-risk.
- [x] Add transparent opportunity sub-scores instead of one black-box score.
- [x] Add stock / fund / theme / sector opportunity cards with evidence and counter-evidence.
- [x] Add input-driven diagnostics for stock code, fund code, theme name, and sector name.
- [x] Add AI adapter scaffolding and opportunity-agent workflow steps.
- [ ] Add real public fund codes and holdings adapters.

## Phase G: live data and AI upgrades

- [ ] Improve Akshare live coverage for industry classification and valuation fields.
- [ ] Add public fund data adapter with disclosure-date metadata.
- [ ] Add live AI adapters behind environment variables.
- [ ] Add provider-specific prompt routing and model selection.
- [ ] Add stale-data banners when market / financial / fund datasets are out of sync.

## Phase H: journaling and research workflow

- [ ] Add opportunity journaling and watchlist note persistence.
- [ ] Store thesis changes, invalidation events, and refresh-to-refresh deltas.
- [ ] Add end-of-day note generation after scheduled refresh.
