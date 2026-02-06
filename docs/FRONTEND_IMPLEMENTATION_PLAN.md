# Frontend-First Implementation Plan

## 1. Objective
Build and ship a complete frontend experience for the clinic CRM, end to end, with backend integration staged behind contract-first APIs and mocks until production services are ready.

Final objective: 100% completion against PRD flows from lead intake to payment verification and post-consultation add-on test billing.

## 2. Planning Inputs
- Source PRD: `docs/PRD.md`
- Primary flows:
  - Landing form to appointment to invoice to payment proof verification
  - WhatsApp-first appointment intake
  - Reception add-on tests and supplemental billing

## 3. Frontend-First Strategy
### 3.1 Why frontend-first
- Validates full operations flow with real users/staff early.
- De-risks UX and workflow design before backend complexity.
- Enables parallel backend implementation through stable API contracts.

### 3.2 Execution principles
- Contract-first APIs (OpenAPI/spec + typed client).
- Mock-first development (MSW or equivalent) for every endpoint.
- Feature flags for incomplete backend capabilities.
- Every screen linked to clear state machine transitions.
- No screen considered complete without empty, loading, error, success states.

### 3.3 Delivery model
- Track A: Design system and UX foundations.
- Track B: Patient-facing web flows.
- Track C: CRM/staff operations frontend.
- Track D: Quality, observability, release hardening.
- Track E: Backend integration and production readiness.

## 4. Assumed Frontend Architecture
### 4.1 Core stack (recommended)
- Framework: Next.js (App Router) or React + Vite
- Language: TypeScript strict mode
- Styling: Tailwind + design tokens (or CSS modules with tokens)
- State:
  - Server state: React Query
  - UI state: Zustand/Context for local workflow state
- Forms: React Hook Form + Zod validation
- API client: generated from OpenAPI (preferred)
- Testing: Playwright (E2E), Vitest + Testing Library (unit/integration)

### 4.2 Folder model (target)
- `apps/web` or `frontend/`
- `src/app` or `src/pages`
- `src/features/<domain>`
- `src/components/ui`
- `src/lib/api`
- `src/lib/state`
- `src/lib/guards`
- `src/mocks`
- `src/test`

## 5. Scope Decomposition (Frontend)
### 5.1 Patient-facing
- Landing page
- Service/test request form
- Success page with click-to-WhatsApp CTA
- Optional request status lookup

### 5.2 CRM/staff-facing
- Authentication and role-aware navigation
- Dashboard and operational KPIs
- Lead request queue
- Lead-to-patient conversion
- Patient profile with timeline
- Appointment board/list and detail
- Invoice creation and management
- Invoice item management (including add-on tests)
- Payment proof review/verification queue
- WhatsApp conversation panel (read + action shortcuts)
- Audit trail views

### 5.3 Cross-cutting
- Design system
- Notifications/toasts
- Error boundaries and fallback views
- Search/filter/sort/pagination patterns
- Access control and route guards
- Activity logging hooks for user actions

## 6. End-to-End Frontend Flow Map
### 6.1 Flow 1: Landing to confirmed appointment
1. Patient submits landing form.
2. CRM receives new request in queue.
3. Staff opens request and converts to patient + appointment.
4. Staff confirms date/time and sends WhatsApp confirmation.

### 6.2 Flow 2: Invoice and payment proof
1. Staff generates invoice from appointment.
2. Staff sends invoice on WhatsApp.
3. Patient sends screenshot proof.
4. Staff verifies/rejects proof.
5. Invoice updates to `PAID` or remains pending.

### 6.3 Flow 3: Doctor-recommended add-on tests
1. Reception opens patient visit.
2. Adds new test items to invoice/supplemental invoice.
3. Patient pays additional amount.
4. Staff updates payment and allows test progression.

## 7. Detailed Phase Plan

## 7.1 Phase 0: Foundation and Contracts
### Goal
Create a production-grade frontend baseline and contract layer before feature implementation.

### Tasks
- Define design tokens (color, typography, spacing, radius, elevation).
- Build reusable UI primitives:
  - buttons, inputs, selects, modals, drawers, tables, badges, timeline, tabs.
- Set up app shell:
  - top nav, side nav, role-aware menus, breadcrumbs.
- Set up auth placeholders and protected routes.
- Create global error/loading/empty patterns.
- Define API contracts for all PRD endpoints.
- Implement mock handlers for each endpoint.
- Create typed API client and service wrappers.

### Exit criteria
- All planned endpoint contracts documented and mockable.
- App runs fully with mock backend.
- UI primitives used by at least one sample screen each.

## 7.2 Phase 1: Patient Intake Experience
### Goal
Ship landing and intake frontend that feeds CRM request queue.

### Tasks
- Implement landing page structure and service catalog sections.
- Implement request form:
  - name, phone, service/test selection,
  - optional date/time preference,
  - validation and anti-spam basics.
- Implement submission flow:
  - optimistic pending state,
  - success/failure messaging.
- Implement success page:
  - click-to-WhatsApp deep link with prefilled text,
  - confirmation summary.
- Analytics events:
  - form started, submitted, failed, WhatsApp CTA clicked.

### Exit criteria
- Form flow complete with robust state handling.
- Intake request appears in mock CRM queue.
- Tracking events observable in dev console/log sink.

## 7.3 Phase 2: Lead Queue and Conversion
### Goal
Enable CRM users to convert incoming requests into patients and appointments.

### Tasks
- Build "New Requests" queue screen:
  - filters by source/status/date,
  - quick search by name/phone.
- Build request detail drawer/page.
- Add conversion flow:
  - create patient or link existing,
  - create appointment with status transitions.
- Add timeline history UI for request actions.
- Add role guard for staff-only actions.

### Exit criteria
- Staff can process full request lifecycle in UI.
- Conversion triggers expected state transitions and visible audit events.

## 7.4 Phase 3: Appointment Operations
### Goal
Provide reliable appointment management and confirmation workflows.

### Tasks
- Build appointments list and kanban/state-board view.
- Build appointment details with:
  - patient info snapshot,
  - service details,
  - schedule controls,
  - status transition controls.
- Add WhatsApp action shortcuts:
  - send confirmation,
  - request missing date/time.
- Build calendar/day schedule view for receptionist.
- Add no-show and cancellation handling UI.

### Exit criteria
- Appointment lifecycle states fully represented in UI.
- Staff can confirm/reschedule/cancel without leaving screen context.

## 7.5 Phase 4: Invoice and Billing Frontend
### Goal
Enable invoicing from confirmed appointments and ongoing visit updates.

### Tasks
- Build invoice creation flow from appointment.
- Build invoice detail page with line items and totals.
- Implement item add/edit/remove controls with recalculation.
- Add invoice state transitions (`DRAFT`, `SENT`, `PARTIALLY_PAID`, `PAID`, `VOID`).
- Build WhatsApp send action for invoice dispatch.
- Build print/download invoice view for front desk.

### Exit criteria
- Staff can create and manage invoice end to end.
- UI enforces valid transitions and shows financial summaries clearly.

## 7.6 Phase 5: Payment Proof Verification
### Goal
Operationalize screenshot-based payment verification flow.

### Tasks
- Build payment queue:
  - unverified proofs,
  - rejected proofs,
  - verified records.
- Build payment verification panel:
  - proof preview,
  - amount/method/reference entry,
  - verify/reject actions with reason.
- Link payment records to invoice timeline.
- Add reconciliation indicators:
  - expected amount vs verified amount.
- Add exception handling UI:
  - missing proof,
  - duplicate proof,
  - mismatched amount.

### Exit criteria
- Manual verification workflow is complete and auditable in UI.
- Invoice status updates are immediately visible across screens.

## 7.7 Phase 6: Post-Consultation Add-on Tests
### Goal
Support receptionist updates for doctor-recommended tests and additional billing.

### Tasks
- Build "Current Visit" panel in patient/appointment context.
- Add test recommendation intake UI (manual entry in MVP).
- Support two billing modes:
  - append to existing invoice,
  - create supplemental invoice.
- Recompute totals and outstanding balances.
- Add payment completion gate before "Proceed to Test" action.

### Exit criteria
- Reception can complete add-on test billing without data loss.
- Payment gate logic is enforced at UI and API request layers.

## 7.8 Phase 7: WhatsApp Console Integration (UI Side)
### Goal
Give staff visibility and quick actions for WhatsApp communication.

### Tasks
- Build conversation timeline component.
- Map messages to patient and related records.
- Add action chips:
  - send appointment reminder,
  - send invoice,
  - request payment proof,
  - handoff note.
- Add media preview support for screenshots.
- Add unread/new activity indicators in CRM nav.

### Exit criteria
- Staff can perform major communication actions from CRM.
- Conversation context remains linked to appointments and invoices.

## 7.9 Phase 8: Hardening, Accessibility, and Launch
### Goal
Close quality gaps and make frontend production-ready.

### Tasks
- Accessibility pass:
  - keyboard nav,
  - focus states,
  - aria labels,
  - color contrast.
- Responsive pass for key breakpoints (mobile/tablet/desktop).
- Performance optimization:
  - route-level code splitting,
  - heavy component lazy loading.
- Security hardening:
  - input sanitization,
  - upload constraints,
  - permission-aware rendering.
- UX polish:
  - skeleton loaders,
  - empty states,
  - consistent feedback loops.

### Exit criteria
- Critical user journeys pass on mobile and desktop.
- All P0 accessibility and security frontend checks closed.

## 8. API Contract and Mock Plan
### 8.1 Contract coverage required
All endpoints listed in `docs/PRD.md` section 12 must have:
- request schema
- response schema
- error schema
- mock handlers (success + failure variants)

### 8.2 Integration sequencing
1. Build UI against mocks.
2. Run contract tests against backend staging.
3. Replace mock adapter per endpoint once backend passes contract.
4. Keep fallback mock mode for local demos and regression isolation.

## 9. Testing Strategy
### 9.1 Unit tests
- Form validation logic.
- Price/tax/total calculations.
- State transition guard functions.

### 9.2 Integration tests
- Lead conversion workflow.
- Appointment confirmation workflow.
- Invoice item mutation and totals.
- Payment verification actions.

### 9.3 E2E tests (must-have)
- `Flow A`: landing -> request queue -> appointment confirm.
- `Flow B`: invoice create -> send -> proof verify -> paid.
- `Flow C`: add-on tests -> extra payment -> proceed.
- Error paths:
  - failed submit,
  - failed send,
  - rejected payment proof.

### 9.4 UAT checklist
- Receptionist scenario walkthrough.
- Admin scenario walkthrough.
- Mixed-source inbound requests validation.

## 10. Definition of Done (Screen-Level)
A screen is done only when:
- Functional behavior matches PRD.
- Loading, empty, error, success states implemented.
- Role access checks enforced.
- Telemetry events instrumented.
- Unit/integration tests cover critical actions.
- Copy is reviewed and operationally clear.

## 11. 100% Completeness Framework
### 11.1 Completion dimensions
- Feature completeness: all PRD functional requirements mapped to shipped UI.
- Workflow completeness: all end-to-end flows operable without manual workarounds.
- Quality completeness: test pass rate, accessibility baseline, performance budgets met.
- Integration completeness: all mock endpoints replaced by real backend integrations.
- Operational completeness: staff can run day-to-day operations entirely from product UI.

### 11.2 Traceability matrix requirement
Create and maintain a matrix:
- Row: each PRD requirement ID (`FR-*`, key `NFR-*`).
- Columns:
  - frontend screen/component
  - API endpoint
  - test cases
  - status (`Not Started`, `In Progress`, `Done`, `Blocked`)

No release candidate is accepted with unresolved P0/P1 traceability gaps.

## 12. Milestone and Gate Model
### Gate 1: UX and contract baseline
- Design system v1 complete
- API specs and mocks complete

### Gate 2: Intake and appointment operations
- Lead and appointment flows production-ready in frontend

### Gate 3: Financial operations
- Invoice and payment verification flows production-ready

### Gate 4: Reception add-on and communication completeness
- Add-on billing and WhatsApp console readiness achieved

### Gate 5: Production readiness
- Accessibility, QA, and integration sign-offs complete

## 13. Team Plan (Suggested)
- Frontend Lead: architecture, contracts, quality gates
- Frontend Engineer A: patient-facing + lead intake
- Frontend Engineer B: CRM queue + appointment operations
- Frontend Engineer C: invoicing + payments + add-on tests
- QA Engineer: test automation and UAT orchestration
- Product Designer: system design + operational workflows
- Product Manager: scope control, acceptance, rollout

## 14. Risk Register (Frontend)
- Risk: backend contract drift.
  - Mitigation: locked OpenAPI version and contract tests in CI.
- Risk: complex receptionist workflows cause UI overload.
  - Mitigation: iterative usability tests with real reception scripts.
- Risk: payment proof media handling complexity.
  - Mitigation: strict upload and preview constraints, clear fallback flows.
- Risk: WhatsApp workflow uncertainty.
  - Mitigation: isolate communication actions via adapter patterns and feature flags.

## 15. Immediate Next Deliverables
1. Create implementation traceability matrix from `docs/PRD.md`.
2. Freeze frontend route map and screen inventory.
3. Generate API contracts and mock responses.
4. Start Phase 0 foundation sprint with DoD checklist.
