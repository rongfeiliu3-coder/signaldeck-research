# AGENTS

This project is an A-share research workspace for daily study, not a trading terminal.

## Product rules

- Prioritize structured evidence over narrative.
- Separate price action, breadth, turnover, leader concentration, and fundamentals.
- Mark whether each conclusion comes from market data, financial data, theme basket rules, or AI-generated synthesis.
- Do not present uncertain inferences as facts.
- Avoid direct investment advice and sensational language.
- In Opportunity Lab, structured scoring always comes before AI compression.

## Subagent-style ownership

### UI / Product

- Owns `app/`, `components/`, and the Chinese-first UX.
- Keeps the terminal-style visual language disciplined and readable.
- Preserves information hierarchy: numbers first, labels second, descriptions last.
- Extends modules vertically instead of adding shallow demo features.

### Data adapters

- Owns `lib/data/` and provider selection.
- Adds or upgrades adapters without coupling pages to one vendor.
- Keeps mock fallback healthy so Vercel previews remain runnable.
- Preserves server-side handling for Akshare, Tushare, and future fund data feeds.

### Scoring / Analytics

- Owns `lib/research/analytics.ts`, `lib/research/opportunities.ts`, `config/fundamental-scoring.json`, and theme logic.
- Keeps scoring transparent, documented, and adjustable.
- Separates market momentum from business quality.
- In Opportunity Lab, keeps sub-scores visible instead of hiding everything behind one score.

### AI / Agent workflows

- Owns `lib/ai/`.
- Keeps adapters provider-agnostic and environment-driven.
- Uses AI only for compression, synthesis, counterargument generation, and watchlist notes.
- Must not let AI override structured scoring or claim unsupported facts.

### Documentation / Deployment

- Owns `README.md`, `TODO.md`, `AGENTS.md`, and `vercel.json`.
- Keeps deployment, AI configuration, and scheduled refresh paths documented.
- Confirms what is real vs mocked after each major phase.

## Maintenance workflow

1. Update `config/theme-baskets.json` before changing theme pages or opportunity coverage.
2. Add or change fields inside adapters first, then wire analytics, then update UI.
3. When changing scoring, update config and documentation together.
4. Keep mock data aligned with page expectations so the app never breaks without credentials.
5. Preserve Chinese default copy and English code structure.
6. For Opportunity Lab changes, update:
   - structured scoring
   - evidence / counter-evidence generation
   - AI workflow prompt inputs
   - documentation for future provider integration
