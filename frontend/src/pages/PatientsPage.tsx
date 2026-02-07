import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api/services";

export function PatientsPage() {
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: api.listPatients });

  return (
    <Card className="page-shell">
      <div className="stack">
        <div className="page-header">
          <div className="stack" style={{ gap: 6 }}>
            <span className="soft-chip">CRM</span>
            <h3 className="page-title">Patients</h3>
            <p className="muted">Patient records created through request conversion and operations workflow.</p>
          </div>
        </div>
        {patientsQuery.isLoading ? <p className="muted">Loading patients...</p> : null}
        {patientsQuery.data?.patients.length === 0 ? <p className="muted">No patients yet.</p> : null}
        {patientsQuery.data?.patients.map((patient) => (
          <div key={patient.id} className="list-item" style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
            <strong>{patient.fullName}</strong>
            <p className="muted">{patient.phone}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
