export function formatCurrency(value: number, currency = "CNY", locale = "zh-CN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 2
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatRatioPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

export function formatScore(value: number) {
  return `${value.toFixed(1)}/100`;
}

export function formatNumber(value: number, digits = 1) {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  });
}

export function formatLargeNumber(value: number) {
  if (Math.abs(value) >= 100000000) {
    return `${formatNumber(value / 100000000, 1)}亿`;
  }

  if (Math.abs(value) >= 10000) {
    return `${formatNumber(value / 10000, 1)}万`;
  }

  return formatNumber(value, 0);
}

export function formatDateLabel(date: string, locale = "zh-CN") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}
