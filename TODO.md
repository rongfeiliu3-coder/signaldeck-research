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
