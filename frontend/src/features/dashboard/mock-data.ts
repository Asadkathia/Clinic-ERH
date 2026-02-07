import type { DashboardViewModel } from "./types";

const now = new Date();

function hoursAgo(hours: number) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

export const dashboardMockData: DashboardViewModel = {
  greetingName: "Alyona",
  rangeLabel: "01 Apr 2025 - 01 Sep 2025",
  summaryKpis: [
    {
      id: "total-appointments",
      label: "Total Appointments",
      value: 1423,
      trendPercent: 12,
      trendDirection: "up",
    },
    {
      id: "treatments-done",
      label: "Treatments Done",
      value: 1280,
      trendPercent: 13,
      trendDirection: "up",
    },
    {
      id: "avg-chair-time",
      label: "Average Chair Time",
      value: 42,
      unit: "min",
      trendPercent: 2,
      trendDirection: "down",
    },
    {
      id: "reappointment-rate",
      label: "Reappointment Rate",
      value: 42,
      unit: "%",
      trendPercent: 3,
      trendDirection: "up",
    },
  ],
  productionKpis: [
    {
      id: "production-total",
      label: "Total Appointments",
      value: 1423,
      trendPercent: 12,
      trendDirection: "up",
    },
    {
      id: "production-treatments",
      label: "Treatments Done",
      value: 1280,
      trendPercent: 13,
      trendDirection: "up",
    },
    {
      id: "production-time",
      label: "Average Chair Time",
      value: 42,
      unit: "min",
      trendPercent: 2,
      trendDirection: "down",
    },
    {
      id: "production-reappointment",
      label: "Reappointment Rate",
      value: 42,
      unit: "%",
      trendPercent: 3,
      trendDirection: "up",
    },
  ],
  clinicalKpis: {
    onTimeRate: 92.4,
    retreatmentRate: 2.9,
    complicationRate: 1.7,
    successRate: 96.2,
  },
  financialSeries: [
    { month: "Apr", revenue: 112000, expenses: 84000 },
    { month: "May", revenue: 98000, expenses: 62000 },
    { month: "Jun", revenue: 124000, expenses: 91000 },
    { month: "Jul", revenue: 118000, expenses: 77000 },
    { month: "Aug", revenue: 136000, expenses: 104000 },
    { month: "Sep", revenue: 121000, expenses: 69000 },
  ],
  utilizationRows: [
    { id: "doctor", label: "Doctor", percent: 84, usedHours: 672, totalHours: 800, tone: "lime" },
    { id: "assistant", label: "Assistant", percent: 67, usedHours: 268, totalHours: 400, tone: "teal" },
    { id: "chair", label: "Chair", percent: 78, usedHours: 312, totalHours: 400, tone: "slate" },
    { id: "equipment", label: "Equipment", percent: 79, usedHours: 142, totalHours: 180, tone: "blue" },
    { id: "idle", label: "Idle Time", percent: 22, usedHours: 88, totalHours: 400, tone: "amber" },
    { id: "no-show", label: "No-show", percent: 6.8, usedHours: 95, totalHours: 1390, tone: "slate" },
  ],
  demographicSplit: [
    { id: "female", label: "Female", value: 55, color: "var(--dash-neutral-bubble)" },
    { id: "male", label: "Male", value: 35, color: "var(--dash-teal-strong)" },
    { id: "children", label: "Children", value: 10, color: "var(--dash-lime)" },
  ],
  patientTrend: [
    { month: "Apr", newPatients: 222, returningPatients: 92 },
    { month: "May", newPatients: 258, returningPatients: 110 },
    { month: "Jun", newPatients: 301, returningPatients: 124 },
    { month: "Jul", newPatients: 401, returningPatients: 102 },
    { month: "Aug", newPatients: 272, returningPatients: 144 },
    { month: "Sep", newPatients: 338, returningPatients: 132 },
  ],
  assistantPrompts: ["gross margin", "forecast cash", "revenue vs expenses"],
  recentLog: [
    { id: "log-1", type: "Appointment", text: "Consultation for Hassan Raza marked as CONFIRMED.", at: hoursAgo(1.2) },
    { id: "log-2", type: "Invoice", text: "Invoice INV-2087 sent on WhatsApp to Sana Ali.", at: hoursAgo(2.4) },
    { id: "log-3", type: "Payment", text: "Payment proof received for INV-2082 and queued for review.", at: hoursAgo(3.1) },
    { id: "log-4", type: "WhatsApp", text: "Patient asked to reschedule CBC test to tomorrow morning.", at: hoursAgo(4.6) },
    { id: "log-5", type: "Request", text: "New landing request submitted for pediatric consultation.", at: hoursAgo(6.3) },
  ],
  defaultTodoItems: [
    "Confirm tomorrow's fasting lab appointments.",
    "Follow up pending screenshot verification (2 items).",
    "Send reminder templates for afternoon consultations.",
  ],
};
