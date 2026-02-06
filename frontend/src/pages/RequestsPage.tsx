import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import type { RequestSource, RequestStatus } from "../lib/api/contracts";
import { api } from "../lib/api/services";

export function RequestsPage() {
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({ queryKey: ["requests"], queryFn: api.listLeadRequests });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | RequestStatus>("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | RequestSource>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.convertLeadRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const filteredRequests = useMemo(
    () => {
      const requests = requestsQuery.data?.requests ?? [];
      return requests.filter((item) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          item.fullName.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.serviceRequested.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        const matchesSource = sourceFilter === "ALL" || item.source === sourceFilter;
        return matchesSearch && matchesStatus && matchesSource;
      });
    },
    [requestsQuery.data?.requests, search, statusFilter, sourceFilter],
  );

  const selectedRequest = filteredRequests.find((request) => request.id === selectedId) ?? filteredRequests[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12 }}>
      <Card>
        <div className="stack">
          <h3>Lead Requests</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name / phone / service" />
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | RequestStatus)}>
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="CLOSED_LOST">CLOSED_LOST</option>
            </Select>
            <Select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as "ALL" | RequestSource)}>
              <option value="ALL">All Sources</option>
              <option value="LANDING_FORM">LANDING_FORM</option>
              <option value="WHATSAPP">WHATSAPP</option>
              <option value="CALL">CALL</option>
              <option value="WALKIN">WALKIN</option>
            </Select>
          </div>

          {requestsQuery.isLoading ? <p className="muted">Loading requests...</p> : null}
          {!requestsQuery.isLoading && filteredRequests.length === 0 ? <p className="muted">No requests match current filters.</p> : null}
          {filteredRequests.map((item) => (
            <button
              key={item.id}
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "1fr auto",
                border: item.id === selectedRequest?.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                textAlign: "left",
                background: item.id === selectedRequest?.id ? "var(--primary-soft)" : "var(--surface)",
                cursor: "pointer",
              }}
              onClick={() => setSelectedId(item.id)}
            >
              <div className="stack" style={{ gap: 4 }}>
                <strong>
                  {item.fullName} · {item.phone}
                </strong>
                <span className="muted">{item.serviceRequested}</span>
                <p className="muted">Source: {item.source}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Badge text={item.status} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h3>Request Detail</h3>
          {!selectedRequest ? (
            <p className="muted">Select a request to view details.</p>
          ) : (
            <>
              <div className="stack" style={{ gap: 4 }}>
                <strong>{selectedRequest.fullName}</strong>
                <p className="muted">{selectedRequest.phone}</p>
                <p className="muted">Service: {selectedRequest.serviceRequested}</p>
                <p className="muted">
                  Preferred: {selectedRequest.preferredDateTime ? new Date(selectedRequest.preferredDateTime).toLocaleString() : "Not provided"}
                </p>
                <p className="muted">Source: {selectedRequest.source}</p>
                <p className="muted">Created: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="secondary"
                  disabled={selectedRequest.status === "CONVERTED" || convertMutation.isPending}
                  onClick={() => convertMutation.mutate(selectedRequest.id)}
                >
                  Convert to Patient + Appointment
                </Button>
              </div>
              {convertMutation.isError ? <p style={{ color: "var(--danger)" }}>{convertMutation.error.message}</p> : null}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
