import type {
  Appointment,
  Invoice,
  InvoiceItem,
  LeadRequest,
  Patient,
  Payment,
  WhatsappConversation,
  WhatsappMessage,
} from "../lib/api/contracts";

const now = new Date().toISOString();

export const db: {
  requests: LeadRequest[];
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  payments: Payment[];
  whatsappConversations: WhatsappConversation[];
  whatsappMessages: WhatsappMessage[];
} = {
  requests: [
    {
      id: "req_1",
      fullName: "Ayesha Khan",
      phone: "+923001112233",
      serviceRequested: "General Consultation",
      preferredDateTime: null,
      source: "LANDING_FORM",
      status: "NEW",
      createdAt: now,
    },
  ],
  patients: [],
  appointments: [],
  invoices: [],
  invoiceItems: [],
  payments: [],
  whatsappConversations: [
    {
      id: "wa_conv_1",
      phone: "+923001112233",
      patientName: "Ayesha Khan",
      lastMessage: "Please confirm my appointment time.",
      lastMessageAt: now,
      unreadCount: 2,
    },
  ],
  whatsappMessages: [
    {
      id: "wa_msg_1",
      conversationId: "wa_conv_1",
      phone: "+923001112233",
      direction: "INBOUND",
      text: "Hello, I want to book consultation.",
      timestamp: now,
    },
    {
      id: "wa_msg_2",
      conversationId: "wa_conv_1",
      phone: "+923001112233",
      direction: "OUTBOUND",
      text: "Sure. Please share your preferred time.",
      timestamp: now,
    },
  ],
};

let sequence = 2;
export function nextId(prefix: string) {
  sequence += 1;
  return `${prefix}_${sequence}`;
}
