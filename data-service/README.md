# Akshare Data Bridge

This is a local-first Python bridge for A-share research data. It keeps Akshare server-side and returns the workspace snapshot shape expected by the Next.js app.

It is intentionally lightweight:

- no database
- no paid API required
- no full-market scan by default
- universe is limited to `config/theme-baskets.json`
- in-memory TTL cache avoids repeated heavy Akshare requests
- if the bridge is offline, Next.js falls back to mock data

## Run Locally

From the project root:

```powershell
cd C:\quantize\data-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Default local URL:

```txt
http://127.0.0.1:8000
```

Health check:

```txt
http://127.0.0.1:8000/health
```

Workspace snapshot:

```txt
http://127.0.0.1:8000/snapshot/workspace
```

Force refresh, bypassing cache:

```txt
http://127.0.0.1:8000/snapshot/workspace?refresh=1
```

## Environment Variables

Optional bridge settings:

```env
DATA_SERVICE_HOST=127.0.0.1
DATA_SERVICE_PORT=8000
AKSHARE_CACHE_TTL_SECONDS=900
AKSHARE_SLEEP_MS=120
AKSHARE_HISTORY_DAYS=90
AKSHARE_LOOKBACK_BUFFER_DAYS=160
```

`AKSHARE_CACHE_TTL_SECONDS=900` means the bridge reuses a snapshot for 15 minutes before requesting Akshare again.

## Connect Next.js Locally

In `C:\quantize\.env.local`:

```env
DATA_PROVIDER=akshare
AKSHARE_API_URL=http://127.0.0.1:8000
```

Then run the Next.js app:

```powershell
cd C:\quantize
npm run dev
```

The UI will show:

- `Akshare Live` when the bridge is reachable.
- `Mock Fallback` when the bridge is offline or unavailable.

## Vercel Note

Vercel cannot access your computer's `localhost` or `127.0.0.1`.

For production live data, `AKSHARE_API_URL` must point to a public bridge URL, for example a small VPS or other hosted Python service. For now, keep this local-first and use mock fallback on Vercel unless you intentionally publish the bridge.
