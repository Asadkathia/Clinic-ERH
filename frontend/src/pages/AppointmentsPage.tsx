import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import type { Appointment, AppointmentStatus } from "../lib/api/contracts";
import { api } from "../lib/api/services";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_OPTIONS: AppointmentStatus[] = [
  "REQUESTED",
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthGrid(monthAnchor: Date) {
  const firstOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }).map((_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function toIsoFromDateTime(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00`).toISOString();
}

function displayDate(dateKey: string) {
  const parsed = new Date(`${dateKey}T00:00:00`);
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function displayTime(iso?: string | null) {
  if (!iso) return "No time";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const statusTone: Record<AppointmentStatus, string> = {
  REQUESTED: "rgba(18,101,255,0.11)",
  PENDING_CONFIRMATION: "rgba(13,127,111,0.12)",
  CONFIRMED: "rgba(13,127,111,0.2)",
  COMPLETED: "rgba(61,89,115,0.17)",
  CANCELLED: "rgba(190,18,60,0.17)",
  NO_SHOW: "rgba(180,83,9,0.18)",
};

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: api.listAppointments });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: api.listPatients });
  const [monthAnchor, setMonthAnchor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()));
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<string | null>(null);
  const [composer, setComposer] = useState({
    service: "",
    patientId: "",
    time: "10:00",
    status: "REQUESTED" as AppointmentStatus,
  });

  const createMutation = useMutation({
    mutationFn: api.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setComposer((prev) => ({ ...prev, service: "", time: "10:00" }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, scheduledAt }: { id: string; status?: AppointmentStatus; scheduledAt?: string | null }) =>
      api.updateAppointment(id, { status, scheduledAt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAppointment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const appointments = useMemo(() => appointmentsQuery.data?.appointments ?? [], [appointmentsQuery.data?.appointments]);
  const patients = useMemo(() => patientsQuery.data?.patients ?? [], [patientsQuery.data?.patients]);
  const patientNameById = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient.fullName])),
    [patients],
  );

  const monthDays = useMemo(() => getMonthGrid(monthAnchor), [monthAnchor]);
  const monthLabel = monthAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const todayKey = formatDateKey(new Date());

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const key = appointment.scheduledAt ? appointment.scheduledAt.slice(0, 10) : todayKey;
      const arr = map.get(key) ?? [];
      arr.push(appointment);
      map.set(key, arr);
    }
    return map;
  }, [appointments, todayKey]);

  const selectedDayAppointments = (appointmentsByDate.get(selectedDateKey) ?? [])
    .slice()
    .sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""));

  const activePatientId = composer.patientId || patients[0]?.id || "";

  function jumpMonth(offset: number) {
    const next = new Date(monthAnchor);
    next.setMonth(next.getMonth() + offset);
    setMonthAnchor(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  return (
    <div className="stack page-shell">
      <Card>
        <div className="page-header">
          <div className="stack" style={{ gap: 6 }}>
            <span className="soft-chip">Scheduler</span>
            <h3 className="page-title">Dynamic Appointment Calendar</h3>
            <p className="muted">Create, delete, and reschedule appointment cards directly inside the calendar.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={() => jumpMonth(-1)}>
              Prev
            </Button>
            <Button variant="secondary" onClick={() => setMonthAnchor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
              Today
            </Button>
            <Button variant="secondary" onClick={() => jumpMonth(1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
        <Card>
          <div className="stack">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{monthLabel}</strong>
              <Badge text={`${appointments.length} Appointments`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
              {WEEK_DAYS.map((label) => (
                <div key={label} style={{ fontWeight: 700, fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                  {label}
                </div>
              ))}

              {monthDays.map((day) => {
                const dateKey = formatDateKey(day);
                const dayAppointments = appointmentsByDate.get(dateKey) ?? [];
                const isCurrentMonth = day.getMonth() === monthAnchor.getMonth();
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDateKey;

                return (
                  <div
                    key={dateKey}
                    className="list-item"
                    onClick={() => {
                      setSelectedDateKey(dateKey);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (!draggedAppointmentId) return;
                      const dragged = appointments.find((item) => item.id === draggedAppointmentId);
                      if (!dragged) return;
                      const oldTime = dragged.scheduledAt ? new Date(dragged.scheduledAt).toISOString().slice(11, 16) : "10:00";
                      updateMutation.mutate({
                        id: dragged.id,
                        scheduledAt: toIsoFromDateTime(dateKey, oldTime),
                      });
                      setDraggedAppointmentId(null);
                    }}
                    style={{
                      border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                      borderRadius: 12,
                      minHeight: 120,
                      padding: 8,
                      background: isCurrentMonth ? "var(--surface)" : "var(--surface-muted)",
                      opacity: isCurrentMonth ? 1 : 0.62,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 999,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          background: isToday ? "var(--accent-soft)" : "transparent",
                          color: isToday ? "var(--accent)" : "var(--text)",
                        }}
                      >
                        {day.getDate()}
                      </span>
                      <button
                        className="ui-btn ui-btn--secondary"
                        style={{ padding: "2px 7px", borderRadius: 8, fontSize: 12 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedDateKey(dateKey);
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          draggable
                          onDragStart={() => setDraggedAppointmentId(appointment.id)}
                          onClick={(event) => event.stopPropagation()}
                          className="list-item"
                          style={{
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "4px 6px",
                            background: statusTone[appointment.status],
                            fontSize: 12,
                            display: "grid",
                            gap: 2,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                            <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {appointment.service}
                            </strong>
                            <button
                              onClick={() => deleteMutation.mutate(appointment.id)}
                              style={{ border: 0, background: "transparent", color: "var(--danger)", cursor: "pointer" }}
                              aria-label="Delete appointment"
                            >
                              x
                            </button>
                          </div>
                          <span className="muted">{displayTime(appointment.scheduledAt)}</span>
                        </div>
                      ))}
                      {dayAppointments.length > 3 ? <span className="muted">+{dayAppointments.length - 3} more</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <h3 className="page-title" style={{ fontSize: 22 }}>
              {displayDate(selectedDateKey)}
            </h3>
            <p className="muted">Create appointments and manage cards for the selected day.</p>

            <div className="stack" style={{ gap: 8 }}>
              <Input
                placeholder="Service (e.g., Consultation)"
                value={composer.service}
                onChange={(event) => setComposer((prev) => ({ ...prev, service: event.target.value }))}
              />
              <Select
                value={activePatientId}
                onChange={(event) => setComposer((prev) => ({ ...prev, patientId: event.target.value }))}
              >
                {patients.length === 0 ? <option value="">No patients available</option> : null}
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName} ({patient.phone})
                  </option>
                ))}
              </Select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Input
                  type="time"
                  value={composer.time}
                  onChange={(event) => setComposer((prev) => ({ ...prev, time: event.target.value }))}
                />
                <Select
                  value={composer.status}
                  onChange={(event) => setComposer((prev) => ({ ...prev, status: event.target.value as AppointmentStatus }))}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                disabled={!composer.service.trim() || !activePatientId || createMutation.isPending}
                onClick={() => {
                  if (!activePatientId || !composer.service.trim()) return;
                  createMutation.mutate({
                    patientId: activePatientId,
                    service: composer.service.trim(),
                    scheduledAt: toIsoFromDateTime(selectedDateKey, composer.time || "10:00"),
                    status: composer.status,
                  });
                }}
              >
                Add Appointment Card
              </Button>
            </div>

            <div className="stack" style={{ gap: 8 }}>
              <strong>Appointments on Selected Day</strong>
              {selectedDayAppointments.length === 0 ? <p className="muted">No appointments on this day.</p> : null}
              {selectedDayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="list-item"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 10,
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{appointment.service}</strong>
                    <Badge text={appointment.status} />
                  </div>
                  <p className="muted">Patient: {patientNameById.get(appointment.patientId) ?? appointment.patientId}</p>
                  <p className="muted">Time: {displayTime(appointment.scheduledAt)}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" onClick={() => updateMutation.mutate({ id: appointment.id, status: "CONFIRMED" })}>
                      Confirm
                    </Button>
                    <Button variant="danger" onClick={() => deleteMutation.mutate(appointment.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {createMutation.isError ? <p style={{ color: "var(--danger)" }}>{createMutation.error.message}</p> : null}
            {updateMutation.isError ? <p style={{ color: "var(--danger)" }}>{updateMutation.error.message}</p> : null}
            {deleteMutation.isError ? <p style={{ color: "var(--danger)" }}>{deleteMutation.error.message}</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
