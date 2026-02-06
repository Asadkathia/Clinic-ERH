import { Link, useSearchParams } from "react-router-dom";
import { Card } from "../components/ui/Card";

export function RequestSuccessPage() {
  const [params] = useSearchParams();
  const leadId = params.get("leadId");
  const whatsappMessage = encodeURIComponent(`Hi, I submitted a request. Lead ID: ${leadId ?? "N/A"}`);
  const whatsappUrl = `https://wa.me/923001234567?text=${whatsappMessage}`;

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <Card>
        <div className="stack">
          <h2>Request received</h2>
          <p className="muted">
            Your request is in our CRM queue. A receptionist will confirm timing and appointment details on WhatsApp.
          </p>
          <p>
            Lead ID: <strong>{leadId ?? "N/A"}</strong>
          </p>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Continue on WhatsApp
          </a>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>
            Staff login
          </Link>
        </div>
      </Card>
    </div>
  );
}

