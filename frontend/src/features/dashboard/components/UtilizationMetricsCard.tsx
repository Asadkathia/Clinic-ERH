import { formatPercent } from "../mappers";
import type { UtilizationMetricRow } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";

type UtilizationMetricsCardProps = {
  rows: UtilizationMetricRow[];
};

export function UtilizationMetricsCard({ rows }: UtilizationMetricsCardProps) {
  return (
    <DashboardSectionCard title="Utilization Metrics" actionLabel="View all" className="utilization-card">
      <div className="utilization-list">
        {rows.map((row) => (
          <article key={row.id} className="util-row">
            <div className="util-row-header">
              <span>{row.label}</span>
              <span>
                <strong>{formatPercent(row.percent, row.percent % 1 === 0 ? 0 : 1)}</strong> ({row.usedHours} hrs / {row.totalHours} hrs)
              </span>
            </div>
            <div className="util-progress">
              <div
                className={`util-progress-bar util-progress-bar--${row.tone}`}
                style={{ width: `${Math.min(100, Math.max(0, row.percent))}%` }}
                aria-label={`${row.label} utilization ${row.percent}%`}
              />
            </div>
          </article>
        ))}
      </div>
    </DashboardSectionCard>
  );
}
