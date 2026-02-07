type Props = {
  text: string;
  className?: string;
};

export function Badge({ text, className }: Props) {
  return (
    <span
      className={`ui-badge ${className ?? ""}`.trim()}
      style={{
      }}
    >
      {text}
    </span>
  );
}
