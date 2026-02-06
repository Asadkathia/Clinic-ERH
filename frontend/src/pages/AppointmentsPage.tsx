import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Appointment, AppointmentStatus } from "../lib/api/contracts";
import { api } from "../lib/api/services";

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: api.listAppointments });
  const [view, setView] = useState<"LIST" | "BOARD" | "CALENDAR">("LIST");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const updateMutation = useMutation({
    mutationFn: ({ id, status, scheduledAt }: { id: string; status: AppointmentStatus; scheduledAt?: string | null }) =>
      api.updateAppointment(id, { status, scheduledAt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const appointments = useMemo(() => appointmentsQuery.data?.appointments ?? [], [appointmentsQuery.data?.appointments]);

  const boardColumns = useMemo(
    () =>
      [
        { label: "Requested", statuses: ["REQUESTED"] as AppointmentStatus[] },
        { label: "Pending Confirmation", statuses: ["PENDING_CONFIRMATION"] as AppointmentStatus[] },
        { label: "Confirmed", statuses: ["CONFIRMED"] as AppointmentStatus[] },
        { label: "Completed", statuses: ["COMPLETED"] as AppointmentStatus[] },
        { label: "Cancelled/No Show", statuses: ["CANCELLED", "NO_SHOW"] as AppointmentStatus[] },
      ].map((column) => ({
        ...column,
        items: appointments.filter((item) => column.statuses.includes(item.status)),
      })),
    [appointments],
  );

  const dailyAppointments = useMemo(
    () =>
      appointments.filter((item) => {
        if (!item.scheduledAt) return false;
        return item.scheduledAt.slice(0, 10) === selectedDate;
      }),
    [appointments, selectedDate],
  );

  return (
    <div className="stack">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div className="stack" style={{ gap: 4 }}>
            <h3>Appointments</h3>
            <p className="muted">Switch between list, board, and daily calendar operations.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant={view === "LIST" ? "primary" : "secondary"} onClick={() => setView("LIST")}>
              List
            </Button>
            <Button variant={view === "BOARD" ? "primary" : "secondary"} onClick={() => setView("BOARD")}>
              Board
            </Button>
            <Button variant={view === "CALENDAR" ? "primary" : "secondary"} onClick={() => setView("CALENDAR")}>
              Calendar
            </Button>
          </div>
        </div>
      </Card>

      {appointmentsQuery.isLoading ? <p className="muted">Loading appointments...</p> : null}
      {!appointmentsQuery.isLoading && appointments.length === 0 ? <p className="muted">No appointments yet.</p> : null}

      {view === "LIST" ? (
        <Card>
          <div className="stack">
            {appointments.map((item) => (
              <AppointmentRow
                key={item.id}
                appointment={item}
                onAction={(payload) => updateMutation.mutate(payload)}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {view === "BOARD" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(180px, 1fr))", gap: 12 }}>
          {boardColumns.map((column) => (
            <Card key={column.label}>
              <div className="stack" style={{ gap: 8 }}>
                <strong>
                  {column.label} ({column.items.length})
                </strong>
                {column.items.length === 0 ? <p className="muted">No items.</p> : null}
                {column.items.map((item) => (
                  <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 10 }}>
                    <div className="stack" style={{ gap: 4 }}>
                      <strong style={{ fontSize: 13 }}>{item.service}</strong>
                      <p className="muted" style={{ fontSize: 12 }}>
                        {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "No time set"}
                      </p>
                      <Badge text={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {view === "CALENDAR" ? (
        <Card>
          <div className="stack">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <strong>Daily Schedule</strong>
              <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} style={{ maxWidth: 220 }} />
            </div>
            {dailyAppointments.length === 0 ? <p className="muted">No scheduled appointments for this date.</p> : null}
            {dailyAppointments
              .slice()
              .sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""))
              .map((item) => (
                <AppointmentRow key={item.id} appointment={item} onAction={(payload) => updateMutation.mutate(payload)} />
              ))}
          </div>
        </Card>
      ) : null}

      {updateMutation.isError ? <p style={{ color: "var(--danger)" }}>{updateMutation.error.message}</p> : null}
    </div>
  );
}

function AppointmentRow({
  appointment,
  onAction,
}: {
  appointment: Appointment;
  onAction: (payload: { id: string; status: AppointmentStatus; scheduledAt?: string | null }) => void;
}) {
  const [scheduleInput, setScheduleInput] = useState(appointment.scheduledAt ? appointment.scheduledAt.slice(0, 16) : "");

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 12,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div className="stack" style={{ gap: 4 }}>
          <strong>{appointment.service}</strong>
          <p className="muted">Patient ID: {appointment.patientId}</p>
        </div>
        <Badge text={appointment.status} />
      </div>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1.2fr auto auto auto auto" }}>
        <Input type="datetime-local" value={scheduleInput} onChange={(event) => setScheduleInput(event.target.value)} />
        <Button
          variant="secondary"
          onClick={() =>
            onAction({
              id: appointment.id,
              status: "PENDING_CONFIRMATION",
              scheduledAt: scheduleInput ? new Date(scheduleInput).toISOString() : null,
            })
          }
        >
          Hold Slot
        </Button>
        <Button
          onClick={() =>
            onAction({
              id: appointment.id,
              status: "CONFIRMED",
              scheduledAt: scheduleInput ? new Date(scheduleInput).toISOString() : null,
            })
          }
        >
          Confirm
        </Button>
        <Button variant="secondary" onClick={() => onAction({ id: appointment.id, status: "COMPLETED" })}>
          Complete
        </Button>
        <Button variant="danger" onClick={() => onAction({ id: appointment.id, status: "CANCELLED" })}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
