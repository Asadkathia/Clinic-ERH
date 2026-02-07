import type { CSSProperties } from "react";
import type { DemographicSplit } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";

type ClientsDistributionCardProps = {
  segments: DemographicSplit[];
};

const bubbleAnchors = [
  { left: "8%", top: "16%" },
  { left: "48%", top: "12%" },
  { left: "36%", top: "54%" },
];

export function ClientsDistributionCard({ segments }: ClientsDistributionCardProps) {
  return (
    <DashboardSectionCard title="Clients" meta="Satisfaction Score: 4.6">
      <div className="clients-bubbles" aria-label="Client demographic distribution">
        {segments.map((segment, index) => {
          const anchor = bubbleAnchors[index] ?? { left: "15%", top: "18%" };
          const size = 92 + segment.value * 1.4;
          return (
            <div
              key={segment.id}
              className="client-bubble"
              style={
                {
                  left: anchor.left,
                  top: anchor.top,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: segment.color,
                  "--bubble-size": `${size}px`,
                } as CSSProperties
              }
            >
              <strong>{segment.value}%</strong>
            </div>
          );
        })}
      </div>
      <div className="clients-legend">
        {segments.map((segment) => (
          <span key={segment.id}>
            <i style={{ background: segment.color }} /> {segment.label}
          </span>
        ))}
      </div>
    </DashboardSectionCard>
  );
}
