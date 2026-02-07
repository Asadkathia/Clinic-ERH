import { dashboardMockData } from "./mock-data";
import type { DashboardViewModel } from "./types";

export type LineCoordinate = {
  x: number;
  y: number;
  value: number;
};

export function buildDashboardViewModel(): DashboardViewModel {
  return dashboardMockData;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatKpiValue(value: number, unit?: string) {
  if (unit === "%") return `${value}%`;
  if (unit === "min") return `${value} min`;
  return formatCompactNumber(value);
}

export function formatTrend(percent: number, direction: "up" | "down" | "flat") {
  if (direction === "flat") return "0%";
  return `${direction === "up" ? "+" : "-"}${Math.abs(percent)}%`;
}

export function buildLineCoordinates(values: number[], width: number, height: number, padding = 16): LineCoordinate[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  return values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1 || 1);
    const y = height - padding - ((value - min) / spread) * (height - padding * 2);
    return { x, y, value };
  });
}

export function coordinatesToSvgPoints(points: LineCoordinate[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}
