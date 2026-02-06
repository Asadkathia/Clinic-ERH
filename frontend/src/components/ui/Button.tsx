import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ variant = "primary", style, ...props }: Props) {
  const background = {
    primary: "var(--primary)",
    secondary: "var(--surface-muted)",
    danger: "var(--danger)",
  }[variant];
  const color = variant === "secondary" ? "var(--text)" : "#fff";
  return (
    <button
      {...props}
      style={{
        border: "1px solid transparent",
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
        background,
        color,
        fontWeight: 600,
        ...style,
      }}
    />
  );
}

