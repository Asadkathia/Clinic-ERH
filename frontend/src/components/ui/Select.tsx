import type { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "#fff",
        padding: "10px 12px",
        fontSize: 14,
      }}
    />
  );
}

