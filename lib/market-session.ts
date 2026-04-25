export function getChinaDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function getMarketSessionLabel(asOfDate: string) {
  return asOfDate === getChinaDateString() ? "今日" : "最近交易日";
}
