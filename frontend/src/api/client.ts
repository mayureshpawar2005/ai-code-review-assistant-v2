import type { DebugResponse, HealthResponse, ReviewResponse } from "../types/api";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const detail =
      body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed (${res.status})`;
    throw new Error(detail);
  }

  return body as T;
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export async function postReview(
  language: string,
  code: string
): Promise<ReviewResponse> {
  return request<ReviewResponse>("/review", {
    method: "POST",
    body: JSON.stringify({ language, code }),
  });
}

export async function postDebug(
  language: string,
  code: string,
  error_message: string
): Promise<DebugResponse> {
  return request<DebugResponse>("/debug", {
    method: "POST",
    body: JSON.stringify({ language, code, error_message }),
  });
}
