const API_BASE_URL = 'http://localhost:3001';
const AUTH_STORAGE_KEY = 'crm-auth';

export const UNAUTHORIZED_EVENT = 'crm:unauthorized';

export interface StoredAuth {
  token: string;
  username: string;
  expiresAt: number;
}

interface ApiError {
  success: false;
  result: { message: string };
}

interface ApiSuccess<T> {
  success: true;
  result: T;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export function readStoredAuth(): StoredAuth | null {
  const serializedAuth = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!serializedAuth) return null;

  const auth = JSON.parse(serializedAuth) as Partial<StoredAuth>;
  if (
    typeof auth.token !== 'string'
    || typeof auth.username !== 'string'
    || typeof auth.expiresAt !== 'number'
    || auth.expiresAt <= Date.now()
  ) {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }

  return { token: auth.token, username: auth.username, expiresAt: auth.expiresAt };
}

export function storeAuth(auth: StoredAuth): void {
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  authenticated = false
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const auth = readStoredAuth();
    if (auth) headers.set('Authorization', `Bearer ${auth.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const body = await response.json() as ApiResponse<T>;

  if (authenticated && response.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok || !body.success) {
    const message = body.success ? `Request failed (${response.status})` : body.result.message;
    throw new ApiRequestError(message, response.status);
  }

  return body.result;
}
