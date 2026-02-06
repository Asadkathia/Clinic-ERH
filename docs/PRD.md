# Product Requirements Document (PRD)

## 1. Document Control
- Product: Clinic Management CRM with WhatsApp-first Operations
- Version: v1.1 (Draft)
- Date: February 6, 2026
- Owner: Product / Founding Team
- Status: Documentation-first planning phase

## 2. Product Vision
Build a clinic CRM that captures demand from landing pages and WhatsApp, converts requests into confirmed appointments, manages invoicing and payment verification, and supports add-on test billing after doctor consultation.

Communication should be primarily on WhatsApp, with staff control inside CRM.

## 3. Problem Statement
Current clinic workflows are fragmented across forms, phone calls, chats, and manual ledgers. This causes slow follow-up, missing requests, delayed confirmations, billing errors, and poor visibility on payment status.

The product must provide one operational pipeline from first inquiry to paid service.

## 4. Goals and Non-Goals
### 4.1 Business Goals
- Increase conversion from inquiry to confirmed appointment.
- Reduce response and confirmation time.
- Improve invoice collection and payment visibility.
- Standardize receptionist workflow for consultations and tests.

### 4.2 Product Goals
- Capture patient requests from landing form and WhatsApp.
- Track each request through appointment and invoice lifecycle.
- Send appointment and invoice communications on WhatsApp.
- Allow payment proof screenshots via WhatsApp and manual verification by staff.
- Support post-consultation test additions and supplemental billing.

### 4.3 Non-Goals (MVP)
- Full EMR clinical charting.
- Automated insurance claims.
- Automated OCR payment matching (manual verification first).
- Native mobile apps for staff.

## 5. Personas
- Patient: submits request, receives appointment and invoice details, shares payment proof.
- Receptionist/CRM User: converts requests, schedules appointments, sends invoices, verifies payment, manages add-on tests.
- Doctor: conducts consultation and recommends tests.
- Admin: configures services, pricing, staff permissions, and WhatsApp setup.

## 6. End-to-End User Journey (Primary)
### 6.1 Flow A: Landing Page to Service Completion
1. Patient opens landing page and fills registration/request form.
2. Patient submits service/test type and optional preferred date/time.
3. CRM creates a new `REQUEST` entry in "New Requests" queue.
4. CRM user converts request into patient record (or links existing patient by phone).
5. If date/time missing or unclear, CRM user contacts patient on WhatsApp for confirmation.
6. Appointment is confirmed in CRM with date/time and service details.
7. Invoice is generated and sent to patient on WhatsApp.
8. Patient pays and sends payment screenshot on WhatsApp.
9. CRM user verifies screenshot and marks invoice payment status.
10. Patient receives consultation/service.
11. If doctor recommends tests, patient goes to reception.
12. Receptionist adds test items to current visit billing (same invoice or supplemental invoice).
13. Patient pays additional amount.
14. Receptionist updates invoice status and patient proceeds for test.

### 6.2 Flow B: WhatsApp-first Booking
1. Patient starts booking directly on WhatsApp.
2. Bot/staff flow collects name, service, and preferred time.
3. CRM creates request and follows the same confirmation, invoice, payment, and fulfillment flow as Flow A.

## 7. Scope
### 7.1 MVP Scope
- Lead/request capture from landing form.
- Patient CRM with phone-based deduplication.
- Appointment pipeline and status management.
- WhatsApp communication for appointment and invoice updates.
- Invoice generation and manual payment confirmation using screenshot proof.
- Reception workflow for doctor-recommended add-on tests.
- Audit logs for key actions (status changes, invoice updates, WhatsApp events).

### 7.2 Post-MVP Scope
- Online payment links and automatic payment reconciliation.
- OCR for payment screenshot extraction.
- Role-based fine-grained access controls.
- Multi-branch scheduling and centralized reporting.
- Template library and campaign messaging.

## 8. Benchmark Reference: Chughtai-style WhatsApp Experience
This section captures publicly visible patterns and product implications.

### 8.1 Public Observations
- Chughtai website pages repeatedly expose one helpline number with call/WhatsApp language.
- Home sampling page exposes a click-to-WhatsApp link with pre-filled booking text.
- Services are offered through app, web, call center, and WhatsApp in parallel.
- Chughtai channels indicate WhatsApp usage for patient-facing actions including reports.

### 8.2 Product Parity Requirements (Inferred)
The following are product inferences from public behavior and should be treated as target experience, not claims about internal systems:
- One clearly visible WhatsApp contact across landing pages and CRM communication templates.
- Click-to-WhatsApp from web form success page for low-friction follow-up.
- Unified queue regardless of source (`LANDING_FORM`, `WHATSAPP`, `CALL`, `WALKIN`).
- Staff-assisted closure for confirmations, invoice follow-up, and payment validation.
- WhatsApp used both for appointment intake and post-booking communication.

## 9. Functional Requirements
### 9.1 Intake and Lead Management
- FR-INT-001: System must capture landing page submissions as `REQUEST` records.
- FR-INT-002: Form must include patient name, phone, requested service/test, and optional preferred date/time.
- FR-INT-003: Every request must store source channel and submission timestamp.
- FR-INT-004: CRM user must be able to convert request to patient and appointment.

### 9.2 Patient CRM
- FR-CRM-001: System must create or match patient using phone number as primary dedupe key.
- FR-CRM-002: Staff must edit patient profile fields (name, gender, DOB, notes).
- FR-CRM-003: Patient profile must show appointment, invoice, and payment history.
- FR-CRM-004: WhatsApp chat timeline must be visible from patient profile.

### 9.3 Appointment Management
- FR-APT-001: Appointment statuses must include `REQUESTED`, `PENDING_CONFIRMATION`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
- FR-APT-002: CRM user must set or update appointment date/time and assigned provider.
- FR-APT-003: System must allow appointment creation from both landing form and WhatsApp.
- FR-APT-004: Confirmation message must be sendable to patient on WhatsApp.

### 9.4 Invoice and Billing
- FR-INV-001: System must generate invoice after appointment confirmation or as configured by clinic policy.
- FR-INV-002: Invoice must support multiple line items (consultation, lab tests, imaging, other services).
- FR-INV-003: Invoice PDF/link must be sendable through WhatsApp.
- FR-INV-004: Invoice statuses must include `DRAFT`, `SENT`, `PARTIALLY_PAID`, `PAID`, `VOID`.
- FR-INV-005: Receptionist must add additional tests to invoice after doctor recommendation.
- FR-INV-006: System must support either adding items to existing invoice or creating supplemental invoice.

### 9.5 Payment Verification
- FR-PAY-001: Patient must be able to share payment proof screenshot on WhatsApp.
- FR-PAY-002: CRM user must mark screenshot status as `RECEIVED`, `VERIFIED`, or `REJECTED`.
- FR-PAY-003: Payment records must store amount, method, reference number (if provided), and verifier.
- FR-PAY-004: Invoice status must update when payment verification is completed.

### 9.6 WhatsApp Communication
- FR-WA-001: System must verify webhook challenge token.
- FR-WA-002: System must store inbound/outbound WhatsApp messages with timestamp and metadata.
- FR-WA-003: System must support appointment creation via WhatsApp chat flow.
- FR-WA-004: System must support sending appointment confirmation on WhatsApp.
- FR-WA-005: System must support sending invoice notifications on WhatsApp.
- FR-WA-006: System must support receiving and attaching payment screenshots to invoice/payment records.
- FR-WA-007: Conversation flow must support restart and handoff to staff.

### 9.7 Reception Workflow for Add-on Tests
- FR-REC-001: Receptionist must open patient visit and add doctor-recommended tests.
- FR-REC-002: Added tests must recalculate total payable amount.
- FR-REC-003: Patient cannot be marked ready-for-test until payment status meets clinic rule.
- FR-REC-004: Updated invoice must be shareable again on WhatsApp.

## 10. State Models
### 10.1 Request State
- `NEW`
- `CONTACTED`
- `QUALIFIED`
- `CONVERTED`
- `CLOSED_LOST`

### 10.2 Appointment State
- `REQUESTED`
- `PENDING_CONFIRMATION`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

### 10.3 Invoice State
- `DRAFT`
- `SENT`
- `PARTIALLY_PAID`
- `PAID`
- `VOID`

### 10.4 Payment Proof State
- `NOT_SUBMITTED`
- `RECEIVED`
- `VERIFIED`
- `REJECTED`

## 11. Data Model Requirements
### 11.1 Core Entities
- `LeadRequest`
- `Patient`
- `Appointment`
- `Invoice`
- `InvoiceItem`
- `Payment`
- `PaymentProof`
- `WhatsappConversation`
- `WhatsappMessage`
- `ServiceCatalog`
- `User`

### 11.2 Minimum Key Fields
- `LeadRequest`: `id`, `fullName`, `phone`, `serviceRequested`, `preferredDateTime`, `source`, `status`, `createdAt`
- `Invoice`: `id`, `patientId`, `appointmentId`, `invoiceNumber`, `subtotal`, `discount`, `total`, `status`, `sentAt`
- `InvoiceItem`: `id`, `invoiceId`, `serviceCode`, `description`, `qty`, `unitPrice`, `lineTotal`
- `Payment`: `id`, `invoiceId`, `amount`, `method`, `reference`, `status`, `verifiedBy`, `verifiedAt`
- `PaymentProof`: `id`, `paymentId`, `channel`, `mediaUrl`, `uploadedAt`

## 12. API Requirements (MVP)
- `POST /api/lead-requests` (landing form intake)
- `GET /api/lead-requests`
- `POST /api/lead-requests/:id/convert`
- `GET /api/patients`
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id`
- `POST /api/invoices`
- `POST /api/invoices/:id/send-whatsapp`
- `POST /api/invoices/:id/items`
- `POST /api/payments`
- `PATCH /api/payments/:id/verify`
- `GET /webhooks/whatsapp`
- `POST /webhooks/whatsapp`

## 13. Non-Functional Requirements
### 13.1 Performance
- NFR-PERF-001: Webhook acknowledgments should complete under 2 seconds.
- NFR-PERF-002: CRM list endpoints should respond under 500 ms at MVP load.

### 13.2 Reliability
- NFR-REL-001: Webhook handler must be idempotent using provider message IDs.
- NFR-REL-002: Failed outbound WhatsApp sends must be logged and retryable.

### 13.3 Security and Privacy
- NFR-SEC-001: Credentials must be managed via environment variables or secret manager.
- NFR-SEC-002: Staff authentication and role checks are required before production release.
- NFR-SEC-003: Patient data and payment proof media must be access controlled.
- NFR-SEC-004: Do not send sensitive clinical details on WhatsApp unless policy allows.

### 13.4 Auditability
- NFR-AUD-001: Track who changed appointment, invoice, and payment statuses.
- NFR-AUD-002: Keep immutable event logs for financial status changes.

## 14. Metrics and KPIs
- Inquiry to confirmed appointment conversion rate.
- Median time from request creation to first response.
- Median time from invoice sent to payment verified.
- Share of bookings initiated on WhatsApp.
- Number of manual follow-ups per successful booking.
- Add-on test billing capture rate after consultation.

## 15. Milestones
### Phase 0: PRD and Architecture
- Finalize this PRD.
- Finalize channel and billing policy decisions.

### Phase 1: Intake, CRM, and Appointment Core
- Landing form ingestion.
- Lead queue and conversion.
- Appointment confirmation flow.

### Phase 2: Invoice and Payment Workflow
- Invoice creation and WhatsApp dispatch.
- Payment screenshot capture and manual verification.
- Financial status dashboards.

### Phase 3: Add-on Test and Operational Hardening
- Reception add-on test workflow.
- Idempotency, retries, and audit improvements.
- Production security checklist.

## 16. MVP Acceptance Criteria
- Landing page form creates `NEW` request visible in CRM queue.
- CRM user converts request to patient and confirms appointment.
- Invoice is generated and sent to patient on WhatsApp.
- Payment screenshot is received on WhatsApp and linked to invoice.
- CRM user verifies payment and invoice reaches `PAID` state.
- Receptionist can add doctor-recommended test items and collect additional payment.
- All key status changes are audit logged.

## 17. Risks and Mitigations
- Risk: Staff workload increases due to manual payment proof verification.
  - Mitigation: Keep verification queue and add SLA/ownership, automate in post-MVP.
- Risk: Duplicate webhook events create duplicate invoices or payments.
  - Mitigation: Enforce idempotency keys and duplicate checks.
- Risk: Patients send incomplete screenshot proof.
  - Mitigation: Provide WhatsApp instruction template and rejection reason presets.
- Risk: WhatsApp policy/template restrictions impact outbound messages.
  - Mitigation: Pre-approve templates before launch.

## 18. Open Decisions
- Single branch or multi-branch from day one?
- Should invoice be generated at confirmation or after visit check-in?
- Which payment methods are in MVP (bank transfer, cash, card, wallet)?
- Is partial payment allowed?
- Must doctor recommendations integrate from a consultation note, or manual reception entry is enough for MVP?
- Direct Meta Cloud API or Twilio as WhatsApp provider?

## 19. Source Notes for Benchmark Research
Public references used for Chughtai-style pattern analysis:
- Chughtai homepage: https://chughtailab.com/
- Home sampling page (call/WhatsApp and click-to-WhatsApp behavior): https://chughtailab.com/home-sampling/
- Mobile app page (multi-channel service delivery): https://chughtailab.com/chughtais-lab-mobile-app/
- Digital reports page (WhatsApp-based report access mention): https://chughtailab.com/digital-reports-by-phone-number/

Inference note:
This PRD uses observable public behavior to define target UX parity. Internal Chughtai systems, tooling, and exact process design are not publicly confirmed.
