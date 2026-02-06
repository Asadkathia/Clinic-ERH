type Props = {
  text: string;
};

export function Badge({ text }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
        background: "var(--primary-soft)",
        color: "var(--primary)",
      }}
    >
      {text}
    </span>
  );
}

