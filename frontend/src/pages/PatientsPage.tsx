import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api/services";

export function PatientsPage() {
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: api.listPatients });

  return (
    <Card>
      <div className="stack">
        <h3>Patients</h3>
        {patientsQuery.isLoading ? <p className="muted">Loading patients...</p> : null}
        {patientsQuery.data?.patients.length === 0 ? <p className="muted">No patients yet.</p> : null}
        {patientsQuery.data?.patients.map((patient) => (
          <div key={patient.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
            <strong>{patient.fullName}</strong>
            <p className="muted">{patient.phone}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

