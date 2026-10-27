import { describe, it } from 'node:test';
import assert from 'node:assert';

interface MockRecord {
  key: string;
  route: string;
  userId?: string | null;
  statusCode: number;
  response: unknown;
  expiresAt: Date;
}

// Simulador de almacenamiento de idempotencia en memoria
class MemoryIdempotencyStore {
  private records = new Map<string, MockRecord>();

  public save(
    key: string,
    route: string,
    statusCode: number,
    response: unknown,
    userId?: string,
    ttlHours: number = 24
  ): void {
    this.records.set(key, {
      key,
      route,
      userId: userId ?? null,
      statusCode,
      response,
      expiresAt: new Date(Date.now() + ttlHours * 3600 * 1000),
    });
  }

  public check(key: string, route: string, userId?: string): { isCached: boolean; statusCode: number; data: unknown } | null {
    const record = this.records.get(key);
    if (!record) return null;
    if (new Date() > record.expiresAt) return null;
    if (record.route !== route) return null;
    if (userId && record.userId && record.userId !== userId) return null;

    return {
      isCached: true,
      statusCode: record.statusCode,
      data: record.response,
    };
  }
}

describe('Idempotency Storage & Cache Replay Tests', () => {
  it('Debe almacenar la primera respuesta y retornarla en peticiones duplicadas con la misma clave', () => {
    const store = new MemoryIdempotencyStore();
    const key = 'req-123456';
    const payload = { reservationId: 'res-999', status: 'CONFIRMED', totalPrice: 80 };

    // Primera ejecución (sin caché previo)
    const initialCheck = store.check(key, '/api/reservations', 'user-1');
    assert.strictEqual(initialCheck, null);

    // Guardar respuesta de la primera ejecución
    store.save(key, '/api/reservations', 201, payload, 'user-1');

    // Segunda ejecución (reintento del cliente con la misma clave)
    const replayCheck = store.check(key, '/api/reservations', 'user-1');
    assert.ok(replayCheck !== null);
    assert.strictEqual(replayCheck.isCached, true);
    assert.strictEqual(replayCheck.statusCode, 201);
    assert.deepStrictEqual(replayCheck.data, payload);
  });

  it('No debe retornar caché si la ruta no coincide', () => {
    const store = new MemoryIdempotencyStore();
    const key = 'req-abc';
    store.save(key, '/api/reservations', 201, { ok: true }, 'user-1');

    const result = store.check(key, '/api/payments', 'user-1');
    assert.strictEqual(result, null);
  });

  it('No debe retornar caché si otro usuario intenta suplantar la misma clave', () => {
    const store = new MemoryIdempotencyStore();
    const key = 'req-secret-key';
    store.save(key, '/api/reservations', 201, { ok: true }, 'user-1');

    const result = store.check(key, '/api/reservations', 'user-2');
    assert.strictEqual(result, null);
  });

  it('Debe invalidar la clave si el tiempo de vida (TTL) ha expirado', () => {
    const store = new MemoryIdempotencyStore();
    const key = 'req-expired';
    // TTL negativo para simular expiración inmediata
    store.save(key, '/api/reservations', 201, { ok: true }, 'user-1', -1);

    const result = store.check(key, '/api/reservations', 'user-1');
    assert.strictEqual(result, null);
  });
});
