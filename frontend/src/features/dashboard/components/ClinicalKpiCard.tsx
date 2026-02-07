import { formatPercent } from "../mappers";
import type { ClinicalKpiStats } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

type ClinicalKpiCardProps = {
  stats: ClinicalKpiStats;
};

export function ClinicalKpiCard({ stats }: ClinicalKpiCardProps) {
  const complicationTone = stats.complicationRate > 1.5 ? "warn" : "ok";
  const onTimeData = [{ value: stats.onTimeRate }];
  const retreatmentData = [{ value: stats.retreatmentRate }];

  return (
    <DashboardSectionCard title="Clinical KPIs" meta={`Success Rate: ${formatPercent(stats.successRate)}`}>
      <div className="ring-grid">
        <div className="ring-widget">
          <div className="ring-rechart" aria-label={`On-time completion ${formatPercent(stats.onTimeRate)}`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="100%"
                barSize={14}
                data={onTimeData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={8} background fill="var(--dash-lime)" />
              </RadialBarChart>
            </ResponsiveContainer>
            <span>{formatPercent(stats.onTimeRate)}</span>
          </div>
          <p className="ring-label">On-time</p>
        </div>

        <div className="ring-widget">
          <div className="ring-rechart" aria-label={`Re-treatment rate ${formatPercent(stats.retreatmentRate)}`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="100%"
                barSize={14}
                data={retreatmentData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={8} background fill="#9ea8ba" />
              </RadialBarChart>
            </ResponsiveContainer>
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
