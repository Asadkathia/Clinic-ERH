import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api/services";

export function LandingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    serviceRequested: "",
    preferredDateTime: "",
  });

  const mutation = useMutation({
    mutationFn: api.createLeadRequest,
    onSuccess: ({ request }) => {
      navigate(`/request-success?leadId=${request.id}`);
    },
  });

  return (
    <div className="container page-shell" style={{ padding: "40px 0" }}>
      <div className="stack" style={{ gap: 24 }}>
        <span className="soft-chip">Patient Intake</span>
        <h1 style={{ fontSize: 42, maxWidth: 700 }}>Book appointments and services with WhatsApp-first clinic support.</h1>
        <p className="muted">Complete this form and our staff will continue communication mostly on WhatsApp.</p>
      </div>

      <Card className="glass" style={{ marginTop: 10 }}>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({
              fullName: form.fullName,
              phone: form.phone,
              serviceRequested: form.serviceRequested,
              preferredDateTime: form.preferredDateTime || undefined,
            });
          }}
        >
          <label className="stack" style={{ gap: 8 }}>
            Full Name
            <Input value={form.fullName} onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))} required />
          </label>
          <label className="stack" style={{ gap: 8 }}>
            Phone Number
            <Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} required />
          </label>
          <label className="stack" style={{ gap: 8 }}>
            Requested Service/Test
            <Input
              value={form.serviceRequested}
              onChange={(e) => setForm((s) => ({ ...s, serviceRequested: e.target.value }))}
              required
            />
          </label>
          <label className="stack" style={{ gap: 8 }}>
            Preferred Date/Time (Optional)
            <Input
              type="datetime-local"
              value={form.preferredDateTime}
              onChange={(e) => setForm((s) => ({ ...s, preferredDateTime: e.target.value }))}
            />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
            {mutation.isError ? <span style={{ color: "var(--danger)" }}>{mutation.error.message}</span> : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
