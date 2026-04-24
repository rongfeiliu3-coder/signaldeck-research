from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Query

import app as bridge


app = FastAPI(
  title="Quantize Akshare Data Bridge",
  description="Local-first A-share data bridge for the Quantize research workspace.",
  version="0.1.0"
)


def _health_payload() -> dict[str, Any]:
  theme_baskets = bridge._load_theme_baskets()
  symbols, _ = bridge._collect_symbols(theme_baskets)
  limited_symbols = symbols[:bridge.MAX_SYMBOLS]
  return {
    "ok": True,
    "service": "akshare-data-bridge",
    "runtime": "fastapi",
    "mode": "local-first",
    "universe": "configured-theme-baskets",
    "symbolCount": len(limited_symbols),
    "configuredSymbolCount": len(symbols),
    "cache": bridge._cache_status()
  }


@app.get("/health")
def health() -> dict[str, Any]:
  return _health_payload()


@app.get("/snapshot/workspace")
def snapshot_workspace(refresh: str | None = Query(default=None)) -> dict[str, Any]:
  return bridge.build_workspace_snapshot(force_refresh=refresh in {"1", "true", "yes"})


@app.get("/snapshot/market-leadership")
def snapshot_market_leadership(refresh: str | None = Query(default=None)) -> dict[str, Any]:
  workspace = bridge.build_workspace_snapshot(force_refresh=refresh in {"1", "true", "yes"})
  return bridge.build_market_leadership_snapshot(workspace)


@app.get("/snapshot/themes")
def snapshot_themes(refresh: str | None = Query(default=None)) -> dict[str, Any]:
  workspace = bridge.build_workspace_snapshot(force_refresh=refresh in {"1", "true", "yes"})
  return bridge.build_theme_snapshot(workspace)


@app.get("/snapshot/fundamentals")
def snapshot_fundamentals(refresh: str | None = Query(default=None)) -> dict[str, Any]:
  workspace = bridge.build_workspace_snapshot(force_refresh=refresh in {"1", "true", "yes"})
  return bridge.build_fundamentals_snapshot(workspace)
