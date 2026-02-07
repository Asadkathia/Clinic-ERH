import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/auth-context";
import "../../features/dashboard/dashboard.css";

type NavItem = {
  label: string;
  to?: string;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Clinic",
    items: [
      { to: "/crm/dashboard", label: "Dashboard" },
      { to: "/crm/patients", label: "Patients" },
      { to: "/crm/appointments", label: "Appointments" },
      { label: "Treatments", badge: "Soon" },
      { label: "Team & Roles", badge: "Soon" },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/crm/invoices", label: "Billing & Payments" },
      { to: "/crm/payments", label: "Payment Queue" },
      { label: "Reports & Analytics", badge: "Soon" },
    ],
  },
  {
    title: "Other",
    items: [
      { to: "/crm/requests", label: "Lead Requests" },
      { to: "/crm/whatsapp", label: "WhatsApp Desk" },
      { label: "Voice Assistant", badge: "Soon" },
    ],
  },
];

const routeLabelMap = new Map<string, string>([
  ["/crm/dashboard", "Dashboard"],
  ["/crm/requests", "Requests"],
  ["/crm/patients", "Patients"],
  ["/crm/appointments", "Appointments"],
  ["/crm/invoices", "Invoices"],
  ["/crm/payments", "Payments"],
  ["/crm/whatsapp", "WhatsApp"],
]);

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const currentLabel = routeLabelMap.get(location.pathname) ?? "Dashboard";

  return (
    <div className="crm-shell page-shell">
      <aside className="crm-sidebar">
        <Link to="/crm/dashboard" className="crm-brand" aria-label="Go to dashboard">
          <span className="crm-brand-mark" aria-hidden>
            🦷
          </span>
          <span>
            <strong>Clinic ERH CRM</strong>
            <span>Operations Console</span>
          </span>
        </Link>

        <nav className="crm-nav" aria-label="Primary">
          {navGroups.map((group) => (
            <section key={group.title} className="crm-nav-group">
              <p className="crm-nav-group-title">{group.title}</p>
              {group.items.map((item) =>
                item.to ? (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) => `crm-nav-link ${isActive ? "active" : ""}`.trim()}
                  >
                    <span>{item.label}</span>
                  </NavLink>
                ) : (
                  <span key={item.label} className="crm-nav-link crm-nav-link--static">
                    <span>{item.label}</span>
                    {item.badge ? <small>{item.badge}</small> : null}
                  </span>
                ),
              )}
            </section>
          ))}
        </nav>

        <div className="crm-sidebar-footer">
          <a href="#" className="crm-footer-link">
            Settings
          </a>
          <a href="#" className="crm-footer-link">
            Help
          </a>
        </div>
      </aside>

      <main className="crm-main">
        <header className="crm-topbar">
          <label className="crm-topbar-search">
            <input
              aria-label="Search anything"
              placeholder="Search for anything"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>

          <div className="crm-topbar-actions">
            <button type="button" className="crm-pill-btn">
              01 Apr 2025 - 01 Sep 2025
            </button>
            <button type="button" className="crm-pill-btn">
              Customize
            </button>
            <button type="button" className="crm-pill-btn crm-pill-btn--accent">
              Export
            </button>
            <span className="crm-profile" aria-label="Current profile">
              <span className="crm-avatar">AK</span>
              <span className="crm-profile-label">
                <strong>{user?.name ?? "CRM User"}</strong>
                <span>{user?.role}</span>
              </span>
            </span>
            <button
              type="button"
              className="crm-signout"
              onClick={() => {
                signOut();
                navigate("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="crm-page-meta">
          <h2>{currentLabel}</h2>
          <p>Role: {user?.role}</p>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
