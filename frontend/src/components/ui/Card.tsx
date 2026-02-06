import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: 16,
      }}
    >
      {children}
    </section>
  );
}

