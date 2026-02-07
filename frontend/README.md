# Clinic ERH Frontend

Frontend application for the clinic CRM using React, TypeScript, and Vite.

## Run
- `npm run dev` starts local development server.
- `npm run build` runs TypeScript build and production bundling.
- `npm run lint` runs ESLint checks.

## Dashboard UI Replication (Mock-First)
Dashboard and shell were rebuilt to match the target reference layout and interaction model.

### Component map
- `src/components/layout/AppShell.tsx`
  - Replicated sidebar sections (`Clinic`, `Finance`, `Other`)
  - Top utility row (search, date range, customize/export, profile, sign out)
- `src/pages/DashboardPage.tsx`
  - Composes replicated dashboard modules and responsive layout
- `src/features/dashboard/components/DashboardSectionCard.tsx`
  - Reusable card shell with consistent title/meta/action pattern
- `src/features/dashboard/components/ProductionKpiStrip.tsx`
- `src/features/dashboard/components/ClinicalKpiCard.tsx`
- `src/features/dashboard/components/FinancialSnapshotCard.tsx`
- `src/features/dashboard/components/UtilizationMetricsCard.tsx`
- `src/features/dashboard/components/ClientsDistributionCard.tsx`
- `src/features/dashboard/components/PatientsOverviewCard.tsx`
- `src/features/dashboard/components/AssistantInsightCard.tsx`
- `src/features/dashboard/components/OperationsWorkbenchCard.tsx`

### Data contracts (mock phase)
- `src/features/dashboard/types.ts`
  - `DashboardSummaryKpi`
  - `ProductionKpiItem`
  - `ClinicalKpiStats`
  - `FinancialSeriesPoint`
  - `UtilizationMetricRow`
  - `PatientTrendPoint`
  - `DemographicSplit`
  - `DashboardViewModel`
- `src/features/dashboard/mock-data.ts`
  - Mock dashboard dataset used as source of truth in this phase
- `src/features/dashboard/mappers.ts`
  - Formatting and chart-coordinate mapping helpers

### Token groups
- Global token source: `src/index.css`
  - Semantic color tokens
  - Radius, spacing, elevation scales
  - Motion timing tokens
  - UI primitive styles (`ui-btn`, `ui-input`, `ui-card`, `ui-badge`)
- Dashboard/shell presentation layer: `src/features/dashboard/dashboard.css`
  - `crm-*` classes for shell
  - `dash-*` classes for dashboard cards and layout
  - responsive breakpoints: desktop, tablet, mobile

### Chart implementation note
- `recharts` is now installed and wired for dashboard charts.
- Active Recharts modules:
  - `FinancialSnapshotCard`: `BarChart`
  - `PatientsOverviewCard`: `LineChart`
  - `ClinicalKpiCard`: `RadialBarChart`
- Charts are lazy-loaded via `React.lazy` and `Suspense` in `src/pages/DashboardPage.tsx`.
- Build split strategy keeps chart library in a separate `recharts` chunk via `vite.config.ts`.
- Data contracts remain unchanged (`DashboardViewModel`), so backend wiring can proceed without UI contract churn.
