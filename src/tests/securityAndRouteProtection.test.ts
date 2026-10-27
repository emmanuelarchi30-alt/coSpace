import test, { describe } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit } from '../lib/rateLimit';
import {
  validateCancellation,
  calculateTotalPrice,
  validateDurationAndHours,
  validateOperatingHours,
  validateBookingWindow,
  validateSpaceActive,
} from '../lib/businessRules';
import { ReservationStatus, Role } from '@prisma/client';

describe('Auditoría de Seguridad y Protección de Rutas', () => {
  describe('Control de Ataques de Fuerza Bruta y Límite de Peticiones (Rate Limiting)', () => {
    test('Debe bloquear peticiones excesivas en Login tras alcanzar el límite', () => {
      const testIp = '192.168.1.100';
      const identifier = `login:${testIp}:attacker@test.com`;

      // Simular intentos hasta el límite permitido (5 intentos)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, 5, 60000);
        assert.strictEqual(result.success, true);
      }

      // El intento 6 debe ser bloqueado con error 429
      const blockedResult = checkRateLimit(identifier, 5, 60000);
      assert.strictEqual(blockedResult.success, false);
      assert.strictEqual(blockedResult.remaining, 0);
      assert.ok(blockedResult.resetInSeconds > 0);
    });

    test('Debe bloquear registros masivos (Sybil / Flooding) en Registro', () => {
      const testIp = '10.0.0.50';
      const identifier = `register:${testIp}`;

      // Simular 10 registros
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(identifier, 10, 60000);
        assert.strictEqual(result.success, true);
      }

      // El intento 11 debe ser denegado
      const blocked = checkRateLimit(identifier, 10, 60000);
      assert.strictEqual(blocked.success, false);
      assert.strictEqual(blocked.remaining, 0);
    });
  });

  describe('Prevención de Vulnerabilidades de Control de Acceso (IDOR y Escalación)', () => {
    test('Un usuario no puede cancelar la reserva de otro usuario (Prevención IDOR)', () => {
      const reservation = {
        userId: 'usuario_victima_123',
        startTime: new Date(Date.now() + 5 * 3600 * 1000), // En 5 horas
        status: ReservationStatus.CONFIRMED,
      };

      const attackerUserId = 'usuario_atacante_999';
      const result = validateCancellation(reservation, attackerUserId, Role.USER);

      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 403);
      assert.match(result.message || '', /No tienes autorización/);
    });

    test('El administrador sí tiene autorización legítima para cancelar cualquier reserva', () => {
      const reservation = {
        userId: 'usuario_cualquiera_456',
        startTime: new Date(Date.now() + 1 * 3600 * 1000), // En 1 hora (menos de 2h)
        status: ReservationStatus.CONFIRMED,
      };

      const adminUserId = 'admin_super_001';
      const result = validateCancellation(reservation, adminUserId, Role.ADMIN);

      assert.strictEqual(result.valid, true);
    });

    test('Un espacio desactivado es rechazado inmediatamente para cualquier reserva', () => {
      const inactiveSpace = {
        id: 'space_inactivo_1',
        name: 'Escritorio Oculto',
        description: 'Espacio en mantenimiento',
        type: 'DESK' as const,
        capacity: 1,
        pricePerHour: { toNumber: () => 15 } as unknown as import('@prisma/client/runtime/library').Decimal,
        imageUrl: 'https://example.com/img.jpg',
        location: 'Piso 2',
        amenities: ['Wifi'],
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateSpaceActive(inactiveSpace);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 400);
      assert.match(result.message || '', /desactivado/);
    });
  });

  describe('Integridad Financiera y Prevención de Manipulación de Precios (CWE-472)', () => {
    test('El precio total se calcula estrictamente en backend y no puede ser manipulado', () => {
      // 3 horas a $25.50/h = $76.50
      const calculated = calculateTotalPrice(3, 25.5);
      assert.strictEqual(calculated, 76.5);
      assert.strictEqual(typeof calculated, 'number');
    });
  });

  describe('Validación Estricta de Parámetros de Tiempo y Horarios de Negocio', () => {
    test('Rechaza reservas en el pasado o tiempos manipulados', () => {
      const pastStart = new Date(Date.now() - 3600 * 1000);
      const result = validateBookingWindow(pastStart);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 400);
    });

    test('Rechaza reservas fraccionarias o no enteras', () => {
      const start = new Date(2026, 9, 28, 10, 15, 0); // 10:15
      const end = new Date(2026, 9, 28, 12, 0, 0);   // 12:00
      const result = validateDurationAndHours(start, end);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 400);
    });

    test('Rechaza reservas fuera del horario permitido (7:00 a 21:00)', () => {
      const start = new Date(2026, 9, 28, 6, 0, 0); // 6:00 AM (antes de 7:00)
      const end = new Date(2026, 9, 28, 9, 0, 0);
      const result = validateOperatingHours(start, end);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 400);
    });
  });
});
