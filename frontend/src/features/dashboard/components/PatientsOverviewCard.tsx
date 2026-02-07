import { formatCompactNumber } from "../mappers";
import type { PatientTrendPoint } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PatientsOverviewCardProps = {
  points: PatientTrendPoint[];
};

export function PatientsOverviewCard({ points }: PatientsOverviewCardProps) {
  const newSeries = points.map((point) => point.newPatients);
  const returningSeries = points.map((point) => point.returningPatients);

  return (
    <DashboardSectionCard title="Patients Overview" actionLabel="View all">
      <div className="patient-overview-meta">
        <div>
          <span className="legend-dot legend-dot--lime" />
          New <strong>{formatCompactNumber(newSeries.reduce((sum, item) => sum + item, 0))}</strong>
        </div>
        <div>
          <span className="legend-dot legend-dot--teal" />
          Returning <strong>{formatCompactNumber(returningSeries.reduce((sum, item) => sum + item, 0))}</strong>
        </div>
      </div>

      <div className="patients-chart-wrap">
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={points} margin={{ top: 8, right: 6, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgba(96,112,134,0.16)" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
            <YAxis hide domain={[0, "dataMax + 80"]} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                boxShadow: "var(--elevation-sm)",
                background: "rgba(11,89,98,0.96)",
                color: "#fff",
              }}
              labelStyle={{ color: "#fff", fontWeight: 700 }}
            />
            <Line
              type="monotone"
              dataKey="newPatients"
              stroke="var(--dash-lime)"
              strokeWidth={2.5}
              dot={{ r: 0 }}
              activeDot={{ r: 4, stroke: "#1a2f4f", strokeWidth: 2, fill: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="returningPatients"
              stroke="var(--dash-teal)"
              strokeWidth={2.5}
              dot={{ r: 0 }}
              activeDot={{ r: 4, stroke: "#1a2f4f", strokeWidth: 2, fill: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardSectionCard>
  );
}
