import test, { describe } from 'node:test';
import assert from 'node:assert';

// Simulación de entorno de navegador (localStorage, sessionStorage, document.cookie)
class StorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

// Configurar mocks globales antes de importar el módulo
(globalThis as unknown as { localStorage: StorageMock }).localStorage = new StorageMock();
(globalThis as unknown as { sessionStorage: StorageMock }).sessionStorage = new StorageMock();
(globalThis as unknown as { document: { cookie: string } }).document = { cookie: '' };
(globalThis as unknown as { window: { dispatchEvent: () => boolean } }).window = {
  dispatchEvent: () => true,
};

import {
  getCookieConsentStatus,
  setCookieConsentStatus,
  getSavedEmail,
  saveUserEmail,
  clearSavedEmail,
  isTabSessionActive,
  markTabSessionActive,
  clearTabSession,
} from '../lib/cookieConsent';

describe('Gestión de Cookies y Ciclo de Vida de Sesión por Pestaña', () => {
  test('El consentimiento inicial debe ser "unset"', () => {
    globalThis.localStorage.clear();
    assert.strictEqual(getCookieConsentStatus(), 'unset');
  });

  test('setCookieConsentStatus(true) debe establecer el estado en "accepted"', () => {
    setCookieConsentStatus(true);
    assert.strictEqual(getCookieConsentStatus(), 'accepted');
  });

  test('No debe guardar el correo si el consentimiento de cookies no está aceptado', () => {
    globalThis.localStorage.clear();
    setCookieConsentStatus(false);
    assert.strictEqual(getCookieConsentStatus(), 'declined');

    saveUserEmail('usuario@cospace.com');
    assert.strictEqual(getSavedEmail(), '');
  });

  test('Debe guardar y recuperar el correo cuando el consentimiento está aceptado', () => {
    setCookieConsentStatus(true);
    saveUserEmail('demo@cospace.com');
    assert.strictEqual(getSavedEmail(), 'demo@cospace.com');
  });

  test('clearSavedEmail debe eliminar el correo guardado', () => {
    setCookieConsentStatus(true);
    saveUserEmail('admin@cospace.com');
    assert.strictEqual(getSavedEmail(), 'admin@cospace.com');

    clearSavedEmail();
    assert.strictEqual(getSavedEmail(), '');
  });

  test('Control de sesión de pestaña: inactiva al inicio, activa tras login, inactiva al cerrar', () => {
    globalThis.sessionStorage.clear();
    assert.strictEqual(isTabSessionActive(), false);

    markTabSessionActive();
    assert.strictEqual(isTabSessionActive(), true);

    clearTabSession();
    assert.strictEqual(isTabSessionActive(), false);
  });
});
