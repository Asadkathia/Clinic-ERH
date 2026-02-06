import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/auth-context";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const navItems = [
  { to: "/crm/dashboard", label: "Dashboard" },
  { to: "/crm/requests", label: "Requests" },
  { to: "/crm/patients", label: "Patients" },
  { to: "/crm/appointments", label: "Appointments" },
  { to: "/crm/invoices", label: "Invoices" },
  { to: "/crm/payments", label: "Payments" },
  { to: "/crm/whatsapp", label: "WhatsApp" },
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumb = location.pathname.split("/").filter(Boolean).slice(1).join(" / ") || "dashboard";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid var(--border)", padding: 20, background: "var(--surface)" }}>
        <Link to="/crm/dashboard" style={{ display: "inline-flex", marginBottom: 16 }}>
          <Badge text="Clinic ERH CRM" />
        </Link>
        <nav className="stack">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "10px 12px",
                borderRadius: 10,
                background: isActive ? "var(--primary-soft)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text)",
                fontWeight: 600,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main style={{ padding: 20 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="stack" style={{ gap: 4 }}>
            <h2 style={{ textTransform: "capitalize" }}>{breadcrumb}</h2>
            <p className="muted">Role: {user?.role}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              signOut();
              navigate("/login");
            }}
          >
            Sign out
          </Button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
