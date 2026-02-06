import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api/services";

export function DashboardPage() {
  const requests = useQuery({ queryKey: ["requests"], queryFn: api.listLeadRequests });
  const appointments = useQuery({ queryKey: ["appointments"], queryFn: api.listAppointments });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: api.listInvoices });
  const payments = useQuery({ queryKey: ["payments"], queryFn: api.listPayments });

  const stats = [
    { label: "New Requests", value: requests.data?.requests.filter((r) => r.status === "NEW").length ?? 0 },
    { label: "Appointments", value: appointments.data?.appointments.length ?? 0 },
    { label: "Invoices", value: invoices.data?.invoices.length ?? 0 },
    { label: "Payments", value: payments.data?.payments.length ?? 0 },
  ];

  return (
    <div className="stack">
      <h3>Operations Snapshot</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {stats.map((item) => (
          <Card key={item.label}>
            <div className="stack" style={{ gap: 4 }}>
              <span className="muted">{item.label}</span>
              <strong style={{ fontSize: 28 }}>{item.value}</strong>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

