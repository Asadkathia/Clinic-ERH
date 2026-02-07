import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  interactive = true,
  className,
  style,
}: {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={`ui-card ${interactive ? "interactive" : ""} ${className ?? ""}`.trim()}
      style={{
        padding: 16,
        ...style,
      }}
    >
      {children}
    </section>
  );
}
