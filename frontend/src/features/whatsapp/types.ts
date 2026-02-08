export type WhatsappLinkState = "linked" | "unlinked" | "ambiguous";

export type WhatsappLinkContext = {
  patientId?: string;
  appointmentId?: string;
  invoiceId?: string;
  linkState: WhatsappLinkState;
  candidates: Array<{ id: string; fullName: string; phone: string }>;
};
