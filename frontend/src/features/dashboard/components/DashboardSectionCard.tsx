import type { ReactNode } from "react";

type DashboardSectionCardProps = {
  title: string;
  meta?: string;
  actionLabel?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardSectionCard({ title, meta, actionLabel, children, className }: DashboardSectionCardProps) {
  return (
    <section className={`dash-card ${className ?? ""}`.trim()}>
      <header className="dash-card-header">
        <div>
          <h4 className="dash-card-title">{title}</h4>
          {meta ? <p className="dash-card-meta">{meta}</p> : null}
        </div>
        {actionLabel ? (
          <button type="button" className="dash-card-action">
            {actionLabel}
          </button>
        ) : null}
      </header>
      {children}
    </section>
  );
}
