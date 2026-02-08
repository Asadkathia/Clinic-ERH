import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { api } from "../lib/api/services";

type AuditEntity = "REQUEST" | "APPOINTMENT" | "INVOICE" | "PAYMENT" | "WHATSAPP";
type AuditLevel = "info" | "success" | "warning";

type AuditEvent = {
  id: string;
  timestamp: string;
  entity: AuditEntity;
  action: string;
  actor: string;
  summary: string;
  level: AuditLevel;
};

function levelTone(level: AuditLevel) {
  if (level === "success") return "var(--primary)";
  if (level === "warning") return "var(--warning)";
  return "var(--text-muted)";
}

export function AuditTrailPage() {
  const [entityFilter, setEntityFilter] = useState<AuditEntity | "ALL">("ALL");
  const [levelFilter, setLevelFilter] = useState<AuditLevel | "ALL">("ALL");

  const [requestsQuery, appointmentsQuery, invoicesQuery, paymentsQuery, whatsappQuery] = useQueries({
    queries: [
      { queryKey: ["requests"], queryFn: api.listLeadRequests },
      { queryKey: ["appointments"], queryFn: api.listAppointments },
      { queryKey: ["invoices"], queryFn: api.listInvoices },
      { queryKey: ["payments"], queryFn: api.listPayments },
      { queryKey: ["whatsapp-conversations"], queryFn: api.listWhatsappConversations },
    ],
  });

  const auditEvents = useMemo(() => {
    const events: AuditEvent[] = [];

    for (const request of requestsQuery.data?.requests ?? []) {
      events.push({
        id: `req-${request.id}`,
        timestamp: request.createdAt,
        entity: "REQUEST",
        action: "Request Submitted",
        actor: request.source,
        summary: `${request.fullName} requested ${request.serviceRequested}`,
        level: "info",
      });
    }

    for (const appointment of appointmentsQuery.data?.appointments ?? []) {
      events.push({
        id: `apt-created-${appointment.id}`,
        timestamp: appointment.createdAt,
        entity: "APPOINTMENT",
        action: "Appointment Created",
        actor: "STAFF",
        summary: `${appointment.service} (${appointment.status})`,
        level: appointment.status === "CANCELLED" || appointment.status === "NO_SHOW" ? "warning" : "success",
      });
    }

    for (const invoice of invoicesQuery.data?.invoices ?? []) {
      if (!invoice.sentAt) continue;
      events.push({
        id: `inv-sent-${invoice.id}`,
        timestamp: invoice.sentAt,
        entity: "INVOICE",
        action: "Invoice Sent",
        actor: "STAFF",
        summary: `${invoice.invoiceNumber} sent on WhatsApp`,
        level: "success",
      });
    }

    for (const payment of paymentsQuery.data?.payments ?? []) {
      if (!payment.verifiedAt) continue;
      const isRejected = payment.status === "REJECTED";
      events.push({
        id: `pay-${payment.id}`,
        timestamp: payment.verifiedAt,
        entity: "PAYMENT",
        action: isRejected ? "Payment Rejected" : "Payment Verified",
        actor: payment.verifiedBy ?? "STAFF",
        summary: `Invoice ${payment.invoiceId} · PKR ${payment.amount}`,
        level: isRejected ? "warning" : "success",
      });
    }

    for (const conversation of whatsappQuery.data?.conversations ?? []) {
      events.push({
        id: `wa-${conversation.id}`,
        timestamp: conversation.lastMessageAt,
        entity: "WHATSAPP",
        action: "Conversation Updated",
        actor: conversation.patientName,
        summary: `${conversation.phone} · ${conversation.lastMessage}`,
        level: conversation.unreadCount > 0 ? "warning" : "info",
      });
    }

    return events
      .filter((event) => (entityFilter === "ALL" ? true : event.entity === entityFilter))
      .filter((event) => (levelFilter === "ALL" ? true : event.level === levelFilter))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [
    appointmentsQuery.data?.appointments,
    entityFilter,
    invoicesQuery.data?.invoices,
    levelFilter,
    paymentsQuery.data?.payments,
    requestsQuery.data?.requests,
    whatsappQuery.data?.conversations,
  ]);

  const hasError = [requestsQuery, appointmentsQuery, invoicesQuery, paymentsQuery, whatsappQuery].some((query) => query.isError);

  return (
    <main className="stack page-shell" aria-label="Immutable audit trail">
      <Card>
        <div className="stack">
          <span className="soft-chip">Governance</span>
          <h3 className="page-title">Immutable Audit Trail</h3>
          <p className="muted">Read-only event feed for intake, scheduling, billing, payments, and WhatsApp activity.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Select
              aria-label="Filter audit feed by entity"
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value as AuditEntity | "ALL")}
            >
              <option value="ALL">All Entities</option>
              <option value="REQUEST">Requests</option>
              <option value="APPOINTMENT">Appointments</option>
              <option value="INVOICE">Invoices</option>
              <option value="PAYMENT">Payments</option>
              <option value="WHATSAPP">WhatsApp</option>
            </Select>
            <Select
              aria-label="Filter audit feed by severity"
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value as AuditLevel | "ALL")}
            >
              <option value="ALL">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Event Feed</strong>
            <Badge text={`${auditEvents.length} events`} />
          </div>
          {hasError ? (
            <p style={{ color: "var(--danger)" }} role="status" aria-live="polite">
              Audit feed is partially unavailable. Retry to refresh events.
            </p>
          ) : null}
          {auditEvents.length === 0 ? <p className="muted">No events match the selected filters.</p> : null}
          {auditEvents.map((event) => (
            <div
              key={event.id}
              data-testid="audit-event-row"
              className="list-item"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong>{event.action}</strong>
                  <Badge text={event.entity} />
                </div>
                <span className="muted">{new Date(event.timestamp).toLocaleString()}</span>
              </div>
              <p>{event.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="muted">Actor: {event.actor}</span>
                <span style={{ color: levelTone(event.level), fontWeight: 600, textTransform: "uppercase", fontSize: 12 }}>{event.level}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
