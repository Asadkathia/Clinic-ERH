import type { ApiError } from "./contracts";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let errorPayload: ApiError | null = null;
    try {
      errorPayload = (await res.json()) as ApiError;
    } catch {
      errorPayload = null;
    }
    throw new Error(errorPayload?.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

