/**
 * ─── HTTP Client مرورگر (سبک Axios با Interceptorها) ───
 * - تزریق خودکار Bearer Token از localStorage
 * - هدر X-Session-Id برای سبد/مقایسه مهمان
 * - نرمال‌سازی خطاها + رویداد 401 جهانی
 */
export interface HttpError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
const TOKEN_KEY = 'gnk_token';
const SESSION_KEY = 'gnk_session';

export const getToken = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
};

export const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 's-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, params?: QueryParams): string {
  const usp = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v != null && v !== '') usp.set(k, String(v));
  });
  const qs = usp.toString();
  return `${BASE}${path}${qs ? `?${qs}` : ''}`;
}

interface RequestOptions {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  else headers['x-session-id'] = getSessionId() ?? '';
  if (options.body !== undefined) headers['content-type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      signal: options.signal,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    const err = new Error('خطای اتصال به سرور؛ اتصال اینترنت خود را بررسی کنید') as HttpError;
    err.status = 0;
    throw err;
  }

  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (!res.ok) {
    const err = new Error(json.message ?? 'خطای سرور') as HttpError;
    err.status = res.status;
    err.errors = json.errors;
    if (res.status === 401 && typeof window !== 'undefined') {
      setToken(null);
      window.dispatchEvent(new CustomEvent('gnk:unauthorized'));
    }
    throw err;
  }
  return json as T;
}

export const http = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) =>
    request<T>('GET', path, { params, signal }),
  post: <T>(path: string, body?: unknown, params?: QueryParams) =>
    request<T>('POST', path, { body, params }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  del: <T>(path: string, body?: unknown) => request<T>('DELETE', path, { body }),
};

/** استخراج نخستین پیام خطای فیلدها */
export const firstError = (err: unknown): string => {
  const e = err as HttpError;
  if (e?.errors) {
    const first = Object.values(e.errors).flat()[0];
    if (first) return first;
  }
  return e?.message ?? 'خطای ناشناخته';
};

// انواع پاکت پاسخ
export interface Envelope<T> { data: T }
export interface PaginatedEnv<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
}
