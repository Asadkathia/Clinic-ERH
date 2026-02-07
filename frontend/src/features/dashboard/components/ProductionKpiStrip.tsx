import { formatKpiValue, formatTrend } from "../mappers";
import type { ProductionKpiItem } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";

type ProductionKpiStripProps = {
  items: ProductionKpiItem[];
};

export function ProductionKpiStrip({ items }: ProductionKpiStripProps) {
  return (
    <DashboardSectionCard title="Production KPIs" actionLabel="View all">
      <div className="kpi-strip">
        {items.map((item) => (
          <article key={item.id} className="kpi-item">
            <p className="kpi-label">{item.label}</p>
            <p className="kpi-value">{formatKpiValue(item.value, item.unit)}</p>
            <p className={`kpi-trend kpi-trend--${item.trendDirection}`}>
              {formatTrend(item.trendPercent, item.trendDirection)}
            </p>
          </article>
        ))}
      </div>
    </DashboardSectionCard>
  );
}
