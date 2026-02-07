export type RequestSource = "LANDING_FORM" | "WHATSAPP" | "CALL" | "WALKIN";
export type RequestStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED_LOST";
export type AppointmentStatus =
  | "REQUESTED"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "VOID";
export type PaymentStatus = "RECEIVED" | "VERIFIED" | "REJECTED";
export type WhatsappDirection = "INBOUND" | "OUTBOUND";

export type LeadRequest = {
  id: string;
  fullName: string;
  phone: string;
  serviceRequested: string;
  preferredDateTime?: string | null;
  source: RequestSource;
  status: RequestStatus;
  createdAt: string;
};

export type Patient = {
  id: string;
  fullName: string;
  phone: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  service: string;
  status: AppointmentStatus;
  scheduledAt?: string | null;
  createdAt: string;
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  description: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Invoice = {
  id: string;
  patientId: string;
  appointmentId: string;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  sentAt?: string | null;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string | null;
  proofImageUrl?: string | null;
  rejectionReason?: string | null;
  status: PaymentStatus;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
};

export type WhatsappConversation = {
  id: string;
  phone: string;
  patientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type WhatsappMessage = {
  id: string;
  conversationId: string;
  phone: string;
  direction: WhatsappDirection;
  text: string;
  timestamp: string;
};

export type ApiError = {
  error: string;
};

export type CreateLeadRequestInput = Pick<
  LeadRequest,
  "fullName" | "phone" | "serviceRequested" | "preferredDateTime"
>;

export type ConvertLeadRequestInput = {
  fullName?: string;
  service?: string;
};

export type CreateAppointmentInput = {
  patientId: string;
  service: string;
  scheduledAt?: string | null;
  status?: AppointmentStatus;
};

export type UpdateAppointmentInput = {
  status?: AppointmentStatus;
  scheduledAt?: string | null;
};

export type CreateInvoiceInput = {
  patientId: string;
  appointmentId: string;
};

export type AddInvoiceItemInput = {
  description: string;
  qty: number;
  unitPrice: number;
};

export type VerifyPaymentInput = {
  status: PaymentStatus;
  verifiedBy: string;
  rejectionReason?: string;
};

export type CreatePaymentInput = {
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string | null;
  proofImageUrl?: string | null;
};

export type SendWhatsappMessageInput = {
  phone: string;
  text: string;
};

export const API_ENDPOINTS = [
  "POST /api/lead-requests",
  "GET /api/lead-requests",
  "POST /api/lead-requests/:id/convert",
  "GET /api/patients",
  "GET /api/appointments",
  "POST /api/appointments",
  "PATCH /api/appointments/:id",
  "DELETE /api/appointments/:id",
  "POST /api/invoices",
  "POST /api/invoices/:id/send-whatsapp",
  "POST /api/invoices/:id/items",
  "POST /api/payments",
  "PATCH /api/payments/:id/verify",
  "GET /webhooks/whatsapp",
  "POST /webhooks/whatsapp",
] as const;
