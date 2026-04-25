# Akshare Data Bridge

This is a local-first Python bridge for A-share research data. It keeps Akshare server-side and returns the workspace snapshot shape expected by the Next.js app.

It is intentionally lightweight:

- no database
- no paid API required
- no full-market scan by default
- universe is limited to `config/theme-baskets.json`
- in-memory TTL cache avoids repeated heavy Akshare requests
- if the bridge is offline, Next.js falls back to mock data
- Render Free friendly defaults for memory, CPU, and spin-down behavior

## Run Locally

From the project root:

```powershell
cd C:\quantize\data-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Local ASGI mode, matching Render:

```powershell
cd C:\quantize\data-service
.venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000
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
AKSHARE_MAX_SYMBOLS=30
AKSHARE_SNAPSHOT_TIMEOUT_SECONDS=75
```

`AKSHARE_CACHE_TTL_SECONDS=900` is reported in `/health` as the freshness guide. For local-first responsiveness, normal page loads reuse the latest cached snapshot even after the guide expires. Use `?refresh=1` when you explicitly want to pull a new Akshare snapshot.

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

## Render Deployment

Render should deploy this folder as a Python web service.

Expected manual settings:

- Language: Python 3
- Root Directory: `data-service`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

FastAPI entry point:

- `main:app`

The repository also includes a root-level `render.yaml` blueprint with the same settings.

After Render gives you a public URL, set this in Vercel:

```env
DATA_PROVIDER=akshare
AKSHARE_API_URL=https://your-render-service.onrender.com
```

## Render Free Limitations

Render Free instances are constrained:

- about 512 MB RAM
- low CPU
- cold starts after inactivity
- slower outbound data calls

Bridge safeguards for this tier:

- scans only the configured theme universe, not the full A-share market
- does not scan optional presets in `config/theme-basket-presets.json`
- limits the default universe with `AKSHARE_MAX_SYMBOLS=30`
- uses `AKSHARE_SNAPSHOT_TIMEOUT_SECONDS=75` to avoid long blocking refreshes
- normal page loads reuse the latest in-memory snapshot
- `/health` stays lightweight and does not fetch Akshare data
- if the bridge fails, times out, or sleeps, the Next.js app falls back to mock data

Expect the first request after spin-down to be slower. Use `/health` for uptime checks and `/snapshot/workspace?refresh=1` only when you explicitly want a new Akshare pull.

Financial data behavior:

- price history uses the primary Akshare A-share history endpoint with a fallback daily endpoint
- fundamentals use Akshare financial indicators with TongHuaShun financial abstracts as fallback
- missing fundamentals are returned as zero so the frontend can mark low-confidence financial coverage without crashing
