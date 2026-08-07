/**
 * ─── API Client سبک Sanctum/Axios-like ───
 * برای فرانت: فچ نسبی به /api/v1 (در پروداکشن به Laravel API وصل می‌شود:
 * NEXT_PUBLIC_API_URL=https://api.ginankala.ir/v1)
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

type QueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>;

export interface ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}

function toQueryString(params: Record<string, QueryValue>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length) usp.set(key, value.join(','));
    } else {
      usp.set(key, String(value));
    }
  });
  return usp.toString();
}

export async function apiGet<T>(
  path: string,
  params: Record<string, QueryValue> = {},
  init?: RequestInit,
): Promise<T> {
  const qs = toQueryString(params);
  const res = await fetch(`${API_BASE}${path}${qs ? `?${qs}` : ''}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    const err = new Error(body.message ?? 'خطای ارتباط با سرور') as ApiRequestError;
    err.status = res.status;
    err.errors = body.errors;
    throw err;
  }

  return (await res.json()) as T;
}
