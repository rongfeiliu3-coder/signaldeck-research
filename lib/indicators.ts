import { PricePoint } from "@/lib/types";

export function movingAverage(values: number[], period: number) {
  return values.map((_, index) => {
    if (index < period - 1) return null;
    const slice = values.slice(index - period + 1, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / period;
  });
}

export function relativeStrengthIndex(values: number[], period = 14) {
  return values.map((_, index) => {
    if (index < period) return null;
    let gains = 0;
    let losses = 0;

    for (let cursor = index - period + 1; cursor <= index; cursor += 1) {
      const change = values[cursor] - values[cursor - 1];
      if (change >= 0) gains += change;
      else losses += Math.abs(change);
    }

    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - 100 / (1 + rs);
  });
}

export function rollingHigh(points: PricePoint[], lookback: number) {
  return points.map((_, index) => {
    if (index < lookback) return null;
    const slice = points.slice(index - lookback, index);
    return Math.max(...slice.map((point) => point.close));
  });
}
