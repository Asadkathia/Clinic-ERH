import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { api } from "../lib/api/services";
import { useAuth } from "../lib/auth/auth-context";

const REJECTION_REASONS = [
  "Screenshot unreadable",
  "Reference mismatch",
  "Amount mismatch",
  "Wrong invoice payment proof",
];

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const paymentsQuery = useQuery({ queryKey: ["payments"], queryFn: api.listPayments });
  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: api.listInvoices });
  const [draft, setDraft] = useState({
    invoiceId: "",
    amount: "2500",
    method: "bank-transfer",
    reference: "",
    proofImageUrl: "",
  });
  const [previewPaymentId, setPreviewPaymentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const createPayment = useMutation({
    mutationFn: api.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
  const verifyPayment = useMutation({
    mutationFn: ({ id, status, rejection }: { id: string; status: "VERIFIED" | "REJECTED"; rejection?: string }) =>
      api.verifyPayment(id, {
        status,
        verifiedBy: user?.name ?? "Unknown",
        rejectionReason: rejection,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return (
    <div className="stack">
      <Card>
        <div className="stack">
          <h3>Record Payment Proof</h3>
          <p className="muted">Phase 0 placeholder for screenshot-backed payment entries.</p>
          <Select
            value={draft.invoiceId}
            onChange={(e) => {
              const selectedInvoice = invoicesQuery.data?.invoices.find((i) => i.id === e.target.value);
              if (!selectedInvoice) return;
              setDraft((s) => ({ ...s, invoiceId: selectedInvoice.id, amount: String(selectedInvoice.total) }));
            }}
          >
            <option value="">Select Invoice</option>
            {invoicesQuery.data?.invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} · PKR {invoice.total}
              </option>
            ))}
          </Select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Input value={draft.amount} onChange={(e) => setDraft((s) => ({ ...s, amount: e.target.value }))} />
            <Input value={draft.method} onChange={(e) => setDraft((s) => ({ ...s, method: e.target.value }))} />
            <Input value={draft.reference} onChange={(e) => setDraft((s) => ({ ...s, reference: e.target.value }))} />
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Payment proof screenshot
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setDraft((s) => ({ ...s, proofImageUrl: String(reader.result ?? "") }));
                };
                reader.readAsDataURL(file);
              }}
            />
            {draft.proofImageUrl ? (
              <img
                src={draft.proofImageUrl}
                alt="Payment proof preview"
                style={{ maxWidth: 320, maxHeight: 220, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }}
              />
            ) : (
              <p className="muted">Attach screenshot to enable preview in verification queue.</p>
            )}
          </div>
          <Button
            onClick={() => {
              if (!draft.invoiceId) return;
              createPayment.mutate({
                invoiceId: draft.invoiceId,
                amount: Number(draft.amount),
                method: draft.method,
                reference: draft.reference || null,
                proofImageUrl: draft.proofImageUrl || null,
              });
              setDraft((s) => ({ ...s, reference: "", proofImageUrl: "" }));
            }}
          >
            Record
          </Button>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h3>Payment Verification Queue</h3>
          {paymentsQuery.data?.payments.length === 0 ? <p className="muted">No payment proofs submitted yet.</p> : null}
          {paymentsQuery.data?.payments.map((payment) => (
            <div
              key={payment.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div className="stack" style={{ gap: 3 }}>
                  <strong>PKR {payment.amount}</strong>
                  <span className="muted">
                    {payment.method} · {payment.reference ?? "No reference"}
                  </span>
                  {payment.rejectionReason ? <span style={{ color: "var(--danger)" }}>Reason: {payment.rejectionReason}</span> : null}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge text={payment.status} />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPreviewPaymentId(previewPaymentId === payment.id ? null : payment.id);
                      setRejectionReason("");
                      setCustomReason("");
                    }}
                  >
                    {previewPaymentId === payment.id ? "Hide Proof" : "Preview Proof"}
                  </Button>
                  <Button variant="secondary" onClick={() => verifyPayment.mutate({ id: payment.id, status: "VERIFIED" })}>
                    Verify
                  </Button>
                </div>
              </div>
              {previewPaymentId === payment.id ? (
                <div className="stack" style={{ gap: 8 }}>
                  {payment.proofImageUrl ? (
                    <img
                      src={payment.proofImageUrl}
                      alt="Submitted payment proof"
                      style={{ maxWidth: 420, maxHeight: 280, objectFit: "contain", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                  ) : (
                    <p className="muted">No proof image was attached for this record.</p>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: 8 }}>
                    <Select value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)}>
                      <option value="">Select rejection reason</option>
                      {REJECTION_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                      <option value="OTHER">Other</option>
                    </Select>
                    <Input
                      placeholder="Custom reason (optional)"
                      value={customReason}
                      onChange={(event) => setCustomReason(event.target.value)}
                      disabled={rejectionReason !== "OTHER"}
                    />
                    <Button
                      variant="danger"
                      onClick={() => {
                        const reasonToSend = rejectionReason === "OTHER" ? customReason.trim() : rejectionReason;
                        if (!reasonToSend) return;
                        verifyPayment.mutate({ id: payment.id, status: "REJECTED", rejection: reasonToSend });
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ) : null}
              {verifyPayment.isError ? (
                <p style={{ color: "var(--danger)" }}>{verifyPayment.error.message}</p>
              ) : null}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(120px, 1fr))", gap: 8 }}>
                <p className="muted">Invoice: {payment.invoiceId}</p>
                <p className="muted">Verifier: {payment.verifiedBy ?? "Pending"}</p>
                <p className="muted">Verified At: {payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleString() : "Pending"}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
