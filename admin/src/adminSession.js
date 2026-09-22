/**
 * ============================================================
 * ADMIN SESSION
 * ============================================================
 * Holds the signed token returned by /api/auth/login.
 *
 * The role kept here only decides which buttons are drawn. Every
 * admin route re-checks the role from the token on the server, so
 * editing this value in the browser grants nothing.
 * ============================================================
 */

import axios from 'axios';

const TOKEN_KEY = 'nlg_admin_token';
const NAME_KEY = 'nlg_admin';
const ROLE_KEY = 'nlg_admin_role';

export function applyAuthHeader(token) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
}

export function saveSession({ token, name, role }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(ROLE_KEY, role);
  applyAuthHeader(token);
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getAdminName = () => localStorage.getItem(NAME_KEY) || 'Admin';
export const isSuperAdmin = () => localStorage.getItem(ROLE_KEY) === 'super';

export function clearSession() {
  [TOKEN_KEY, NAME_KEY, ROLE_KEY].forEach((k) => localStorage.removeItem(k));
  applyAuthHeader(null);
}

/**
 * Signs the admin out as soon as the API rejects the token, so an
 * expired session shows the login screen instead of silent failures.
 */
export function installAuthExpiryHandler() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if ([401, 403].includes(error?.response?.status)) {
        clearSession();
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
}
