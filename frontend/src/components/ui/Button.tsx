import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ variant = "primary", style, ...props }: Props) {
  const className = `ui-btn ui-btn--${variant} ${props.className ?? ""}`.trim();
  return (
    <button
      {...props}
      className={className}
      style={{
        ...style,
      }}
    />
  );
}
