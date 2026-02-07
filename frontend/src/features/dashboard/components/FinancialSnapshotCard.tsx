import { formatCurrency, formatPercent } from "../mappers";
import type { FinancialSeriesPoint } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";

type FinancialSnapshotCardProps = {
  points: FinancialSeriesPoint[];
};

export function FinancialSnapshotCard({ points }: FinancialSnapshotCardProps) {
  const revenueTotal = points.reduce((sum, point) => sum + point.revenue, 0);
  const expenseTotal = points.reduce((sum, point) => sum + point.expenses, 0);
  const profitMargin = revenueTotal === 0 ? 0 : ((revenueTotal - expenseTotal) / revenueTotal) * 100;
  const peakValue = Math.max(...points.map((point) => Math.max(point.revenue, point.expenses)), 1);

  return (
    <DashboardSectionCard
      title="Financial Snapshot"
      meta={`Profit Margin: ${formatPercent(profitMargin)}`}
      className="financial-card"
    >
      <div className="financial-stats">
        <div>
          <p className="financial-label">Revenue</p>
          <strong>{formatCurrency(revenueTotal)}</strong>
        </div>
        <div>
          <p className="financial-label">Expenses</p>
          <strong>{formatCurrency(expenseTotal)}</strong>
        </div>
      </div>

      <div className="financial-bars" aria-label="Revenue and expense trend chart">
        {points.map((point) => (
          <div key={point.month} className="financial-bar-group">
            <div
              className="financial-bar financial-bar--revenue"
              style={{ height: `${(point.revenue / peakValue) * 120}px` }}
              title={`Revenue ${point.month}: ${formatCurrency(point.revenue)}`}
            />
            <div
              className="financial-bar financial-bar--expense"
              style={{ height: `${(point.expenses / peakValue) * 120}px` }}
              title={`Expenses ${point.month}: ${formatCurrency(point.expenses)}`}
            />
            <span>{point.month}</span>
          </div>
        ))}
      </div>
    </DashboardSectionCard>
  );
}
