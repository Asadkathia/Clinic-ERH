import { dashboardMockData } from "./mock-data";
import type { DashboardViewModel } from "./types";
import type { Appointment, Invoice, LeadRequest, Patient, Payment, WhatsappConversation } from "../../lib/api/contracts";

type DashboardApiData = {
  requests?: LeadRequest[];
  patients?: Patient[];
  appointments?: Appointment[];
  invoices?: Invoice[];
  payments?: Payment[];
  conversations?: WhatsappConversation[];
};

function monthKey(iso: string) {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function monthLabel(isoMonthKey: string) {
  const [year, month] = isoMonthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short" });
}

function trendDirection(current: number, previous: number): "up" | "down" | "flat" {
  if (current === previous) return "flat";
  return current > previous ? "up" : "down";
}

function trendPercent(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round((Math.abs(current - previous) / previous) * 100);
}

function recentEntries(data: DashboardApiData): DashboardViewModel["recentLog"] {
  const items = [
    ...(data.requests ?? []).map((row) => ({
      id: `req-${row.id}`,
      type: "Request" as const,
      text: `${row.fullName} submitted ${row.serviceRequested}`,
      at: row.createdAt,
    })),
    ...(data.appointments ?? []).map((row) => ({
      id: `apt-${row.id}`,
      type: "Appointment" as const,
      text: `${row.service} is ${row.status}`,
      at: row.scheduledAt ?? row.createdAt,
    })),
    ...(data.invoices ?? [])
      .filter((row) => row.sentAt)
      .map((row) => ({
        id: `inv-${row.id}`,
        type: "Invoice" as const,
        text: `${row.invoiceNumber} was sent on WhatsApp`,
        at: row.sentAt!,
      })),
    ...(data.payments ?? []).map((row) => ({
      id: `pay-${row.id}`,
      type: "Payment" as const,
      text: `${formatCurrency(row.amount)} payment marked ${row.status.toLowerCase()}`,
      at: row.verifiedAt ?? new Date().toISOString(),
    })),
    ...(data.conversations ?? []).map((row) => ({
      id: `wa-${row.id}`,
      type: "WhatsApp" as const,
      text: `${row.patientName}: ${row.lastMessage}`,
      at: row.lastMessageAt,
    })),
  ];

  if (items.length === 0) return dashboardMockData.recentLog;
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
}

function buildFinancialSeries(invoices: Invoice[] | undefined): DashboardViewModel["financialSeries"] {
  if (!invoices || invoices.length === 0) return dashboardMockData.financialSeries;

  const totalsByMonth = new Map<string, number>();
  for (const invoice of invoices) {
    const sourceDate = invoice.sentAt ?? new Date().toISOString();
    const key = monthKey(sourceDate);
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + invoice.total);
  }

  const sortedKeys = [...totalsByMonth.keys()].sort().slice(-6);
  const baseExpenses = dashboardMockData.financialSeries;

  return sortedKeys.map((key, index) => {
    const revenue = totalsByMonth.get(key) ?? 0;
    const expenseFallback = baseExpenses[index % baseExpenses.length]?.expenses ?? 0;
    return {
      month: monthLabel(key),
      revenue,
      expenses: Math.round(Math.max(revenue * 0.42, expenseFallback)),
    };
  });
}

function buildPatientTrend(patients: Patient[] | undefined, appointments: Appointment[] | undefined): DashboardViewModel["patientTrend"] {
  if (!patients || patients.length === 0) return dashboardMockData.patientTrend;

  const newByMonth = new Map<string, number>();
  for (const patient of patients) {
    const key = monthKey(patient.createdAt);
    newByMonth.set(key, (newByMonth.get(key) ?? 0) + 1);
  }

  const appointmentCountByPatient = new Map<string, number>();
  for (const appointment of appointments ?? []) {
    appointmentCountByPatient.set(appointment.patientId, (appointmentCountByPatient.get(appointment.patientId) ?? 0) + 1);
  }

  const returningByMonth = new Map<string, number>();
  for (const patient of patients) {
    if ((appointmentCountByPatient.get(patient.id) ?? 0) < 2) continue;
    const key = monthKey(patient.createdAt);
    returningByMonth.set(key, (returningByMonth.get(key) ?? 0) + 1);
  }

  const months = [...new Set([...newByMonth.keys(), ...returningByMonth.keys()])].sort().slice(-6);
  if (months.length === 0) return dashboardMockData.patientTrend;

  return months.map((key) => ({
    month: monthLabel(key),
    newPatients: newByMonth.get(key) ?? 0,
    returningPatients: returningByMonth.get(key) ?? 0,
  }));
}

export function buildDashboardViewModel(data?: DashboardApiData): DashboardViewModel {
  if (!data) return dashboardMockData;

  const requests = data.requests ?? [];
  const patients = data.patients ?? [];
  const appointments = data.appointments ?? [];
  const invoices = data.invoices ?? [];
  const payments = data.payments ?? [];
  const conversations = data.conversations ?? [];

  if (
    requests.length === 0 &&
    patients.length === 0 &&
    appointments.length === 0 &&
    invoices.length === 0 &&
    payments.length === 0 &&
    conversations.length === 0
  ) {
    return dashboardMockData;
  }

  const completedAppointments = appointments.filter((row) => row.status === "COMPLETED").length;
  const confirmedAppointments = appointments.filter((row) => row.status === "CONFIRMED").length;
  const verifiedPayments = payments.filter((row) => row.status === "VERIFIED");
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = verifiedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const previousMonthVolume = Math.max(1, appointments.length - completedAppointments);

  const totalAppointments = appointments.length || dashboardMockData.summaryKpis[0].value;
  const treatmentsDone = completedAppointments || dashboardMockData.summaryKpis[1].value;
  const avgChairTime = dashboardMockData.summaryKpis[2].value;
  const reappointmentRate = patients.length > 0 ? Math.round((confirmedAppointments / Math.max(1, patients.length)) * 100) : dashboardMockData.summaryKpis[3].value;
  const successRate = appointments.length > 0 ? (completedAppointments / Math.max(1, appointments.length)) * 100 : dashboardMockData.clinicalKpis.successRate;

  const summary = [
    {
      ...dashboardMockData.summaryKpis[0],
      value: totalAppointments,
      trendDirection: trendDirection(totalAppointments, previousMonthVolume),
      trendPercent: trendPercent(totalAppointments, previousMonthVolume),
    },
    {
      ...dashboardMockData.summaryKpis[1],
      value: treatmentsDone,
      trendDirection: trendDirection(treatmentsDone, Math.max(1, previousMonthVolume - 3)),
      trendPercent: trendPercent(treatmentsDone, Math.max(1, previousMonthVolume - 3)),
    },
    {
      ...dashboardMockData.summaryKpis[2],
      value: avgChairTime,
    },
    {
      ...dashboardMockData.summaryKpis[3],
      value: reappointmentRate,
      trendDirection: trendDirection(reappointmentRate, dashboardMockData.summaryKpis[3].value),
      trendPercent: trendPercent(reappointmentRate, dashboardMockData.summaryKpis[3].value),
    },
  ];

  return {
    ...dashboardMockData,
    greetingName: patients[0]?.fullName?.split(" ")[0] ?? dashboardMockData.greetingName,
    rangeLabel: dashboardMockData.rangeLabel,
    summaryKpis: summary,
    productionKpis: summary,
    clinicalKpis: {
      onTimeRate: Math.min(100, Math.max(0, successRate)),
      retreatmentRate: patients.length > 0 ? Math.max(0.6, (patients.length - completedAppointments) / patients.length * 10) : dashboardMockData.clinicalKpis.retreatmentRate,
      complicationRate: dashboardMockData.clinicalKpis.complicationRate,
      successRate: Math.min(99.5, Math.max(0, successRate)),
    },
    financialSeries: buildFinancialSeries(invoices),
    utilizationRows: dashboardMockData.utilizationRows.map((row, index) => {
      if (index === 0) {
        return {
          ...row,
          percent: Math.min(100, Math.round((confirmedAppointments / Math.max(1, appointments.length)) * 100)),
          usedHours: Math.round((appointments.length / 10) * 40),
          totalHours: row.totalHours,
        };
      }
      if (index === 5) {
        const noShowCount = appointments.filter((appointment) => appointment.status === "NO_SHOW").length;
        return {
          ...row,
          percent: appointments.length > 0 ? Number(((noShowCount / appointments.length) * 100).toFixed(1)) : row.percent,
          usedHours: noShowCount,
          totalHours: appointments.length || row.totalHours,
        };
      }
      return row;
    }),
    demographicSplit: dashboardMockData.demographicSplit,
    patientTrend: buildPatientTrend(patients, appointments),
    assistantPrompts: [
      `paid ${formatCurrency(totalPaid)}`,
      `invoiced ${formatCurrency(totalInvoiced)}`,
      ...dashboardMockData.assistantPrompts.slice(1),
    ],
    recentLog: recentEntries(data),
    defaultTodoItems: dashboardMockData.defaultTodoItems,
  };
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatKpiValue(value: number, unit?: string) {
  if (unit === "%") return `${value}%`;
  if (unit === "min") return `${value} min`;
  return formatCompactNumber(value);
}

export function formatTrend(percent: number, direction: "up" | "down" | "flat") {
  if (direction === "flat") return "0%";
  return `${direction === "up" ? "+" : "-"}${Math.abs(percent)}%`;
}
