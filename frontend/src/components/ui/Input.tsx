import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
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

