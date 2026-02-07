type AssistantInsightCardProps = {
  prompts: string[];
  agentName: string;
};

export function AssistantInsightCard({ prompts, agentName }: AssistantInsightCardProps) {
  return (
    <section className="dash-card assistant-card">
      <div className="assistant-orb" aria-hidden />
      <div className="assistant-chip-wrap">
        {prompts.map((prompt) => (
          <span key={prompt}>{prompt}</span>
        ))}
      </div>
      <div className="assistant-footer">
        <p>Hi, {agentName}</p>
        <strong>How can I help you today?</strong>
      </div>
    </section>
  );
}
