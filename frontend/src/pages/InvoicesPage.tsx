import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api/services";

export function InvoicesPage() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: api.listAppointments });
  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: api.listInvoices });
  const paymentsQuery = useQuery({ queryKey: ["payments"], queryFn: api.listPayments });
  const [itemDraft, setItemDraft] = useState({ description: "Consultation", qty: "1", unitPrice: "2500" });

  const createInvoice = useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
  const addItem = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.addInvoiceItem(id, {
        description: itemDraft.description,
        qty: Number(itemDraft.qty),
        unitPrice: Number(itemDraft.unitPrice),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-items", variables.id] });
    },
  });
  const sendWhatsapp = useMutation({
    mutationFn: api.sendInvoiceWhatsapp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const invoiceItemsQueries = useQueries({
    queries: (invoicesQuery.data?.invoices ?? []).map((invoice) => ({
      queryKey: ["invoice-items", invoice.id],
      queryFn: () => api.listInvoiceItems(invoice.id),
    })),
  });

  const invoiceItemsMap = new Map(
    (invoicesQuery.data?.invoices ?? []).map((invoice, index) => [invoice.id, invoiceItemsQueries[index]?.data?.items ?? []]),
  );

  return (
    <div className="stack page-shell">
      <Card>
        <div className="stack">
          <span className="soft-chip">Billing</span>
          <h3 className="page-title">Create Invoice</h3>
          <p className="muted">Creates invoice from first available appointment (Phase 0 placeholder flow).</p>
          <Button
            onClick={() => {
              const appointment = appointmentsQuery.data?.appointments[0];
              if (!appointment) return;
              createInvoice.mutate({ patientId: appointment.patientId, appointmentId: appointment.id });
            }}
            disabled={createInvoice.isPending}
          >
            Create From Latest Appointment
          </Button>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h3 className="page-title">Invoices</h3>
          {invoicesQuery.data?.invoices.length === 0 ? <p className="muted">No invoices yet.</p> : null}
          {invoicesQuery.data?.invoices.map((invoice) => (
            <div key={invoice.id} className="list-item" style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>{invoice.invoiceNumber}</strong>
                <Badge text={invoice.status} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 8 }}>
                <p className="muted">Subtotal: PKR {invoice.subtotal}</p>
                <p className="muted">Discount: PKR {invoice.discount}</p>
                <p className="muted">
                  Paid: PKR{" "}
                  {(paymentsQuery.data?.payments ?? [])
                    .filter((payment) => payment.invoiceId === invoice.id && payment.status === "VERIFIED")
                    .reduce((sum, payment) => sum + payment.amount, 0)}
                </p>
                <p className="muted">
                  Outstanding: PKR{" "}
                  {invoice.total -
                    (paymentsQuery.data?.payments ?? [])
                      .filter((payment) => payment.invoiceId === invoice.id && payment.status === "VERIFIED")
                      .reduce((sum, payment) => sum + payment.amount, 0)}
                </p>
              </div>
              <p className="muted">Total: PKR {invoice.total}</p>
              <div className="stack" style={{ gap: 6 }}>
                <strong style={{ fontSize: 14 }}>Line Item History</strong>
                {(invoiceItemsMap.get(invoice.id) ?? []).length === 0 ? (
                  <p className="muted">No line items added yet.</p>
                ) : (
                  (invoiceItemsMap.get(invoice.id) ?? []).map((lineItem) => (
                    <div
                      key={lineItem.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "6px 8px",
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <span>{lineItem.description}</span>
                      <span className="muted">Qty: {lineItem.qty}</span>
                      <span className="muted">Rate: PKR {lineItem.unitPrice}</span>
                      <strong>PKR {lineItem.lineTotal}</strong>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8 }}>
                  <Input
                    value={itemDraft.description}
                    onChange={(e) => setItemDraft((s) => ({ ...s, description: e.target.value }))}
                    placeholder="Description"
                  />
                  <Input value={itemDraft.qty} onChange={(e) => setItemDraft((s) => ({ ...s, qty: e.target.value }))} />
                  <Input
                    value={itemDraft.unitPrice}
                    onChange={(e) => setItemDraft((s) => ({ ...s, unitPrice: e.target.value }))}
                  />
                  <Button variant="secondary" onClick={() => addItem.mutate({ id: invoice.id })}>
                    Add Item
                  </Button>
                </div>
                <Button onClick={() => sendWhatsapp.mutate(invoice.id)} disabled={sendWhatsapp.isPending}>
                  Send on WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
