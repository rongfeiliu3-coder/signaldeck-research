from __future__ import annotations

import json
import os
import threading
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List

import akshare as ak
import pandas as pd
from flask import Flask, jsonify, request


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
THEME_CONFIG_PATH = PROJECT_ROOT / "config" / "theme-baskets.json"
METADATA_PATH = BASE_DIR / "metadata.json"

REQUEST_SLEEP_MS = int(os.getenv("AKSHARE_SLEEP_MS", "120"))
HISTORY_DAYS = int(os.getenv("AKSHARE_HISTORY_DAYS", "90"))
LOOKBACK_BUFFER_DAYS = int(os.getenv("AKSHARE_LOOKBACK_BUFFER_DAYS", "160"))
CACHE_TTL_SECONDS = int(os.getenv("AKSHARE_CACHE_TTL_SECONDS", "900"))
MAX_SYMBOLS = int(os.getenv("AKSHARE_MAX_SYMBOLS", "30"))
SNAPSHOT_TIMEOUT_SECONDS = int(os.getenv("AKSHARE_SNAPSHOT_TIMEOUT_SECONDS", "75"))

_cache_lock = threading.Lock()
_workspace_cache: Dict[str, Any] = {"payload": None, "generated_at": 0.0}


def _load_json(path: Path) -> Any:
  with path.open("r", encoding="utf-8") as handle:
    return json.load(handle)


def _load_theme_baskets() -> List[Dict[str, Any]]:
  return _load_json(THEME_CONFIG_PATH)


def _load_metadata() -> Dict[str, Dict[str, Any]]:
  return _load_json(METADATA_PATH)


def _sleep_between_calls() -> None:
  if REQUEST_SLEEP_MS > 0:
    time.sleep(REQUEST_SLEEP_MS / 1000.0)


def _safe_float(value: Any, default: float = 0.0) -> float:
  if value is None:
    return default
  if isinstance(value, str):
    cleaned = value.replace(",", "").replace("%", "").strip()
    if cleaned in {"", "--", "nan", "None"}:
      return default
    try:
      return float(cleaned)
    except ValueError:
      return default
  try:
    if pd.isna(value):
      return default
  except TypeError:
    pass
  try:
    return float(value)
  except (TypeError, ValueError):
    return default


def _first_existing(row: pd.Series | Dict[str, Any], keys: List[str], default: Any = None) -> Any:
  for key in keys:
    if key in row:
      value = row[key]
      if value is not None:
        return value
  return default


def _find_column(columns: List[str], contains: List[str]) -> str | None:
  for column in columns:
    if any(token in str(column) for token in contains):
      return str(column)
  return None


def _symbol_to_plain_code(symbol: str) -> str:
  return symbol.split(".")[0]


def _symbol_to_exchange(symbol: str) -> str:
  return symbol.split(".")[1]


def _date_window() -> Dict[str, str]:
  end_date = datetime.now()
  start_date = end_date - timedelta(days=LOOKBACK_BUFFER_DAYS)
  return {"start": start_date.strftime("%Y%m%d"), "end": end_date.strftime("%Y%m%d")}


def _collect_symbols(theme_baskets: List[Dict[str, Any]]) -> tuple[List[str], Dict[str, List[str]]]:
  symbols: List[str] = []
  theme_map: Dict[str, List[str]] = {}
  for basket in theme_baskets:
    for symbol in basket.get("symbols", []):
      if symbol not in symbols:
        symbols.append(symbol)
      theme_map.setdefault(symbol, []).append(basket["slug"])
  return symbols, theme_map


def _fetch_history(symbol: str) -> pd.DataFrame:
  plain_code = _symbol_to_plain_code(symbol)
  prefixed_code = f"{_symbol_to_exchange(symbol).lower()}{plain_code}"
  window = _date_window()
  try:
    history_df = ak.stock_zh_a_hist(
      symbol=plain_code,
      period="daily",
      start_date=window["start"],
      end_date=window["end"],
      adjust=""
    )
  except Exception:
    history_df = pd.DataFrame()

  if history_df.empty:
    try:
      daily_df = ak.stock_zh_a_daily(
        symbol=prefixed_code,
        start_date=window["start"],
        end_date=window["end"],
        adjust=""
      )
      if not daily_df.empty:
        history_df = daily_df.rename(columns={"date": "日期", "close": "收盘", "turnover": "换手率"})
        history_df["换手率"] = history_df["换手率"].astype(float) * 100
    except Exception:
      history_df = pd.DataFrame()

  if history_df.empty:
    try:
      tx_df = ak.stock_zh_a_hist_tx(
        symbol=prefixed_code,
        start_date=window["start"],
        end_date=window["end"],
        adjust=""
      )
      if not tx_df.empty:
        history_df = tx_df.rename(columns={"date": "日期", "close": "收盘"})
        history_df["换手率"] = 0.0
    except Exception:
      return pd.DataFrame()

  if history_df.empty:
    return history_df

  if "日期" not in history_df.columns:
    return pd.DataFrame()

  history_df["日期"] = pd.to_datetime(history_df["日期"])
  return history_df.sort_values("日期").reset_index(drop=True)


def _fetch_individual_info(symbol: str) -> Dict[str, Any]:
  plain_code = _symbol_to_plain_code(symbol)
  try:
    info_df = ak.stock_individual_info_em(symbol=plain_code)
  except Exception:
    return {}
  if info_df.empty:
    return {}
  return {str(row["item"]).strip(): row["value"] for _, row in info_df.iterrows()}


def _empty_financials() -> Dict[str, float]:
  return {
    "revenueGrowth": 0.0,
    "netProfitGrowth": 0.0,
    "roe": 0.0,
    "grossMargin": 0.0,
    "debtRatio": 0.0,
    "operatingCashFlow": 0.0,
    "dividendYield": 0.0
  }


def _empty_security(symbol: str, metadata_map: Dict[str, Dict[str, Any]], theme_map: Dict[str, List[str]]) -> Dict[str, Any]:
  base_meta = metadata_map.get(symbol, {})
  return {
    "symbol": symbol,
    "name": base_meta.get("name", symbol),
    "exchange": _symbol_to_exchange(symbol),
    "industry": base_meta.get("industry", "A-Share"),
    "sector": base_meta.get("sector", "A-Share"),
    "styleTags": base_meta.get("styleTags", []),
    "themeTags": theme_map.get(symbol, []),
    "description": base_meta.get("description", "A-share research constituent."),
    "price": 0.0,
    "marketCapCnyBn": 0.0,
    "turnoverRate": 0.0,
    "turnoverDelta": 0.0,
    "return1d": 0.0,
    "return5d": 0.0,
    "return20d": 0.0,
    "leaderScore": 0.15,
    "fundamentals": _empty_financials(),
    "history": []
  }


def _fetch_financials(symbol: str) -> Dict[str, float]:
  plain_code = _symbol_to_plain_code(symbol)
  try:
    financial_df = ak.stock_financial_analysis_indicator(symbol=plain_code)
  except Exception:
    return _empty_financials()

  if financial_df.empty:
    return _empty_financials()

  latest = financial_df.iloc[0]
  columns = [str(column) for column in financial_df.columns]
  revenue_col = _find_column(columns, ["主营业务收入增长率", "营业收入增长率"])
  profit_col = _find_column(columns, ["净利润增长率"])
  roe_col = _find_column(columns, ["净资产收益率", "ROE"])
  margin_col = _find_column(columns, ["销售毛利率", "毛利率"])
  debt_col = _find_column(columns, ["资产负债率"])
  cash_col = _find_column(columns, ["经营现金净流量", "经营现金流"])
  dividend_col = _find_column(columns, ["股息发放率", "股息率", "分红"])

  return {
    "revenueGrowth": _safe_float(latest.get(revenue_col), 0.0) / 100.0 if revenue_col else 0.0,
    "netProfitGrowth": _safe_float(latest.get(profit_col), 0.0) / 100.0 if profit_col else 0.0,
    "roe": _safe_float(latest.get(roe_col), 0.0) / 100.0 if roe_col else 0.0,
    "grossMargin": _safe_float(latest.get(margin_col), 0.0) / 100.0 if margin_col else 0.0,
    "debtRatio": _safe_float(latest.get(debt_col), 0.0) / 100.0 if debt_col else 0.0,
    "operatingCashFlow": _safe_float(latest.get(cash_col), 0.0) if cash_col else 0.0,
    "dividendYield": _safe_float(latest.get(dividend_col), 0.0) / 100.0 if dividend_col else 0.0
  }


def _build_history_payload(history_df: pd.DataFrame) -> List[Dict[str, Any]]:
  if history_df.empty:
    return []
  trimmed = history_df.tail(HISTORY_DAYS)
  return [
    {"date": row["日期"].strftime("%Y-%m-%d"), "value": round(_safe_float(row.get("收盘")), 2)}
    for _, row in trimmed.iterrows()
  ]


def _compute_return(history_df: pd.DataFrame, sessions: int) -> float:
  if history_df.empty or "收盘" not in history_df.columns:
    return 0.0
  closes = history_df["收盘"].astype(float).tolist()
  if len(closes) <= sessions:
    return 0.0
  latest = closes[-1]
  base = closes[-(sessions + 1)]
  return 0.0 if not base else (latest - base) / base


def _compute_turnover_delta(history_df: pd.DataFrame) -> float:
  if history_df.empty or "换手率" not in history_df.columns or len(history_df) < 6:
    return 0.0
  latest = _safe_float(history_df.iloc[-1].get("换手率")) / 100.0
  baseline = history_df.tail(6).head(5)["换手率"].apply(_safe_float).mean() / 100.0
  return latest - baseline


def _compute_leader_score(return_1d: float, return_5d: float, return_20d: float, turnover_delta: float) -> float:
  raw = 0.55 + return_1d * 2.0 + return_5d * 1.3 + return_20d * 0.9 + turnover_delta * 3.0
  return max(0.15, min(0.98, raw))


def _default_fund_baskets(theme_baskets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
  funds = []
  for basket in theme_baskets:
    symbols = basket.get("symbols", [])
    if not symbols:
      continue
    weight = round(1 / len(symbols), 4)
    funds.append(
      {
        "slug": f"{basket['slug']}-basket",
        "name": f"{basket['nameZh']}研究篮子",
        "style": "主题观察",
        "description": f"基于 {basket['nameZh']} 主题成分构造的等权研究篮子。",
        "holdings": [{"symbol": symbol, "weight": weight} for symbol in symbols]
      }
    )
  return funds


def _build_workspace_snapshot_uncached() -> Dict[str, Any]:
  started_at = time.monotonic()
  theme_baskets = _load_theme_baskets()
  metadata_map = _load_metadata()
  all_symbols, theme_map = _collect_symbols(theme_baskets)
  all_symbols = all_symbols[:MAX_SYMBOLS]
  securities: List[Dict[str, Any]] = []
  timeout_triggered = False
  as_of_date = datetime.now().strftime("%Y-%m-%d")

  for symbol in all_symbols:
    if time.monotonic() - started_at > SNAPSHOT_TIMEOUT_SECONDS:
      timeout_triggered = True
      securities.append(_empty_security(symbol, metadata_map, theme_map))
      continue

    history_df = _fetch_history(symbol)
    _sleep_between_calls()
    info_map = _fetch_individual_info(symbol)
    _sleep_between_calls()
    financials = _fetch_financials(symbol)
    _sleep_between_calls()

    latest_close = 0.0
    latest_turnover = 0.0
    if not history_df.empty:
      latest_close = _safe_float(history_df.iloc[-1].get("收盘"))
      latest_turnover = _safe_float(history_df.iloc[-1].get("换手率")) / 100.0
      as_of_date = history_df.iloc[-1]["日期"].strftime("%Y-%m-%d")

    turnover_delta = _compute_turnover_delta(history_df)
    return_1d = _compute_return(history_df, 1)
    return_5d = _compute_return(history_df, 5)
    return_20d = _compute_return(history_df, 20)
    base_meta = metadata_map.get(symbol, {})

    securities.append(
      {
        "symbol": symbol,
        "name": str(_first_existing(info_map, ["股票简称"], base_meta.get("name", symbol))),
        "exchange": _symbol_to_exchange(symbol),
        "industry": str(_first_existing(info_map, ["行业"], base_meta.get("industry", "A-Share"))),
        "sector": base_meta.get("sector", "A-Share"),
        "styleTags": base_meta.get("styleTags", []),
        "themeTags": theme_map.get(symbol, []),
        "description": base_meta.get("description", "A-share research constituent."),
        "price": round(latest_close, 2),
        "marketCapCnyBn": round(_safe_float(_first_existing(info_map, ["总市值"])) / 1000000000.0, 2),
        "turnoverRate": round(latest_turnover, 4),
        "turnoverDelta": round(float(turnover_delta), 4),
        "return1d": round(return_1d, 4),
        "return5d": round(return_5d, 4),
        "return20d": round(return_20d, 4),
        "leaderScore": round(float(_compute_leader_score(return_1d, return_5d, return_20d, turnover_delta)), 4),
        "fundamentals": {key: round(value, 4) for key, value in financials.items()},
        "history": _build_history_payload(history_df)
      }
    )

  data_coverage = round(sum(1 for item in securities if item["price"] > 0) / len(securities), 4) if securities else 0.0
  return {
    "asOfDate": as_of_date,
    "universeName": "A-share configured theme universe",
    "themeBaskets": theme_baskets,
    "securities": securities,
    "funds": _default_fund_baskets(theme_baskets),
    "sourceStatus": {
      "provider": "akshare",
      "mode": "live",
      "universe": "configured-theme-baskets",
      "symbolCount": len(all_symbols),
      "dataCoverage": data_coverage,
      "cacheTtlSeconds": CACHE_TTL_SECONDS,
      "snapshotTimeoutSeconds": SNAPSHOT_TIMEOUT_SECONDS,
      "timeoutTriggered": timeout_triggered,
      "generatedAt": datetime.now().isoformat(timespec="seconds")
    }
  }


def build_workspace_snapshot(force_refresh: bool = False) -> Dict[str, Any]:
  now = time.time()
  with _cache_lock:
    cached_payload = _workspace_cache.get("payload")
    generated_at = float(_workspace_cache.get("generated_at") or 0.0)
    # Local-first research should stay responsive: normal page loads reuse the
    # latest snapshot, while explicit refresh requests pull from Akshare again.
    if cached_payload and not force_refresh:
      return cached_payload

    payload = _build_workspace_snapshot_uncached()
    _workspace_cache["payload"] = payload
    _workspace_cache["generated_at"] = time.time()
    return payload


def _cache_status() -> Dict[str, Any]:
  payload = _workspace_cache.get("payload")
  generated_at = float(_workspace_cache.get("generated_at") or 0.0)
  age_seconds = int(time.time() - generated_at) if payload else None
  return {
    "enabled": True,
    "ttlSeconds": CACHE_TTL_SECONDS,
    "hasCachedSnapshot": bool(payload),
    "ageSeconds": age_seconds,
    "symbolLimit": MAX_SYMBOLS,
    "snapshotTimeoutSeconds": SNAPSHOT_TIMEOUT_SECONDS
  }


def build_market_leadership_snapshot(workspace: Dict[str, Any]) -> Dict[str, Any]:
  themes = []
  for basket in workspace["themeBaskets"]:
    members = [item for item in workspace["securities"] if item["symbol"] in basket["symbols"]]
    rising = [item for item in members if item["return1d"] > 0]
    themes.append(
      {
        "slug": basket["slug"],
        "nameZh": basket["nameZh"],
        "nameEn": basket["nameEn"],
        "memberCount": len(members),
        "risingCount": len(rising),
        "breadth": round(len(rising) / len(members), 4) if members else 0.0,
        "avgReturn1d": round(sum(item["return1d"] for item in members) / len(members), 4) if members else 0.0,
        "avgReturn5d": round(sum(item["return5d"] for item in members) / len(members), 4) if members else 0.0,
        "avgReturn20d": round(sum(item["return20d"] for item in members) / len(members), 4) if members else 0.0
      }
    )
  return {"asOfDate": workspace["asOfDate"], "themes": themes}


def build_theme_snapshot(workspace: Dict[str, Any]) -> Dict[str, Any]:
  themes = []
  for basket in workspace["themeBaskets"]:
    members = [item for item in workspace["securities"] if item["symbol"] in basket["symbols"]]
    themes.append(
      {
        "slug": basket["slug"],
        "nameZh": basket["nameZh"],
        "nameEn": basket["nameEn"],
        "descriptionZh": basket["descriptionZh"],
        "focus": basket["focus"],
        "constituents": members
      }
    )
  return {"asOfDate": workspace["asOfDate"], "themes": themes}


def build_fundamentals_snapshot(workspace: Dict[str, Any]) -> Dict[str, Any]:
  return {
    "asOfDate": workspace["asOfDate"],
    "stocks": [
      {
        "symbol": item["symbol"],
        "name": item["name"],
        "industry": item["industry"],
        "sector": item["sector"],
        "fundamentals": item["fundamentals"]
      }
      for item in workspace["securities"]
    ]
  }


def _force_refresh_requested() -> bool:
  return request.args.get("refresh") in {"1", "true", "yes"}


app = Flask(__name__)


@app.get("/health")
def health() -> Any:
  theme_baskets = _load_theme_baskets()
  symbols, _ = _collect_symbols(theme_baskets)
  limited_symbols = symbols[:MAX_SYMBOLS]
  return jsonify(
    {
      "ok": True,
      "service": "akshare-data-bridge",
      "mode": "local-first",
      "universe": "configured-theme-baskets",
      "symbolCount": len(limited_symbols),
      "configuredSymbolCount": len(symbols),
      "cache": _cache_status()
    }
  )


@app.get("/snapshot/workspace")
def snapshot_workspace() -> Any:
  return jsonify(build_workspace_snapshot(force_refresh=_force_refresh_requested()))


@app.get("/snapshot/market-leadership")
def snapshot_market_leadership() -> Any:
  workspace = build_workspace_snapshot(force_refresh=_force_refresh_requested())
  return jsonify(build_market_leadership_snapshot(workspace))


@app.get("/snapshot/themes")
def snapshot_themes() -> Any:
  workspace = build_workspace_snapshot(force_refresh=_force_refresh_requested())
  return jsonify(build_theme_snapshot(workspace))


@app.get("/snapshot/fundamentals")
def snapshot_fundamentals() -> Any:
  workspace = build_workspace_snapshot(force_refresh=_force_refresh_requested())
  return jsonify(build_fundamentals_snapshot(workspace))


if __name__ == "__main__":
  host = os.getenv("DATA_SERVICE_HOST", "127.0.0.1")
  port = int(os.getenv("DATA_SERVICE_PORT", "8000"))
  app.run(host=host, port=port, debug=False)
