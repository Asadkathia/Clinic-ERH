import { formatCurrency, formatPercent } from "../mappers";
import type { FinancialSeriesPoint } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type FinancialSnapshotCardProps = {
  points: FinancialSeriesPoint[];
};

export function FinancialSnapshotCard({ points }: FinancialSnapshotCardProps) {
  const revenueTotal = points.reduce((sum, point) => sum + point.revenue, 0);
  const expenseTotal = points.reduce((sum, point) => sum + point.expenses, 0);
  const profitMargin = revenueTotal === 0 ? 0 : ((revenueTotal - expenseTotal) / revenueTotal) * 100;

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

      <div className="financial-chart" aria-label="Revenue and expense trend chart">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={points} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barGap={8}>
            <CartesianGrid stroke="rgba(96,112,134,0.16)" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
            <YAxis hide domain={[0, "dataMax + 20000"]} />
            <Tooltip
              cursor={{ fill: "rgba(33,95,255,0.06)" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                boxShadow: "var(--elevation-sm)",
                background: "rgba(255,255,255,0.98)",
              }}
              formatter={(value) =>
                typeof value === "number" ? formatCurrency(value) : String(value ?? "")
              }
              labelFormatter={(label) => `Month: ${String(label)}`}
            />
            <Bar dataKey="revenue" fill="var(--dash-lime)" radius={[8, 8, 0, 0]} maxBarSize={18} />
            <Bar dataKey="expenses" fill="var(--dash-teal)" radius={[8, 8, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardSectionCard>
  );
}
