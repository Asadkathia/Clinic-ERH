import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./lib/guards/ProtectedRoute";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PatientsPage } from "./pages/PatientsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { RequestSuccessPage } from "./pages/RequestSuccessPage";
import { RequestsPage } from "./pages/RequestsPage";
import { WhatsappPage } from "./pages/WhatsappPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/request-success" element={<RequestSuccessPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/crm"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/crm/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="whatsapp" element={<WhatsappPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
