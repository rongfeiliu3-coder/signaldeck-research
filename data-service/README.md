# Data Service

This is a minimal Python bridge for live A-share data.

It fetches Akshare data server-side and returns a unified workspace snapshot for the Next.js app.

## Endpoints

- `GET /health`
- `GET /snapshot/workspace`
- `GET /snapshot/market-leadership`
- `GET /snapshot/themes`
- `GET /snapshot/fundamentals`

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Default address: `http://127.0.0.1:8000`

## Notes

- no database
- no cache layer
- no realtime streaming
- intended only as a simple server-side Akshare bridge
