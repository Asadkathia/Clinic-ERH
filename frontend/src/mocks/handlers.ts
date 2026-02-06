import { HttpResponse, http } from "msw";
import type {
  Appointment,
  Invoice,
  Payment,
  PaymentStatus,
  RequestSource,
  RequestStatus,
} from "../lib/api/contracts";
import { db, nextId } from "./data";

function jsonError(error: string, status = 400) {
  return HttpResponse.json({ error }, { status });
}

export const handlers = [
  http.post("/api/lead-requests", async ({ request }) => {
    const payload = (await request.json()) as {
      fullName?: string;
      phone?: string;
      serviceRequested?: string;
      preferredDateTime?: string;
    };

    if (!payload.fullName || !payload.phone || !payload.serviceRequested) {
      return jsonError("fullName, phone, serviceRequested are required", 422);
    }

    const record = {
      id: nextId("req"),
      fullName: payload.fullName,
      phone: payload.phone,
      serviceRequested: payload.serviceRequested,
      preferredDateTime: payload.preferredDateTime ?? null,
      source: "LANDING_FORM" as RequestSource,
      status: "NEW" as RequestStatus,
      createdAt: new Date().toISOString(),
    };

    db.requests.unshift(record);
    return HttpResponse.json({ request: record }, { status: 201 });
  }),

  http.get("/api/lead-requests", () => {
    return HttpResponse.json({ requests: db.requests });
  }),

  http.post("/api/lead-requests/:id/convert", ({ params }) => {
    const request = db.requests.find((item) => item.id === params.id);
    if (!request) return jsonError("Lead request not found", 404);

    const existingPatient = db.patients.find((item) => item.phone === request.phone);
    const patient =
      existingPatient ??
      (() => {
        const newPatient = {
          id: nextId("pat"),
          fullName: request.fullName,
          phone: request.phone,
          createdAt: new Date().toISOString(),
        };
        db.patients.unshift(newPatient);
        return newPatient;
      })();

    const appointment: Appointment = {
      id: nextId("apt"),
      patientId: patient.id,
      service: request.serviceRequested,
      status: request.preferredDateTime ? "PENDING_CONFIRMATION" : "REQUESTED",
      scheduledAt: request.preferredDateTime ?? null,
      createdAt: new Date().toISOString(),
    };

    request.status = "CONVERTED";
    db.appointments.unshift(appointment);
    return HttpResponse.json({ patient, appointment }, { status: 201 });
  }),

  http.get("/api/patients", () => {
    return HttpResponse.json({ patients: db.patients });
  }),

  http.get("/api/appointments", () => {
    return HttpResponse.json({ appointments: db.appointments });
  }),

  http.post("/api/appointments", async ({ request }) => {
    const payload = (await request.json()) as {
      patientId?: string;
      service?: string;
      scheduledAt?: string;
    };
    if (!payload.patientId || !payload.service) return jsonError("patientId and service are required", 422);

    const appointment: Appointment = {
      id: nextId("apt"),
      patientId: payload.patientId,
      service: payload.service,
      status: payload.scheduledAt ? "PENDING_CONFIRMATION" : "REQUESTED",
      scheduledAt: payload.scheduledAt ?? null,
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(appointment);
    return HttpResponse.json({ appointment }, { status: 201 });
  }),

  http.patch("/api/appointments/:id", async ({ request, params }) => {
    const appointment = db.appointments.find((item) => item.id === params.id);
    if (!appointment) return jsonError("Appointment not found", 404);
    const payload = (await request.json()) as Partial<Appointment>;

    if (payload.status) appointment.status = payload.status;
    if (payload.scheduledAt !== undefined) appointment.scheduledAt = payload.scheduledAt;
    return HttpResponse.json({ appointment });
  }),

  http.get("/api/invoices", () => {
    return HttpResponse.json({ invoices: db.invoices });
  }),

  http.post("/api/invoices", async ({ request }) => {
    const payload = (await request.json()) as { patientId?: string; appointmentId?: string };
    if (!payload.patientId || !payload.appointmentId) return jsonError("patientId and appointmentId are required", 422);

    const invoice: Invoice = {
      id: nextId("inv"),
      patientId: payload.patientId,
      appointmentId: payload.appointmentId,
      invoiceNumber: `INV-${Math.floor(Math.random() * 90000 + 10000)}`,
      subtotal: 0,
      discount: 0,
      total: 0,
      status: "DRAFT",
      sentAt: null,
    };

    db.invoices.unshift(invoice);
    return HttpResponse.json({ invoice }, { status: 201 });
  }),

  http.post("/api/invoices/:id/items", async ({ request, params }) => {
    const invoice = db.invoices.find((item) => item.id === params.id);
    if (!invoice) return jsonError("Invoice not found", 404);
    const payload = (await request.json()) as { description?: string; qty?: number; unitPrice?: number };
    if (!payload.description || !payload.qty || !payload.unitPrice) return jsonError("Invalid invoice item payload", 422);

    const item = {
      id: nextId("item"),
      invoiceId: invoice.id,
      description: payload.description,
      qty: payload.qty,
      unitPrice: payload.unitPrice,
      lineTotal: payload.qty * payload.unitPrice,
    };

    db.invoiceItems.push(item);
    invoice.subtotal += item.lineTotal;
    invoice.total = invoice.subtotal - invoice.discount;
    return HttpResponse.json({ item, invoice });
  }),

  http.get("/api/invoices/:id/items", ({ params }) => {
    const invoice = db.invoices.find((item) => item.id === params.id);
    if (!invoice) return jsonError("Invoice not found", 404);
    const items = db.invoiceItems.filter((item) => item.invoiceId === invoice.id);
    return HttpResponse.json({ items });
  }),

  http.post("/api/invoices/:id/send-whatsapp", ({ params }) => {
    const invoice = db.invoices.find((item) => item.id === params.id);
    if (!invoice) return jsonError("Invoice not found", 404);
    invoice.status = invoice.total > 0 ? "SENT" : "DRAFT";
    invoice.sentAt = new Date().toISOString();
    return HttpResponse.json({ success: true, sentAt: invoice.sentAt });
  }),

  http.get("/api/payments", () => {
    return HttpResponse.json({ payments: db.payments });
  }),

  http.post("/api/payments", async ({ request }) => {
    const payload = (await request.json()) as {
      invoiceId?: string;
      amount?: number;
      method?: string;
      reference?: string;
      proofImageUrl?: string;
    };
    if (!payload.invoiceId || !payload.amount || !payload.method) return jsonError("invoiceId, amount, method are required", 422);

    const payment: Payment = {
      id: nextId("pay"),
      invoiceId: payload.invoiceId,
      amount: payload.amount,
      method: payload.method,
      reference: payload.reference ?? null,
      proofImageUrl: payload.proofImageUrl ?? null,
      rejectionReason: null,
      status: "RECEIVED",
      verifiedBy: null,
      verifiedAt: null,
    };
    db.payments.unshift(payment);
    return HttpResponse.json({ payment }, { status: 201 });
  }),

  http.patch("/api/payments/:id/verify", async ({ request, params }) => {
    const payment = db.payments.find((item) => item.id === params.id);
    if (!payment) return jsonError("Payment not found", 404);
    const payload = (await request.json()) as { status?: PaymentStatus; verifiedBy?: string; rejectionReason?: string };
    if (!payload.status || !payload.verifiedBy) return jsonError("status and verifiedBy are required", 422);
    payment.status = payload.status;
    payment.verifiedBy = payload.verifiedBy;
    payment.verifiedAt = new Date().toISOString();
    payment.rejectionReason = payload.status === "REJECTED" ? payload.rejectionReason ?? "No reason provided" : null;

    const invoice = db.invoices.find((item) => item.id === payment.invoiceId);
    if (invoice && payload.status === "VERIFIED") {
      const totalPaid = db.payments
        .filter((row) => row.invoiceId === invoice.id && row.status === "VERIFIED")
        .reduce((sum, row) => sum + row.amount, 0);
      if (totalPaid >= invoice.total) invoice.status = "PAID";
      else if (totalPaid > 0) invoice.status = "PARTIALLY_PAID";
    }

    return HttpResponse.json({ payment });
  }),

  http.get("/api/whatsapp/conversations", () => {
    const conversations = db.whatsappConversations
      .slice()
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    return HttpResponse.json({ conversations });
  }),

  http.get("/api/whatsapp/conversations/:phone/messages", ({ params }) => {
    const phone = decodeURIComponent(String(params.phone ?? ""));
    const conversation = db.whatsappConversations.find((item) => item.phone === phone);
    if (!conversation) return jsonError("Conversation not found", 404);
    const messages = db.whatsappMessages
      .filter((item) => item.conversationId === conversation.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return HttpResponse.json({ messages });
  }),

  http.post("/api/whatsapp/send-message", async ({ request }) => {
    const payload = (await request.json()) as { phone?: string; text?: string };
    if (!payload.phone || !payload.text) return jsonError("phone and text are required", 422);

    let conversation = db.whatsappConversations.find((item) => item.phone === payload.phone);
    if (!conversation) {
      conversation = {
        id: nextId("wa_conv"),
        phone: payload.phone,
        patientName: payload.phone,
        lastMessage: "",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      };
      db.whatsappConversations.unshift(conversation);
    }

    const message = {
      id: nextId("wa_msg"),
      conversationId: conversation.id,
      phone: payload.phone,
      direction: "OUTBOUND" as const,
      text: payload.text,
      timestamp: new Date().toISOString(),
    };
    db.whatsappMessages.push(message);

    conversation.lastMessage = payload.text;
    conversation.lastMessageAt = message.timestamp;

    return HttpResponse.json({ success: true, message }, { status: 201 });
  }),

  http.get("/webhooks/whatsapp", ({ request }) => {
    const url = new URL(request.url);
    const challenge = url.searchParams.get("hub.challenge");
    return HttpResponse.text(challenge ?? "ok", { status: challenge ? 200 : 403 });
  }),

  http.post("/webhooks/whatsapp", async () => {
    return HttpResponse.json({ received: true }, { status: 200 });
  }),
];
