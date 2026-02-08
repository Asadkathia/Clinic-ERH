import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api/services";
import type { PaymentGateState } from "../features/invoices/types";

type AddonMode = "APPEND" | "SUPPLEMENTAL";
type DraftFields = { description: string; qty: string; unitPrice: string };

const DEFAULT_ITEM_DRAFT: DraftFields = {
  description: "Consultation",
  qty: "1",
  unitPrice: "2500",
};

function getPaymentGateState(total: number, verifiedPaid: number): PaymentGateState {
  const outstandingAmount = Math.max(total - verifiedPaid, 0);
  if (outstandingAmount <= 0) {
    return {
      canProceed: true,
      reason: "Payment verified. Patient can proceed to test.",
      outstandingAmount,
      requiredStatus: "VERIFIED",
    };
  }

  return {
    canProceed: false,
    reason: "Payment is not fully verified. Verify payment before proceeding to test.",
    outstandingAmount,
    requiredStatus: "VERIFIED",
  };
}

export function InvoicesPage() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: api.listAppointments });
  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: api.listInvoices });
  const paymentsQuery = useQuery({ queryKey: ["payments"], queryFn: api.listPayments });
  const [itemDraft, setItemDraft] = useState<DraftFields>(DEFAULT_ITEM_DRAFT);
  const [addonModeByInvoice, setAddonModeByInvoice] = useState<Record<string, AddonMode>>({});
  const [proceedStatusByInvoice, setProceedStatusByInvoice] = useState<Record<string, string>>({});

  const createInvoice = useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
  const addItem = useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: DraftFields }) =>
      api.addInvoiceItem(id, {
        description: draft.description,
        qty: Number(draft.qty),
        unitPrice: Number(draft.unitPrice),
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

  const invoices = invoicesQuery.data?.invoices ?? [];
  const verifiedPaymentsByInvoiceId = useMemo(() => {
    const map = new Map<string, number>();
    for (const payment of paymentsQuery.data?.payments ?? []) {
      if (payment.status !== "VERIFIED") continue;
      map.set(payment.invoiceId, (map.get(payment.invoiceId) ?? 0) + payment.amount);
    }
    return map;
  }, [paymentsQuery.data?.payments]);

  const invoiceItemsQueries = useQueries({
    queries: invoices.map((invoice) => ({
      queryKey: ["invoice-items", invoice.id],
      queryFn: () => api.listInvoiceItems(invoice.id),
    })),
  });

  const invoiceItemsMap = new Map(
    invoices.map((invoice, index) => [invoice.id, invoiceItemsQueries[index]?.data?.items ?? []]),
  );

  async function addAddonToInvoice(invoiceId: string, appointmentId: string, patientId: string, draft: DraftFields) {
    const mode = addonModeByInvoice[invoiceId] ?? "APPEND";
    if (mode === "APPEND") {
      await addItem.mutateAsync({ id: invoiceId, draft });
      return;
    }

    const { invoice: supplemental } = await createInvoice.mutateAsync({ appointmentId, patientId });
    await addItem.mutateAsync({ id: supplemental.id, draft });
    setProceedStatusByInvoice((current) => ({
      ...current,
      [invoiceId]: `Supplemental invoice ${supplemental.invoiceNumber} created for add-on test.`,
    }));
  }

  return (
    <main className="stack page-shell" aria-label="Invoice and billing workspace">
      <Card>
        <div className="stack">
          <span className="soft-chip">Billing</span>
          <h3 className="page-title">Create Invoice</h3>
          <p className="muted">Creates invoice from first available appointment (Phase 0 placeholder flow).</p>
          <Button
            data-testid="create-invoice-button"
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
          {invoices.length === 0 ? <p className="muted">No invoices yet.</p> : null}
          {invoices.map((invoice) => {
            const verifiedPaid = verifiedPaymentsByInvoiceId.get(invoice.id) ?? 0;
            const gateState = getPaymentGateState(invoice.total, verifiedPaid);
            const addonMode = addonModeByInvoice[invoice.id] ?? "APPEND";

            return (
              <section key={invoice.id} className="list-item" style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <strong>{invoice.invoiceNumber}</strong>
                  <Badge text={invoice.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 8 }}>
                  <p className="muted">Subtotal: PKR {invoice.subtotal}</p>
                  <p className="muted">Discount: PKR {invoice.discount}</p>
                  <p className="muted">Paid: PKR {verifiedPaid}</p>
                  <p className="muted">Outstanding: PKR {gateState.outstandingAmount}</p>
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
                    <Button variant="secondary" onClick={() => addItem.mutate({ id: invoice.id, draft: itemDraft })}>
                      Add Item
                    </Button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                    <Button
                      variant={addonMode === "APPEND" ? "primary" : "secondary"}
                      onClick={() => setAddonModeByInvoice((current) => ({ ...current, [invoice.id]: "APPEND" }))}
                    >
                      Append Existing
                    </Button>
                    <Button
                      variant={addonMode === "SUPPLEMENTAL" ? "primary" : "secondary"}
                      onClick={() => setAddonModeByInvoice((current) => ({ ...current, [invoice.id]: "SUPPLEMENTAL" }))}
                    >
                      Supplemental Invoice
                    </Button>
                    <Button
                      data-testid={`addon-submit-${invoice.id}`}
                      onClick={() => addAddonToInvoice(invoice.id, invoice.appointmentId, invoice.patientId, itemDraft)}
                    >
                      Add-On Test Billing
                    </Button>
                  </div>
                  <Button onClick={() => sendWhatsapp.mutate(invoice.id)} disabled={sendWhatsapp.isPending}>
                    Send on WhatsApp
                  </Button>
                </div>

                <div style={{ marginTop: 10, borderTop: "1px dashed var(--border)", paddingTop: 10 }} aria-live="polite">
                  <strong style={{ fontSize: 14 }}>Payment Gate</strong>
                  <p className="muted">{gateState.reason}</p>
                  <p className="muted">Required status: {gateState.requiredStatus}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      data-testid={`proceed-to-test-${invoice.id}`}
                      disabled={!gateState.canProceed}
                      onClick={() =>
                        setProceedStatusByInvoice((current) => ({
                          ...current,
                          [invoice.id]: gateState.canProceed
                            ? "Payment verified. Patient can proceed to test."
                            : "Proceed blocked until payment is verified.",
                        }))
                      }
                    >
                      Proceed To Test
                    </Button>
                    <Link to="/crm/payments">
                      <Button variant="secondary">Open Payment Queue</Button>
                    </Link>
                  </div>
                  {proceedStatusByInvoice[invoice.id] ? (
                    <p
                      style={{ color: gateState.canProceed ? "var(--primary)" : "var(--danger)", marginTop: 6 }}
                      role="status"
                    >
                      {proceedStatusByInvoice[invoice.id]}
                    </p>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </Card>
    </main>
  );
}
