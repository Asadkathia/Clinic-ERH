# Requirements Traceability Matrix

## Legend
- Status: `Done`, `In Progress`, `Not Started`, `Blocked`
- Priority: `P0` (must for MVP), `P1` (important), `P2` (post-MVP)

## Functional Requirements
| Req ID | Priority | Frontend Screen / Component | API Endpoint(s) | Test Coverage | Status |
|---|---|---|---|---|---|
| FR-INT-001 | P0 | `LandingPage`, `RequestsPage` | `POST /api/lead-requests`, `GET /api/lead-requests` | Manual flow + E2E Flow A | Done |
| FR-INT-002 | P0 | `LandingPage` form fields | `POST /api/lead-requests` | Manual validation, unit pending | Done |
| FR-INT-003 | P0 | `RequestsPage` list/detail | `GET /api/lead-requests` | Manual flow + accessibility baseline | Done |
| FR-INT-004 | P0 | `RequestsPage` convert action | `POST /api/lead-requests/:id/convert` | Manual flow + E2E Flow A precondition | Done |
| FR-CRM-001 | P0 | `RequestsPage` conversion to patient | `POST /api/lead-requests/:id/convert` | Manual flow | Done |
| FR-CRM-002 | P1 | Patient edit UI not yet built | TBD | Not implemented | Not Started |
| FR-CRM-003 | P1 | `PatientsPage` list only | `GET /api/patients` | Manual smoke | In Progress |
| FR-CRM-004 | P1 | `WhatsappPage` conversation timeline + linked context panel | `GET /api/whatsapp/conversations`, `GET /api/whatsapp/conversations/:phone/messages`, `GET /api/patients`, `GET /api/appointments`, `GET /api/invoices` | Manual flow + E2E smoke | Done |
| FR-APT-001 | P0 | `AppointmentsPage` dynamic calendar cards + statuses | `GET /api/appointments`, `PATCH /api/appointments/:id` | Manual transitions | Done |
| FR-APT-002 | P0 | `AppointmentsPage` schedule create/update/drag actions | `POST /api/appointments`, `PATCH /api/appointments/:id`, `DELETE /api/appointments/:id` | Manual transitions | Done |
| FR-APT-003 | P0 | `RequestsPage` conversion + `AppointmentsPage` calendar intake | `POST /api/lead-requests/:id/convert`, `POST /api/appointments` | Manual flow | Done |
| FR-APT-004 | P1 | WhatsApp send shortcut not in appointments yet | `POST /webhooks/whatsapp` (future adapter) | Not implemented | Not Started |
| FR-INV-001 | P0 | `InvoicesPage` create flow | `POST /api/invoices` | Manual flow | Done |
| FR-INV-002 | P0 | `InvoicesPage` item add + history | `POST /api/invoices/:id/items`, `GET /api/invoices/:id/items` | Manual flow | Done |
| FR-INV-003 | P0 | `InvoicesPage` WhatsApp send action | `POST /api/invoices/:id/send-whatsapp` | Manual flow | Done |
| FR-INV-004 | P0 | `InvoicesPage` status badge | `GET /api/invoices` | Manual checks | Done |
| FR-INV-005 | P0 | Add-on item insertion + gated proceed flow | `POST /api/invoices/:id/items` | Manual flow + E2E Flow C | Done |
| FR-INV-006 | P1 | Supplemental invoice mode in invoice workspace | `POST /api/invoices`, `POST /api/invoices/:id/items` | Manual flow | Done |
| FR-PAY-001 | P0 | `PaymentsPage` record payment proof entry | `POST /api/payments` | Manual flow | Done |
| FR-PAY-002 | P0 | `PaymentsPage` verify/reject actions | `PATCH /api/payments/:id/verify` | Manual flow + E2E verify/reject paths | Done |
| FR-PAY-003 | P0 | `PaymentsPage` method/reference capture | `POST /api/payments` | Manual flow | Done |
| FR-PAY-004 | P0 | Invoice paid/outstanding summary | `GET /api/payments`, `GET /api/invoices` | Manual flow | Done |
| FR-WA-001 | P0 | Webhook challenge support (mock path) | `GET /webhooks/whatsapp` | Mock-only | In Progress |
| FR-WA-002 | P0 | `WhatsappPage` inbound/outbound timeline | `GET /api/whatsapp/conversations`, `GET /api/whatsapp/conversations/:phone/messages` | Manual flow + E2E smoke | Done |
| FR-WA-003 | P0 | Intake via landing + conversion path now; chat bot UI pending | `POST /api/lead-requests`, `POST /api/lead-requests/:id/convert` | Manual flow | In Progress |
| FR-WA-004 | P1 | `WhatsappPage` quick template actions | `POST /api/whatsapp/send-message` (frontend adapter) | Manual flow | In Progress |
| FR-WA-005 | P0 | Invoice send action | `POST /api/invoices/:id/send-whatsapp` | Manual flow | Done |
| FR-WA-006 | P0 | `PaymentsPage` proof upload + preview panel | `POST /api/payments`, `PATCH /api/payments/:id/verify` | Manual flow + E2E Flow B | Done |
| FR-WA-007 | P1 | Restart/handoff UI pending | WhatsApp flow endpoints pending | Not implemented | Not Started |
| FR-REC-001 | P0 | Reception uses appointment/invoice pages | `GET /api/appointments`, `GET /api/invoices` | Manual flow + E2E Flow C | Done |
| FR-REC-002 | P0 | Recalculation on add item | `POST /api/invoices/:id/items` | Manual flow | Done |
| FR-REC-003 | P0 | Payment verification queue + proceed gate enforcement | `PATCH /api/payments/:id/verify`, `GET /api/payments`, `GET /api/invoices` | Manual flow + E2E Flow C | Done |
| FR-REC-004 | P0 | Updated invoice send action | `POST /api/invoices/:id/send-whatsapp` | Manual flow | Done |

## Non-Functional Requirements (Frontend Scope)
| Req ID | Priority | Frontend Control | Measurement | Status |
|---|---|---|---|---|
| NFR-PERF-001 | P0 | Lightweight pages + mock contract testing | Webhook ack measured backend-side | In Progress |
| NFR-PERF-002 | P0 | Query caching and list rendering | Frontend metrics not yet instrumented | In Progress |
| NFR-REL-001 | P0 | Deterministic action flows in UI | Idempotency backend pending | In Progress |
| NFR-REL-002 | P0 | Error message surfacing for failed actions | Retry UX basic, queue retry pending | In Progress |
| NFR-A11Y-001 | P0 | Axe Playwright baseline checks (login + CRM shell) | `npm run test:e2e` accessibility spec | Done |
| NFR-SEC-001 | P0 | Env-driven API config | Secrets managed outside frontend | Done |
| NFR-SEC-002 | P0 | Route guard + role-aware mutation restrictions | Real auth/RBAC policy matrix pending | In Progress |
| NFR-SEC-003 | P0 | Frontend routes and screen scoping | Media ACL pending backend | In Progress |
| NFR-SEC-004 | P0 | No PHI-specific UI flows yet | Policy labels pending | In Progress |
| NFR-AUD-001 | P0 | UI state transitions visible + immutable audit feed page | E2E audit visibility + role-restriction coverage | Done |
| NFR-AUD-002 | P0 | Financial events shown in invoice/payment views + `/crm/audit` timeline | Full backend attribution still pending | In Progress |

## Immediate Gaps to Close (Next)
1. Extend role restrictions to additional high-risk financial actions.
2. Add backend-driven actor attribution fields into audit events.
3. Add CI wiring for accessibility assertions as a required check.
