# Quantize A-share Research Workspace

Quantize is a Chinese-first A-share research workspace for daily study of market rotation, theme strength, fundamentals, fund exposure, and opportunity analysis.

This is research support only. It does not provide direct investment advice, live trading execution, or sensational stock-picking claims.

## Core Modules

- 市场主线 / Market Leadership
- 机会分析 / Opportunity Lab
- 主题研究 / Theme Research
- 基本面看板 / Fundamentals
- 基金透视 / Fund Diagnostics

## Research Rules

- Separate price action, breadth, turnover, leader concentration, and fundamentals.
- Keep rankings rule-based and explainable.
- Mark whether conclusions come from market data, financial data, theme basket rules, or AI synthesis.
- Use AI only for opportunity summaries, counter arguments, and narrative-bias detection.
- Never let AI decide rankings or override structured scores.

## Environment Variables

The app has two separate provider systems:

- Market data provider: controls whether the workspace uses mock data, Akshare bridge data, or a future Tushare adapter.
- AI provider: controls whether research summaries use mock AI or DeepSeek.

These are intentionally separate. Turning on DeepSeek does not make market data live. Turning on Akshare does not require AI.

## Local Setup

Create a local-only env file:

```bash
cp .env.example .env.local
```

For the safest local setup, keep mock data and mock AI:

```env
DATA_PROVIDER=mock
RESEARCH_AI_PROVIDER=mock
```

To test DeepSeek locally, put these in `.env.local`:

```env
RESEARCH_AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

`DEEPSEEK_BASE_URL` and `DEEPSEEK_MODEL` are optional. If missing, the app uses:

- `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- `DEEPSEEK_MODEL=deepseek-chat`

Never commit `.env.local`. Never prefix server secrets with `NEXT_PUBLIC_`.

## Local Desktop Launcher And Monitor

This project now includes a local-first graphical run monitor for personal use.

Create the Windows desktop shortcut:

```powershell
cd C:\quantize
powershell -ExecutionPolicy Bypass -File .\scripts\create-desktop-shortcut.ps1
```

Then double-click `Quantize A股研究工作台` on the Desktop. The launcher starts the local Next.js app on port `3001` if it is not already running, then opens:

```txt
http://127.0.0.1:3001/monitor
```

The monitor page can:

- show whether the Quantize web app, Akshare bridge, and nightly research runner are running
- start, stop, or restart the Akshare bridge
- run the nightly research job on demand
- show recent local logs from `runtime/logs/`

Safety rules:

- The monitor only controls services listed in `config/local-processes.json`.
- It does not allow arbitrary command input from the browser.
- Runtime logs are ignored by git through `runtime/`.
- API keys stay in `.env.local` or deployment environment variables and must never be committed.

The first version is intentionally a local web control console. It is structured so an Electron desktop shell can wrap it later without rewriting the research workspace.

## Vercel Environment Variables

In Vercel, open:

`Project -> Settings -> Environment Variables`

Required for DeepSeek:

```env
RESEARCH_AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_real_deepseek_key
```

Optional because the app has defaults:

```env
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

After changing Vercel environment variables, redeploy the project.

## AI Safety

The DeepSeek key is only read from server-side code via `process.env.DEEPSEEK_API_KEY`.

- The key is never sent to browser components.
- The key is never returned from `/api/ai/test`.
- If `RESEARCH_AI_PROVIDER=deepseek` but `DEEPSEEK_API_KEY` is missing, the app falls back to mock AI.
- AI output is limited to summaries, counter arguments, and narrative-bias detection.
- Rankings remain controlled by structured scoring in `lib/research/opportunities.ts`.

Test endpoint:

```txt
GET /api/ai/test
```

It reports the active AI adapter, whether fallback was triggered, and the allowed AI scope. It does not expose secrets.

## Market Data Setup

Mock data requires no external service:

```env
DATA_PROVIDER=mock
```

Akshare bridge mode uses the local Python service in `data-service/`:

```env
DATA_PROVIDER=akshare
AKSHARE_API_URL=http://127.0.0.1:8000
AKSHARE_CACHE_TTL_SECONDS=900
```

The app does not require Akshare to start. If the bridge is unavailable, the provider layer automatically falls back to mock data so local development and Vercel previews stay usable.

Run the bridge locally:

```powershell
cd C:\quantize\data-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Check the bridge:

```txt
http://127.0.0.1:8000/health
```

Force a bridge refresh, bypassing the in-memory cache:

```txt
http://127.0.0.1:8000/snapshot/workspace?refresh=1
```

Bridge endpoints:

- `GET /health`
- `GET /snapshot/workspace`
- `GET /snapshot/market-leadership`
- `GET /snapshot/themes`
- `GET /snapshot/fundamentals`

Akshare bridge defaults:

- local-first URL: `http://127.0.0.1:8000`
- default scan universe: configured theme baskets only
- default cache TTL: 900 seconds
- no full-market A-share scan by default
- no paid server required for local research

## Visible Status

Opportunity Lab shows:

- `Data Status`: `Akshare Live` or `Mock Fallback`.
- `AI Status`: whether summaries are using DeepSeek or mock/disabled AI.

This makes it clear whether a research conclusion is powered by live providers or fallback data.

## Nightly Research Reports

Run the overnight research workflow:

```powershell
cd C:\quantize
npm run research:nightly
```

The runner writes timestamped files to `reports/` and updates these latest pointers:

- `reports/latest.json`
- `reports/latest.md`
- `reports/latest-report.json` for backward compatibility
- `reports/latest-report.md` for backward compatibility

Open the app page:

```txt
http://127.0.0.1:3001/reports
```

If no report exists, the page shows an empty state with the command to run.

### Nightly With Akshare

Start the local bridge first:

```powershell
cd C:\quantize\data-service
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

If Windows refuses port `8000`, use a high port such as `18080`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 18080
```

Then run the nightly job with Akshare:

```powershell
cd C:\quantize
$env:DATA_PROVIDER="akshare"
$env:AKSHARE_API_URL="http://127.0.0.1:8000"
$env:NIGHTLY_RESEARCH_TIMEOUT_MS="90000"
npm run research:nightly
```

Use `http://127.0.0.1:18080` instead if you started the bridge on `18080`.

The runner logs:

- selected provider
- bridge URL
- whether fallback happened
- active provider
- number of symbols loaded

To verify whether the report used real or mock data, check either:

- console output: `Fallback happened` and `Real symbols loaded`
- `reports/latest.json -> metadata.providerMode`
- `/reports` page data status card

If the bridge fails, times out, or returns invalid data, the runner falls back to mock data and still writes a report. No Supabase, paid API, or paid server is required.

## Vercel And Localhost

Vercel cannot access your computer's `localhost` or `127.0.0.1`.

For production live Akshare data, set `AKSHARE_API_URL` to a public bridge URL. That could be a small VPS or hosted Python service later. For now, the recommended setup is:

- local research: run the bridge on your computer and use `AKSHARE_API_URL=http://127.0.0.1:8000`
- Vercel preview/production: keep mock fallback unless you intentionally deploy a public bridge
- no Supabase or paid server is required for this local-first phase

Render bridge settings:

- Language: Python 3
- Root Directory: `data-service`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- FastAPI entry point: `main:app`

Render Free constraints are expected: 512 MB RAM, low CPU, and spin-down after inactivity. The bridge is configured to scan only the theme basket universe, cache snapshots in memory, expose a lightweight `/health`, and let the frontend fall back to mock data if the public bridge is slow or unavailable.

Cloud speed recommendation:

- Vercel should use a short bridge timeout, for example `AKSHARE_REQUEST_TIMEOUT_MS=8000`.
- If Render Free is asleep or slow, the app will show `Mock Fallback` quickly instead of spinning for minutes.
- For real-data research, the fastest path is local: run the Akshare bridge on your computer and open the local Next.js app.

Local real-data workflow:

```powershell
cd C:\quantize\data-service
.\.venv\Scripts\python.exe app.py
```

In a second terminal:

```powershell
cd C:\quantize
npm run dev -- -p 3001
```

Open:

```txt
http://127.0.0.1:3001
```

Theme research notes:

- Active baskets live in `config/theme-baskets.json`.
- Optional basket templates live in `config/theme-basket-presets.json`.
- Presets are shown in the Theme Research page but are not scanned by default, which keeps Render Free from pulling too many Akshare symbols.
- The Theme Research page ranks the current top 5 active baskets by latest trading-session heat.
- Weekend and holiday pages display `最近交易日` when the snapshot date is not today's China date.

Fundamentals notes:

- The bridge first tries Akshare's financial analysis endpoint, then falls back to TongHuaShun financial abstracts.
- If all financial fields are unavailable, the quality score is shown as `0/100` instead of a misleading low fixed score.
- Dividend yield is still best-effort and may remain unavailable for some symbols.

Once Render is deployed, set Vercel to:

```env
DATA_PROVIDER=akshare
AKSHARE_API_URL=https://your-render-service.onrender.com
```

## Provider Architecture

Data adapters:

- `lib/data/adapters/mock.ts`
- `lib/data/adapters/akshare.ts`
- `lib/data/adapters/tushare.ts`
- `lib/data/provider.ts`

AI adapters:

- `lib/ai/adapters/mock.ts`
- `lib/ai/adapters/deepseek.ts`
- `lib/ai/provider.ts`

Research analytics:

- `lib/research/analytics.ts`
- `lib/research/opportunities.ts`
- `lib/research/workspace.ts`

Editable config:

- `config/theme-baskets.json`
- `config/fundamental-scoring.json`

## What Is Real vs Mocked

Real when `DATA_PROVIDER=akshare` and the bridge is running:

- tracked A-share stock names and latest prices
- recent daily history used by charts
- 1 day / 5 day / 20 day returns
- turnover rate and simple turnover change
- basic industry information when available
- minimal financial indicator fields when available
- theme breadth derived from tracked constituents

Still mocked or simplified:

- full-market industry breadth
- public fund holdings and fund overlap
- some fundamentals when Akshare fields are missing
- historical snapshot persistence
- database, cache layer, and streaming

## Development

Install and run:

```bash
npm install
npm run dev
```

Validate:

```bash
npm run typecheck
npm run build
```
