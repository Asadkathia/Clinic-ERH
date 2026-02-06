import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

export function NotFoundPage() {
  return (
    <div className="container" style={{ padding: "60px 0", maxWidth: 580 }}>
      <Card>
        <div className="stack">
          <h2>Page not found</h2>
          <p className="muted">The route does not exist in this build.</p>
          <Link to="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Go to landing page
          </Link>
        </div>
      </Card>
    </div>
  );
}

