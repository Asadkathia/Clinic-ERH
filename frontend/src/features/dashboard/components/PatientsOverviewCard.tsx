import { buildLineCoordinates, coordinatesToSvgPoints, formatCompactNumber } from "../mappers";
import type { PatientTrendPoint } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";

type PatientsOverviewCardProps = {
  points: PatientTrendPoint[];
};

const chartWidth = 520;
const chartHeight = 190;

export function PatientsOverviewCard({ points }: PatientsOverviewCardProps) {
  const newSeries = points.map((point) => point.newPatients);
  const returningSeries = points.map((point) => point.returningPatients);
  const newCoords = buildLineCoordinates(newSeries, chartWidth, chartHeight);
  const returningCoords = buildLineCoordinates(returningSeries, chartWidth, chartHeight);
  const highlightIndex = Math.min(3, points.length - 1);
  const highlightPoint = newCoords[highlightIndex];
  const highlightLabel = points[highlightIndex];

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
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="patients-chart" role="img" aria-label="New and returning patient trend">
          <polyline className="patients-gridline" points={`18,24 ${chartWidth - 18},24`} />
          <polyline className="patients-gridline" points={`18,92 ${chartWidth - 18},92`} />
          <polyline className="patients-gridline" points={`18,160 ${chartWidth - 18},160`} />

          <polyline className="patients-line patients-line--new" points={coordinatesToSvgPoints(newCoords)} />
          <polyline className="patients-line patients-line--returning" points={coordinatesToSvgPoints(returningCoords)} />

          {highlightPoint ? <circle className="patients-point" cx={highlightPoint.x} cy={highlightPoint.y} r={4} /> : null}
        </svg>

        {highlightPoint && highlightLabel ? (
          <div className="patients-tooltip" style={{ left: `${(highlightPoint.x / chartWidth) * 100}%`, top: `${(highlightPoint.y / chartHeight) * 100}%` }}>
            <strong>{highlightLabel.month}</strong>
            <span>New: {highlightLabel.newPatients}</span>
            <span>Returning: {highlightLabel.returningPatients}</span>
          </div>
        ) : null}
      </div>

      <div className="patients-months">
        {points.map((point) => (
          <span key={point.month}>{point.month}</span>
        ))}
      </div>
    </DashboardSectionCard>
  );
}
