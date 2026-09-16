export const AUTH_STORAGE_KEY = 'navastitva_auth_user_id';

export function getAuthHeaders(): Record<string, string> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
  return userId ? { 'x-user-id': userId } : {};
}

export async function apiFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
  if (!userId) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers || {});
  if (!headers.has('x-user-id')) {
    headers.set('x-user-id', userId);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
