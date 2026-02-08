import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api/services";
import type { WhatsappLinkContext } from "../features/whatsapp/types";

const QUICK_ACTIONS = [
  "Appointment reminder: your booking is tomorrow at 3:00 PM.",
  "Your invoice has been generated. Please review and share payment proof.",
  "Please share a clearer screenshot of your payment proof.",
  "A staff member will call you shortly.",
];

function normalizePhone(raw: string) {
  return raw.replace(/\D/g, "");
}

function findLinkContext(
  phone: string,
  patients: { id: string; fullName: string; phone: string }[],
  appointments: { id: string; patientId: string; createdAt: string; scheduledAt?: string | null }[],
  invoices: { id: string; patientId: string; sentAt?: string | null }[],
): WhatsappLinkContext {
  const normalized = normalizePhone(phone);
  const byExact = patients.filter((patient) => normalizePhone(patient.phone) === normalized);
  const byTail = patients.filter((patient) => normalizePhone(patient.phone).slice(-10) === normalized.slice(-10));
  const candidates = byExact.length > 0 ? byExact : byTail;

  if (candidates.length === 0) {
    return { linkState: "unlinked", candidates: [] };
  }

  if (candidates.length > 1) {
    return {
      linkState: "ambiguous",
      candidates: candidates.map((row) => ({ id: row.id, fullName: row.fullName, phone: row.phone })),
    };
  }

  const patient = candidates[0];
  const latestAppointment = appointments
    .filter((item) => item.patientId === patient.id)
    .sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt))[0];

  const latestInvoice = invoices
    .filter((item) => item.patientId === patient.id)
    .sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""))[0];

  return {
    linkState: "linked",
    patientId: patient.id,
    appointmentId: latestAppointment?.id,
    invoiceId: latestInvoice?.id,
    candidates: [{ id: patient.id, fullName: patient.fullName, phone: patient.phone }],
  };
}

export function WhatsappPage() {
  const queryClient = useQueryClient();
  const conversationsQuery = useQuery({
    queryKey: ["whatsapp-conversations"],
    queryFn: api.listWhatsappConversations,
  });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: api.listPatients });
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: api.listAppointments });
  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: api.listInvoices });
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

  const linkContext = useMemo(() => {
    if (!selectedConversation) return { linkState: "unlinked", candidates: [] } satisfies WhatsappLinkContext;
    return findLinkContext(
      selectedConversation.phone,
      patientsQuery.data?.patients ?? [],
      appointmentsQuery.data?.appointments ?? [],
      invoicesQuery.data?.invoices ?? [],
    );
  }, [
    appointmentsQuery.data?.appointments,
    invoicesQuery.data?.invoices,
    patientsQuery.data?.patients,
    selectedConversation,
  ]);

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
    <main className="page-shell" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 12 }} aria-label="WhatsApp desk">
      <Card>
        <div className="stack">
          <span className="soft-chip">Communication</span>
          <h3 className="page-title">WhatsApp Conversations</h3>
          {conversationsQuery.isError ? (
            <p className="muted" style={{ color: "var(--danger)" }} role="status" aria-live="polite">
              Conversations are temporarily unavailable. Please retry.
            </p>
          ) : null}
          {conversations.length === 0 ? <p className="muted">No conversations available.</p> : null}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className="list-item"
              aria-label={`Open conversation with ${conversation.patientName}`}
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

          <section
            style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 10, background: "var(--surface-muted)" }}
            aria-label="CRM linkage context"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <strong>Linked CRM Context</strong>
              <Badge
                text={
                  linkContext.linkState === "linked"
                    ? "LINKED"
                    : linkContext.linkState === "ambiguous"
                      ? "AMBIGUOUS"
                      : "UNLINKED"
                }
              />
            </div>
            {linkContext.linkState === "linked" ? (
              <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                <span className="muted">Patient: {linkContext.candidates[0]?.fullName}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Link to={`/crm/patients?patientId=${linkContext.patientId}`}>
                    <Button variant="secondary">Open Patient</Button>
                  </Link>
                  <Link to={`/crm/appointments?appointmentId=${linkContext.appointmentId ?? ""}`}>
                    <Button variant="secondary">Related Appointment</Button>
                  </Link>
                  <Link to={`/crm/invoices?invoiceId=${linkContext.invoiceId ?? ""}`}>
                    <Button variant="secondary">Related Invoice</Button>
                  </Link>
                </div>
              </div>
            ) : null}
            {linkContext.linkState === "ambiguous" ? (
              <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                <p className="muted">Multiple patients match this phone. Resolve manually before actioning billing/appointment context.</p>
                {linkContext.candidates.map((candidate) => (
                  <span key={candidate.id} className="muted">
                    {candidate.fullName} · {candidate.phone}
                  </span>
                ))}
              </div>
            ) : null}
            {linkContext.linkState === "unlinked" ? (
              <p className="muted" style={{ marginTop: 8 }}>
                No linked patient found for this phone. Continue conversation and convert via lead/request flow when confirmed.
              </p>
            ) : null}
          </section>

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
            aria-live="polite"
          >
            {messagesQuery.isError ? (
              <p className="muted" style={{ color: "var(--danger)" }}>
                Messages are unavailable for this conversation right now.
              </p>
            ) : null}
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
              data-testid="whatsapp-send"
              onClick={() => {
                if (!selectedConversation || !composer.trim()) return;
                sendMessage.mutate({ phone: selectedConversation.phone, text: composer.trim() });
              }}
              disabled={!selectedConversation || sendMessage.isPending}
            >
              Send
            </Button>
          </div>
          {sendMessage.isError ? (
            <p style={{ color: "var(--danger)" }} role="status" aria-live="polite">
              {sendMessage.error.message}
            </p>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
