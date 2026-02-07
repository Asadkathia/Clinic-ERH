import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

export function NotFoundPage() {
  return (
    <div className="container page-shell" style={{ padding: "80px 0", maxWidth: 620 }}>
      <Card className="glass" style={{ padding: 24 }}>
        <div className="stack">
          <span className="soft-chip">404</span>
          <h2 className="page-title">Page not found</h2>
          <p className="muted">The route does not exist in this build.</p>
          <Link to="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Go to login
          </Link>
        </div>
      </Card>
    </div>
  );
}
