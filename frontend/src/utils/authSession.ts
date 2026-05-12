/**
 * ============================================================
 * AUTH SESSION UTILITY
 * ============================================================
 * Purpose: Manages client-side authentication state including
 * token storage, user data persistence, and session lifecycle.
 * ============================================================
 */

const TOKEN_KEY = 'nlg_auth_token';
const USER_KEY = 'nlg_auth_user';

/**
 * Persist session data after login/register
 */
export function persistSession(token: string, user: { id: number; name: string; phone: string; role?: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored JWT token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user object
 */
export function getStoredUser(): { id: number; name: string; phone: string; role?: string } | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Clear session data (logout)
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
