import { lazy, Suspense } from "react";
import { buildDashboardViewModel, formatKpiValue, formatTrend } from "../features/dashboard/mappers";
import { AssistantInsightCard } from "../features/dashboard/components/AssistantInsightCard";
import { ClientsDistributionCard } from "../features/dashboard/components/ClientsDistributionCard";
import { OperationsWorkbenchCard } from "../features/dashboard/components/OperationsWorkbenchCard";
import { ProductionKpiStrip } from "../features/dashboard/components/ProductionKpiStrip";
import { UtilizationMetricsCard } from "../features/dashboard/components/UtilizationMetricsCard";
import "../features/dashboard/dashboard.css";

const ClinicalKpiCard = lazy(() =>
  import("../features/dashboard/components/ClinicalKpiCard").then((module) => ({ default: module.ClinicalKpiCard })),
);
const FinancialSnapshotCard = lazy(() =>
  import("../features/dashboard/components/FinancialSnapshotCard").then((module) => ({ default: module.FinancialSnapshotCard })),
);
const PatientsOverviewCard = lazy(() =>
  import("../features/dashboard/components/PatientsOverviewCard").then((module) => ({ default: module.PatientsOverviewCard })),
);

function ChartFallback({ title }: { title: string }) {
  return (
    <section className="dash-card">
      <div className="dash-card-header">
        <div>
          <h4 className="dash-card-title">{title}</h4>
          <p className="dash-card-meta">Loading chart...</p>
        </div>
      </div>
      <div className="dash-chart-fallback" aria-hidden />
    </section>
  );
}

export function DashboardPage() {
  const viewModel = buildDashboardViewModel();

  return (
    <div className="dash-page page-shell">
      <header className="dash-hero">
        <div>
          <p className="dash-hero-chip">Dashboard</p>
          <h1 className="dash-hero-title">Good Morning, {viewModel.greetingName}!</h1>
          <p className="dash-hero-subtitle">Clinic performance, operations, and financial health at a glance.</p>
        </div>
        <div className="dash-hero-actions">
          <button type="button" className="dash-pill-control">
            {viewModel.rangeLabel}
          </button>
          <button type="button" className="dash-pill-control dash-pill-control--ghost">
            Customize
          </button>
          <button type="button" className="dash-pill-control dash-pill-control--accent">
            Export
          </button>
        </div>
      </header>

      <section className="dash-summary-grid">
        {viewModel.summaryKpis.map((kpi) => (
          <article key={kpi.id} className="dash-summary-card">
            <p>{kpi.label}</p>
            <strong>{formatKpiValue(kpi.value, kpi.unit)}</strong>
            <span className={`kpi-trend kpi-trend--${kpi.trendDirection}`}>{formatTrend(kpi.trendPercent, kpi.trendDirection)}</span>
          </article>
        ))}
      </section>

      <div className="dash-layout">
        <section className="dash-main-column">
          <ProductionKpiStrip items={viewModel.productionKpis} />
          <div className="dash-two-col">
            <Suspense fallback={<ChartFallback title="Clinical KPIs" />}>
              <ClinicalKpiCard stats={viewModel.clinicalKpis} />
            </Suspense>
            <Suspense fallback={<ChartFallback title="Financial Snapshot" />}>
              <FinancialSnapshotCard points={viewModel.financialSeries} />
            </Suspense>
          </div>
          <div className="dash-two-col">
            <ClientsDistributionCard segments={viewModel.demographicSplit} />
            <Suspense fallback={<ChartFallback title="Patients Overview" />}>
              <PatientsOverviewCard points={viewModel.patientTrend} />
            </Suspense>
          </div>
          <OperationsWorkbenchCard recentLog={viewModel.recentLog} defaultTodoItems={viewModel.defaultTodoItems} />
        </section>

        <aside className="dash-side-column">
          <UtilizationMetricsCard rows={viewModel.utilizationRows} />
          <AssistantInsightCard prompts={viewModel.assistantPrompts} agentName={viewModel.greetingName} />
        </aside>
      </div>
    </div>
  );
}
