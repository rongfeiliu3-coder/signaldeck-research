from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List

import akshare as ak
import pandas as pd
from flask import Flask, jsonify


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
THEME_CONFIG_PATH = PROJECT_ROOT / "config" / "theme-baskets.json"
METADATA_PATH = BASE_DIR / "metadata.json"

REQUEST_SLEEP_MS = int(os.getenv("AKSHARE_SLEEP_MS", "120"))
HISTORY_DAYS = int(os.getenv("AKSHARE_HISTORY_DAYS", "90"))
LOOKBACK_BUFFER_DAYS = int(os.getenv("AKSHARE_LOOKBACK_BUFFER_DAYS", "160"))


@dataclass
class SecuritySnapshot:
  symbol: str
  name: str
  exchange: str
  industry: str
  sector: str
  style_tags: List[str]
  theme_tags: List[str]
  description: str
  price: float
  market_cap_cny_bn: float
  turnover_rate: float
  turnover_delta: float
  return_1d: float
  return_5d: float
  return_20d: float
  leader_score: float
  fundamentals: Dict[str, float]
  history: List[Dict[str, Any]]


def _load_theme_baskets() -> List[Dict[str, Any]]:
  with THEME_CONFIG_PATH.open("r", encoding="utf-8") as handle:
    return json.load(handle)


def _load_metadata() -> Dict[str, Dict[str, Any]]:
  with METADATA_PATH.open("r", encoding="utf-8") as handle:
    return json.load(handle)


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


def _safe_history_value(row: pd.Series, key: str) -> float:
  return _safe_float(row.get(key), 0.0)


def _symbol_to_plain_code(symbol: str) -> str:
  return symbol.split(".")[0]


def _symbol_to_exchange(symbol: str) -> str:
  return symbol.split(".")[1]


def _date_window() -> Dict[str, str]:
  end_date = datetime.now()
  start_date = end_date - timedelta(days=LOOKBACK_BUFFER_DAYS)
  return {
    "start": start_date.strftime("%Y%m%d"),
    "end": end_date.strftime("%Y%m%d")
  }


def _fetch_name_map() -> Dict[str, str]:
  spot_df = ak.stock_zh_a_spot_em()
  name_map = {}
  if not spot_df.empty:
    for _, row in spot_df.iterrows():
      code = str(row.get("代码", "")).zfill(6)
      name = str(row.get("名称", "")).strip()
      if code and name:
        if code.startswith("6"):
          symbol = f"{code}.SH"
        elif code.startswith(("0", "3")):
          symbol = f"{code}.SZ"
        else:
          continue
        name_map[symbol] = name
  return name_map


def _fetch_history(symbol: str) -> pd.DataFrame:
  plain_code = _symbol_to_plain_code(symbol)
  window = _date_window()
  history_df = ak.stock_zh_a_hist(
    symbol=plain_code,
    period="daily",
    start_date=window["start"],
    end_date=window["end"],
    adjust=""
  )
  if history_df.empty:
    return history_df

  history_df["日期"] = pd.to_datetime(history_df["日期"])
  history_df = history_df.sort_values("日期").reset_index(drop=True)
  return history_df


def _fetch_individual_info(symbol: str) -> Dict[str, Any]:
  plain_code = _symbol_to_plain_code(symbol)
  info_df = ak.stock_individual_info_em(symbol=plain_code)
  if info_df.empty:
    return {}
  return {str(row["item"]).strip(): row["value"] for _, row in info_df.iterrows()}


def _fetch_financials(symbol: str) -> Dict[str, float]:
  plain_code = _symbol_to_plain_code(symbol)
  try:
    financial_df = ak.stock_financial_analysis_indicator(symbol=plain_code)
  except Exception:
    return {
      "revenueGrowth": 0.0,
      "netProfitGrowth": 0.0,
      "roe": 0.0,
      "grossMargin": 0.0,
      "debtRatio": 0.0,
      "operatingCashFlow": 0.0,
      "dividendYield": 0.0
    }

  if financial_df.empty:
    return {
      "revenueGrowth": 0.0,
      "netProfitGrowth": 0.0,
      "roe": 0.0,
      "grossMargin": 0.0,
      "debtRatio": 0.0,
      "operatingCashFlow": 0.0,
      "dividendYield": 0.0
    }

  latest = financial_df.iloc[0]
  return {
    "revenueGrowth": _safe_float(latest.get("主营业务收入增长率(%)")) / 100.0,
    "netProfitGrowth": _safe_float(latest.get("净利润增长率(%)")) / 100.0,
    "roe": _safe_float(latest.get("净资产收益率(%)")) / 100.0,
    "grossMargin": _safe_float(latest.get("销售毛利率(%)")) / 100.0,
    "debtRatio": _safe_float(latest.get("资产负债率(%)")) / 100.0,
    "operatingCashFlow": _safe_float(latest.get("经营现金净流量与净利润的比率(%)")),
    "dividendYield": _safe_float(latest.get("股息发放率(%)")) / 100.0
  }


def _build_history_payload(history_df: pd.DataFrame) -> List[Dict[str, Any]]:
  trimmed = history_df.tail(HISTORY_DAYS)
  return [
    {
      "date": row["日期"].strftime("%Y-%m-%d"),
      "value": round(_safe_history_value(row, "收盘"), 2)
    }
    for _, row in trimmed.iterrows()
  ]


def _compute_return(history_df: pd.DataFrame, sessions: int) -> float:
  if history_df.empty:
    return 0.0
  closes = history_df["收盘"].astype(float).tolist()
  if len(closes) <= sessions:
    return 0.0
  latest = closes[-1]
  base = closes[-(sessions + 1)]
  if not base:
    return 0.0
  return (latest - base) / base


def _compute_turnover_delta(history_df: pd.DataFrame) -> float:
  if history_df.empty or "换手率" not in history_df.columns or len(history_df) < 6:
    return 0.0
  latest = _safe_float(history_df.iloc[-1]["换手率"]) / 100.0
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


def build_workspace_snapshot() -> Dict[str, Any]:
  theme_baskets = _load_theme_baskets()
  metadata_map = _load_metadata()
  name_map = _fetch_name_map()

  all_symbols = []
  theme_map: Dict[str, List[str]] = {}
  for basket in theme_baskets:
    for symbol in basket.get("symbols", []):
      if symbol not in all_symbols:
        all_symbols.append(symbol)
      theme_map.setdefault(symbol, []).append(basket["slug"])

  securities: List[Dict[str, Any]] = []
  as_of_date = datetime.now().strftime("%Y-%m-%d")

  for symbol in all_symbols:
    history_df = _fetch_history(symbol)
    _sleep_between_calls()
    info_map = _fetch_individual_info(symbol)
    _sleep_between_calls()
    financials = _fetch_financials(symbol)
    _sleep_between_calls()

    latest_close = 0.0
    latest_turnover = 0.0
    if not history_df.empty:
      latest_close = _safe_float(history_df.iloc[-1]["收盘"])
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
        "name": name_map.get(symbol, str(info_map.get("股票简称", symbol))),
        "exchange": _symbol_to_exchange(symbol),
        "industry": str(info_map.get("行业", base_meta.get("industry", "A-Share"))),
        "sector": base_meta.get("sector", "A-Share"),
        "styleTags": base_meta.get("styleTags", []),
        "themeTags": theme_map.get(symbol, []),
        "description": base_meta.get("description", "A 股研究标的。"),
        "price": round(latest_close, 2),
        "marketCapCnyBn": round(_safe_float(info_map.get("总市值")) / 1000000000.0, 2),
        "turnoverRate": round(latest_turnover, 4),
        "turnoverDelta": round(turnover_delta, 4),
        "return1d": round(return_1d, 4),
        "return5d": round(return_5d, 4),
        "return20d": round(return_20d, 4),
        "leaderScore": round(_compute_leader_score(return_1d, return_5d, return_20d, turnover_delta), 4),
        "fundamentals": {
          "revenueGrowth": round(financials["revenueGrowth"], 4),
          "netProfitGrowth": round(financials["netProfitGrowth"], 4),
          "roe": round(financials["roe"], 4),
          "grossMargin": round(financials["grossMargin"], 4),
          "debtRatio": round(financials["debtRatio"], 4),
          "operatingCashFlow": round(financials["operatingCashFlow"], 4),
          "dividendYield": round(financials["dividendYield"], 4)
        },
        "history": _build_history_payload(history_df)
      }
    )

  return {
    "asOfDate": as_of_date,
    "universeName": "A-share Theme Research Universe",
    "themeBaskets": theme_baskets,
    "securities": securities,
    "funds": _default_fund_baskets(theme_baskets)
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

  return {
    "asOfDate": workspace["asOfDate"],
    "themes": themes
  }


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

  return {
    "asOfDate": workspace["asOfDate"],
    "themes": themes
  }


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


app = Flask(__name__)


@app.get("/health")
def health() -> Any:
  return jsonify({"ok": True, "service": "akshare-data-bridge"})


@app.get("/snapshot/workspace")
def snapshot_workspace() -> Any:
  return jsonify(build_workspace_snapshot())


@app.get("/snapshot/market-leadership")
def snapshot_market_leadership() -> Any:
  workspace = build_workspace_snapshot()
  return jsonify(build_market_leadership_snapshot(workspace))


@app.get("/snapshot/themes")
def snapshot_themes() -> Any:
  workspace = build_workspace_snapshot()
  return jsonify(build_theme_snapshot(workspace))


@app.get("/snapshot/fundamentals")
def snapshot_fundamentals() -> Any:
  workspace = build_workspace_snapshot()
  return jsonify(build_fundamentals_snapshot(workspace))


if __name__ == "__main__":
  host = os.getenv("DATA_SERVICE_HOST", "127.0.0.1")
  port = int(os.getenv("DATA_SERVICE_PORT", "8000"))
  app.run(host=host, port=port, debug=False)
