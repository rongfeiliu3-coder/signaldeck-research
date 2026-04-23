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

## What is real now

With the Python bridge running and `DATA_PROVIDER=akshare`, the following are now backed by real A-share data:

- tracked A-share stock names and latest prices
- recent daily history used by charts
- 1 day / 5 day / 20 day returns
- turnover rate and simple turnover change
- basic industry information when available from Akshare
- market-cap fields when available from Akshare
- minimal financial indicator fields when available from Akshare
- theme breadth derived from real constituent moves

## What is still limited

Current first live-data version intentionally stays simple:

- only the tracked theme universe is fetched, not the whole market
- sector grouping is simplified with a local metadata mapping for the tracked universe
- fund diagnostics still use generated theme baskets, not real public fund holdings
- some fundamentals may be `0` when Akshare does not return a stable field
- no database, no cache layer, no streaming, no historical snapshot persistence

## Python data bridge

The repo now includes a simple server-side bridge in `data-service/`.

Endpoints:

- `GET /health`
- `GET /snapshot/workspace`
- `GET /snapshot/market-leadership`
- `GET /snapshot/themes`
- `GET /snapshot/fundamentals`

The frontend uses `/snapshot/workspace`. The other three endpoints are for debugging and inspection.

## Run the Python service locally

Recommended: use Python 3.9+ for the bridge.

From the repo root:

```bash
cd data-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Default local address:

- `http://127.0.0.1:8000`

Optional environment variables:

- `DATA_SERVICE_HOST`
- `DATA_SERVICE_PORT`
- `AKSHARE_SLEEP_MS`
- `AKSHARE_HISTORY_DAYS`
- `AKSHARE_LOOKBACK_BUFFER_DAYS`

## Next.js live data setup

### Mock only

No environment variables required.

### Akshare

Set these in the Next.js app environment:

- `DATA_PROVIDER=akshare`
- `AKSHARE_API_URL=http://127.0.0.1:8000`
- `AKSHARE_API_KEY=<optional bearer token>`

If the bridge is unavailable, the Next.js server falls back to the existing mock dataset automatically so the UI keeps working.

### Tushare

- `DATA_PROVIDER=tushare`
- `TUSHARE_API_URL=<your bridge endpoint>`
- `TUSHARE_TOKEN=<your token>`

## Refresh behavior

- manual refresh button calls `POST /api/refresh`
- cron refresh calls `GET /api/cron/refresh`
- refresh does not persist data yet; it checks bridge availability and the next page render fetches fresh data

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
