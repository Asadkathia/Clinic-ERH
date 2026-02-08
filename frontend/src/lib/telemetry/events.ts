export type TelemetryEventName =
  | "form_started"
  | "form_submitted"
  | "form_failed"
  | "whatsapp_cta_clicked";

export type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

type TelemetryEvent = {
  name: TelemetryEventName;
  payload?: TelemetryPayload;
  at: string;
};

declare global {
  interface Window {
    __clinicErhTelemetry?: TelemetryEvent[];
  }
}

export function trackEvent(name: TelemetryEventName, payload?: TelemetryPayload) {
  const event: TelemetryEvent = { name, payload, at: new Date().toISOString() };
  if (typeof window !== "undefined") {
    if (!window.__clinicErhTelemetry) window.__clinicErhTelemetry = [];
    window.__clinicErhTelemetry.push(event);
  }

  if (import.meta.env.DEV) {
    console.info("[telemetry]", event);
  }
}
