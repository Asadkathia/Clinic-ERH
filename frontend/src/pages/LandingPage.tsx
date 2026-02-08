import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api/services";
import { trackEvent } from "../lib/telemetry/events";

const MIN_SUBMIT_DELAY_MS = 1200;
const DEDUPE_WINDOW_MS = 60_000;
const LAST_SUBMISSION_KEY = "clinic_erh_last_lead_submission";

const SERVICE_CATALOG = [
  "General Consultation",
  "Specialist Consultation",
  "CBC / Blood Panel",
  "Ultrasound / Imaging",
  "Diabetes Profile",
  "Thyroid Function Test",
];

export function LandingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    serviceRequested: "",
    preferredDateTime: "",
    website: "",
  });
  const [formStartedAt] = useState(() => Date.now());
  const isStartedTrackedRef = useRef(false);
  const [antiSpamError, setAntiSpamError] = useState<string>("");

  const normalizedSubmissionKey = useMemo(() => {
    return `${form.fullName.trim().toLowerCase()}|${form.phone.trim()}|${form.serviceRequested.trim().toLowerCase()}`;
  }, [form.fullName, form.phone, form.serviceRequested]);

  const mutation = useMutation({
    mutationFn: api.createLeadRequest,
    onSuccess: ({ request }) => {
      trackEvent("form_submitted", { source: "landing_form", lead_id: request.id });
      localStorage.setItem(
        LAST_SUBMISSION_KEY,
        JSON.stringify({ key: normalizedSubmissionKey, at: Date.now() }),
      );
      navigate(`/request-success?leadId=${request.id}`);
    },
    onError: () => {
      trackEvent("form_failed", { source: "landing_form" });
    },
  });

  useEffect(() => {
    if (isStartedTrackedRef.current) return;
    if (form.fullName || form.phone || form.serviceRequested || form.preferredDateTime) {
      trackEvent("form_started", { source: "landing_form" });
      isStartedTrackedRef.current = true;
    }
  }, [form.fullName, form.phone, form.preferredDateTime, form.serviceRequested]);

  return (
    <main className="container page-shell" style={{ padding: "40px 0" }} aria-labelledby="landing-title">
      <div className="stack" style={{ gap: 24 }}>
        <span className="soft-chip">Patient Intake</span>
        <h1 id="landing-title" style={{ fontSize: 42, maxWidth: 700 }}>
          Book appointments and services with WhatsApp-first clinic support.
        </h1>
        <p className="muted">Complete this form and our staff will continue communication mostly on WhatsApp.</p>
      </div>

      <Card style={{ marginTop: 10 }}>
        <div className="stack" style={{ gap: 8 }}>
          <strong>Popular Services</strong>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SERVICE_CATALOG.map((service) => (
              <button
                key={service}
                type="button"
                className="ui-btn ui-btn--secondary"
                style={{ padding: "6px 10px", borderRadius: 999 }}
                onClick={() => setForm((current) => ({ ...current, serviceRequested: service }))}
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass" style={{ marginTop: 10 }}>
        <form
          className="stack"
          aria-describedby="landing-form-help"
          onSubmit={(event) => {
            event.preventDefault();
            setAntiSpamError("");

            if (form.website.trim()) {
              setAntiSpamError("Unable to submit request right now.");
              trackEvent("form_failed", { source: "landing_form", reason: "honeypot" });
              return;
            }

            if (Date.now() - formStartedAt < MIN_SUBMIT_DELAY_MS) {
              setAntiSpamError("Please review details and submit again.");
              trackEvent("form_failed", { source: "landing_form", reason: "min_delay" });
              return;
            }

            const rawLast = localStorage.getItem(LAST_SUBMISSION_KEY);
            if (rawLast) {
              try {
                const parsed = JSON.parse(rawLast) as { key?: string; at?: number };
                if (
                  parsed.key === normalizedSubmissionKey &&
                  typeof parsed.at === "number" &&
                  Date.now() - parsed.at < DEDUPE_WINDOW_MS
                ) {
                  setAntiSpamError("This request was just submitted. Please wait a minute before retrying.");
                  trackEvent("form_failed", { source: "landing_form", reason: "dedupe_window" });
                  return;
                }
              } catch {
                localStorage.removeItem(LAST_SUBMISSION_KEY);
              }
            }

            mutation.mutate({
              fullName: form.fullName,
              phone: form.phone,
              serviceRequested: form.serviceRequested,
              preferredDateTime: form.preferredDateTime || undefined,
            });
          }}
        >
          <p id="landing-form-help" className="muted">
            Please share accurate contact details so reception can confirm your slot quickly.
          </p>

          <label className="stack" style={{ gap: 8, position: "absolute", left: "-10000px" }}>
            Website (leave empty)
            <Input
              autoComplete="off"
              tabIndex={-1}
              aria-hidden
              value={form.website}
              onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
            />
          </label>

          <label className="stack" style={{ gap: 8 }}>
            Full Name
            <Input
              data-testid="landing-full-name"
              value={form.fullName}
              onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
              required
            />
          </label>
          <label className="stack" style={{ gap: 8 }}>
            Phone Number
            <Input
              data-testid="landing-phone"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              required
            />
          </label>
          <label className="stack" style={{ gap: 8 }}>
            Requested Service/Test
            <Input
              data-testid="landing-service"
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
            <Button type="submit" disabled={mutation.isPending} data-testid="landing-submit">
              {mutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
            {antiSpamError ? (
              <span style={{ color: "var(--danger)" }} role="status" aria-live="polite">
                {antiSpamError}
              </span>
            ) : null}
            {mutation.isError ? <span style={{ color: "var(--danger)" }}>{mutation.error.message}</span> : null}
          </div>
        </form>
      </Card>
    </main>
  );
}
