import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api/services";

const QUICK_ACTIONS = [
  "Appointment reminder: your booking is tomorrow at 3:00 PM.",
  "Your invoice has been generated. Please review and share payment proof.",
  "Please share a clearer screenshot of your payment proof.",
  "A staff member will call you shortly.",
];

export function WhatsappPage() {
  const queryClient = useQueryClient();
  const conversationsQuery = useQuery({
    queryKey: ["whatsapp-conversations"],
    queryFn: api.listWhatsappConversations,
  });
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [composer, setComposer] = useState("");

  const conversations = useMemo(
    () => conversationsQuery.data?.conversations ?? [],
    [conversationsQuery.data?.conversations],
  );
  const activePhone = selectedPhone || conversations[0]?.phone || "";
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.phone === activePhone),
    [conversations, activePhone],
  );

  const messagesQuery = useQuery({
    queryKey: ["whatsapp-messages", activePhone],
    queryFn: () => api.listWhatsappMessages(activePhone),
    enabled: Boolean(activePhone),
  });

  const sendMessage = useMutation({
    mutationFn: api.sendWhatsappMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages", activePhone] });
      setComposer("");
    },
  });

  return (
    <div className="page-shell" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 12 }}>
      <Card>
        <div className="stack">
          <span className="soft-chip">Communication</span>
          <h3 className="page-title">WhatsApp Conversations</h3>
          {conversations.length === 0 ? <p className="muted">No conversations available.</p> : null}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className="list-item"
              style={{
                border: conversation.phone === selectedConversation?.phone ? "1px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: 10,
                background: conversation.phone === selectedConversation?.phone ? "var(--primary-soft)" : "var(--surface)",
                textAlign: "left",
                cursor: "pointer",
                padding: 10,
              }}
              onClick={() => setSelectedPhone(conversation.phone)}
            >
              <div className="stack" style={{ gap: 4 }}>
                <strong>{conversation.patientName}</strong>
                <span className="muted">{conversation.phone}</span>
                <p className="muted">{conversation.lastMessage}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="muted">{new Date(conversation.lastMessageAt).toLocaleString()}</span>
                  {conversation.unreadCount > 0 ? <Badge text={`Unread: ${conversation.unreadCount}`} /> : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h3 className="page-title">Conversation Timeline</h3>
          <p className="muted">
            {selectedConversation ? `${selectedConversation.patientName} · ${selectedConversation.phone}` : "Select a conversation"}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUICK_ACTIONS.map((action) => (
              <Button key={action} variant="secondary" onClick={() => setComposer(action)}>
                Use Template
              </Button>
            ))}
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 10,
              minHeight: 320,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              overflowY: "auto",
            }}
          >
            {messagesQuery.data?.messages.length ? null : <p className="muted">No messages yet.</p>}
            {messagesQuery.data?.messages.map((message) => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.direction === "OUTBOUND" ? "flex-end" : "flex-start",
                  background: message.direction === "OUTBOUND" ? "var(--primary-soft)" : "var(--surface-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  maxWidth: "78%",
                }}
              >
                <p>{message.text}</p>
                <p className="muted" style={{ marginTop: 4, fontSize: 12 }}>
                  {message.direction} · {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <Input
              placeholder="Type WhatsApp message..."
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
            />
            <Button
              onClick={() => {
                if (!selectedConversation || !composer.trim()) return;
                sendMessage.mutate({ phone: selectedConversation.phone, text: composer.trim() });
              }}
              disabled={!selectedConversation || sendMessage.isPending}
            >
              Send
            </Button>
          </div>
          {sendMessage.isError ? <p style={{ color: "var(--danger)" }}>{sendMessage.error.message}</p> : null}
        </div>
      </Card>
    </div>
  );
}
