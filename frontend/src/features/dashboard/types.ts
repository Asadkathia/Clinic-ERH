export type TrendDirection = "up" | "down" | "flat";

export type DashboardSummaryKpi = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  trendPercent: number;
  trendDirection: TrendDirection;
};

export type ProductionKpiItem = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  trendPercent: number;
  trendDirection: TrendDirection;
};

export type ClinicalKpiStats = {
  onTimeRate: number;
  retreatmentRate: number;
  complicationRate: number;
  successRate: number;
};

export type FinancialSeriesPoint = {
  month: string;
  revenue: number;
  expenses: number;
};

export type UtilizationMetricRow = {
  id: string;
  label: string;
  percent: number;
  usedHours: number;
  totalHours: number;
  tone: "teal" | "lime" | "blue" | "amber" | "slate";
};

export type PatientTrendPoint = {
  month: string;
  newPatients: number;
  returningPatients: number;
};

export type DemographicSplit = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type RecentLogEntry = {
  id: string;
  type: "Appointment" | "Invoice" | "Payment" | "WhatsApp" | "Request";
  text: string;
  at: string;
};

export type DashboardViewModel = {
  greetingName: string;
  rangeLabel: string;
  summaryKpis: DashboardSummaryKpi[];
  productionKpis: ProductionKpiItem[];
  clinicalKpis: ClinicalKpiStats;
  financialSeries: FinancialSeriesPoint[];
  utilizationRows: UtilizationMetricRow[];
  demographicSplit: DemographicSplit[];
  patientTrend: PatientTrendPoint[];
  assistantPrompts: string[];
  recentLog: RecentLogEntry[];
  defaultTodoItems: string[];
};
