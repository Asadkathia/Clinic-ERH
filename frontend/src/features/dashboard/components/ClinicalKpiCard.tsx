import type { CSSProperties } from "react";
import { formatPercent } from "../mappers";
import type { ClinicalKpiStats } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";

type ClinicalKpiCardProps = {
  stats: ClinicalKpiStats;
};

export function ClinicalKpiCard({ stats }: ClinicalKpiCardProps) {
  const complicationTone = stats.complicationRate > 1.5 ? "warn" : "ok";
  return (
    <DashboardSectionCard title="Clinical KPIs" meta={`Success Rate: ${formatPercent(stats.successRate)}`}>
      <div className="ring-grid">
        <div className="ring-widget">
          <div
            className="ring-visual ring-visual--primary"
            style={{ "--ring-progress": `${stats.onTimeRate}%` } as CSSProperties}
            aria-label={`On-time completion ${formatPercent(stats.onTimeRate)}`}
          >
            <span>{formatPercent(stats.onTimeRate)}</span>
          </div>
          <p className="ring-label">On-time</p>
        </div>

        <div className="ring-widget">
          <div
            className="ring-visual ring-visual--neutral"
            style={{ "--ring-progress": `${stats.retreatmentRate}%` } as CSSProperties}
            aria-label={`Re-treatment rate ${formatPercent(stats.retreatmentRate)}`}
          >
            <span>{formatPercent(stats.retreatmentRate)}</span>
          </div>
          <p className="ring-label">Re-treatment</p>
        </div>
      </div>

      <p className={`clinical-alert clinical-alert--${complicationTone}`}>
        Post-treatment complications reached {formatPercent(stats.complicationRate)} this month.
      </p>
    </DashboardSectionCard>
  );
}
