/**
 * Utilidades para la gestión de consentimiento de cookies, almacenamiento seguro de credenciales
 * y ciclo de vida de sesión por pestaña en CoSpace.
 */

export const COOKIE_CONSENT_KEY = 'cospace_cookie_consent';
export const COOKIE_SAVED_EMAIL_KEY = 'cospace_saved_email';
export const SESSION_TAB_ACTIVE_KEY = 'cospace_tab_active_session';
export const COOKIE_CONSENT_EVENT = 'cospace_cookie_consent_changed';

export type CookieConsentStatus = 'accepted' | 'declined' | 'unset';

/**
 * Obtener el estado actual de consentimiento de cookies desde localStorage
 */
export function getCookieConsentStatus(): CookieConsentStatus {
  if (typeof window === 'undefined') return 'unset';
  const val = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (val === 'accepted') return 'accepted';
  if (val === 'declined') return 'declined';
  return 'unset';
}

/**
 * Establecer y persistir el consentimiento de cookies
 */
export function setCookieConsentStatus(accepted: boolean): void {
  if (typeof window === 'undefined') return;
  const status: CookieConsentStatus = accepted ? 'accepted' : 'declined';
  localStorage.setItem(COOKIE_CONSENT_KEY, status);

  // Escribir cookie para disponibilidad cliente/servidor
  const maxAge = accepted ? 60 * 60 * 24 * 365 : 0;
  document.cookie = `cospace_cookies_accepted=${accepted ? 'true' : 'false'}; path=/; max-age=${maxAge}; SameSite=Lax`;

  if (!accepted) {
    // Si rechaza, eliminar credenciales previamente guardadas
    clearSavedEmail();
  }

  // Notificar a componentes en tiempo real
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { status } }));
}

/**
 * Obtener el correo recordado si las cookies fueron aceptadas
 */
export function getSavedEmail(): string {
  if (typeof window === 'undefined') return '';
  if (getCookieConsentStatus() !== 'accepted') return '';
  return localStorage.getItem(COOKIE_SAVED_EMAIL_KEY) || '';
}

/**
 * Guardar el correo para recordar datos de inicio de sesión
 */
export function saveUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  // Solo se guarda si el usuario aceptó cookies
  if (getCookieConsentStatus() === 'accepted' && email.trim()) {
    localStorage.setItem(COOKIE_SAVED_EMAIL_KEY, email.trim().toLowerCase());
    document.cookie = `cospace_saved_email=${encodeURIComponent(email.trim().toLowerCase())}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }
}

/**
 * Eliminar el correo recordado
 */
export function clearSavedEmail(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COOKIE_SAVED_EMAIL_KEY);
  document.cookie = 'cospace_saved_email=; path=/; max-age=0; SameSite=Lax';
}

/**
 * Verificar si la pestaña actual tiene una sesión activa registrada
 */
export function isTabSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_TAB_ACTIVE_KEY) === 'true';
}

/**
 * Marcar la pestaña actual con sesión activa al iniciar sesión
 */
export function markTabSessionActive(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_TAB_ACTIVE_KEY, 'true');
}

/**
 * Limpiar la marca de sesión activa de la pestaña al cerrar sesión
 */
export function clearTabSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_TAB_ACTIVE_KEY);
}
