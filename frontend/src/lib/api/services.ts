import type {
  AddInvoiceItemInput,
  Appointment,
  CreatePaymentInput,
  CreateAppointmentInput,
  CreateInvoiceInput,
  CreateLeadRequestInput,
  Invoice,
  InvoiceItem,
  LeadRequest,
  Patient,
  Payment,
  SendWhatsappMessageInput,
  UpdateAppointmentInput,
  VerifyPaymentInput,
  WhatsappConversation,
  WhatsappMessage,
} from "./contracts";
import { apiFetch } from "./client";

export const api = {
  listLeadRequests: () => apiFetch<{ requests: LeadRequest[] }>("/api/lead-requests"),
  createLeadRequest: (body: CreateLeadRequestInput) =>
    apiFetch<{ request: LeadRequest }>("/api/lead-requests", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  convertLeadRequest: (id: string) =>
    apiFetch<{ patient: Patient; appointment: Appointment }>(`/api/lead-requests/${id}/convert`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  listPatients: () => apiFetch<{ patients: Patient[] }>("/api/patients"),
  listAppointments: () => apiFetch<{ appointments: Appointment[] }>("/api/appointments"),
  createAppointment: (body: CreateAppointmentInput) =>
    apiFetch<{ appointment: Appointment }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateAppointment: (id: string, body: UpdateAppointmentInput) =>
    apiFetch<{ appointment: Appointment }>(`/api/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  listInvoices: () => apiFetch<{ invoices: Invoice[] }>("/api/invoices"),
  listInvoiceItems: (id: string) => apiFetch<{ items: InvoiceItem[] }>(`/api/invoices/${id}/items`),
  createInvoice: (body: CreateInvoiceInput) =>
    apiFetch<{ invoice: Invoice }>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  addInvoiceItem: (id: string, body: AddInvoiceItemInput) =>
    apiFetch<{ item: InvoiceItem; invoice: Invoice }>(`/api/invoices/${id}/items`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  sendInvoiceWhatsapp: (id: string) =>
    apiFetch<{ success: true; sentAt: string }>(`/api/invoices/${id}/send-whatsapp`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  listPayments: () => apiFetch<{ payments: Payment[] }>("/api/payments"),
  createPayment: (body: CreatePaymentInput) =>
    apiFetch<{ payment: Payment }>("/api/payments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  verifyPayment: (id: string, body: VerifyPaymentInput) =>
    apiFetch<{ payment: Payment }>(`/api/payments/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  listWhatsappConversations: () => apiFetch<{ conversations: WhatsappConversation[] }>("/api/whatsapp/conversations"),
  listWhatsappMessages: (phone: string) =>
    apiFetch<{ messages: WhatsappMessage[] }>(`/api/whatsapp/conversations/${encodeURIComponent(phone)}/messages`),
  sendWhatsappMessage: (body: SendWhatsappMessageInput) =>
    apiFetch<{ success: true; message: WhatsappMessage }>("/api/whatsapp/send-message", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
