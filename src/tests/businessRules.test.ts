import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateTotalPrice,
  validateBookingWindow,
  validateCancellation,
  validateDurationAndHours,
  validateOperatingHours,
  validateSpaceActive,
} from '../lib/businessRules';
import { ReservationStatus, Role, SpaceType } from '@prisma/client';

describe('CoSpace Business Rules Unit Tests', () => {
  // Rule 1: Duration 1 to 4 hours in whole hours
  it('Rule 1: Should approve whole hour reservations between 1 and 4 hours', () => {
    const start = new Date(2026, 10, 15, 10, 0, 0);
    const end = new Date(2026, 10, 15, 12, 0, 0); // 2 hours
    const result = validateDurationAndHours(start, end);
    assert.strictEqual(result.valid, true);
  });

  it('Rule 1: Should reject fractional hour reservations (e.g. 10:30 to 11:45)', () => {
    const start = new Date(2026, 10, 15, 10, 30, 0);
    const end = new Date(2026, 10, 15, 11, 45, 0);
    const result = validateDurationAndHours(start, end);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  it('Rule 1: Should reject reservations longer than 4 hours', () => {
    const start = new Date(2026, 10, 15, 10, 0, 0);
    const end = new Date(2026, 10, 15, 15, 0, 0); // 5 hours
    const result = validateDurationAndHours(start, end);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  // Rule 2: Operating hours between 7:00 and 21:00
  it('Rule 2: Should approve reservations within 7:00 to 21:00', () => {
    const start = new Date(2026, 10, 15, 7, 0, 0);
    const end = new Date(2026, 10, 15, 9, 0, 0);
    const result = validateOperatingHours(start, end);
    assert.strictEqual(result.valid, true);
  });

  it('Rule 2: Should reject reservations before 7:00 AM', () => {
    const start = new Date(2026, 10, 15, 6, 0, 0);
    const end = new Date(2026, 10, 15, 8, 0, 0);
    const result = validateOperatingHours(start, end);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  it('Rule 2: Should reject reservations ending after 21:00', () => {
    const start = new Date(2026, 10, 15, 20, 0, 0);
    const end = new Date(2026, 10, 15, 22, 0, 0); // ends at 22:00
    const result = validateOperatingHours(start, end);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  // Rule 3: Cannot book in past or > 30 days in advance
  it('Rule 3: Should reject past reservations', () => {
    const now = new Date(2026, 10, 15, 12, 0, 0);
    const startInPast = new Date(2026, 10, 15, 10, 0, 0);
    const result = validateBookingWindow(startInPast, now);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  it('Rule 3: Should reject reservations more than 30 days ahead', () => {
    const now = new Date(2026, 10, 15, 12, 0, 0);
    const start35Days = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
    const result = validateBookingWindow(start35Days, now);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  // Rule 7 & 12: Cannot book deactivated space
  it('Rule 7: Should reject booking on a deactivated space', () => {
    const inactiveSpace = {
      id: 'space_1',
      name: 'Cabina 1',
      description: 'Desc',
      type: SpaceType.CABIN,
      capacity: 1,
      pricePerHour: 20 as unknown as import('@prisma/client/runtime/library').Decimal,
      imageUrl: 'https://...',
      location: 'Piso 1',
      amenities: [],
      isActive: false, // Deactivated!
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = validateSpaceActive(inactiveSpace);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  // Rule 8: Server calculates total price: hours * pricePerHour
  it('Rule 8: Should correctly compute price from hours * pricePerHour', () => {
    const price = calculateTotalPrice(3, 25.5);
    assert.strictEqual(price, 76.5);
  });

  // Rule 9 & 10: Cancellation authorization and 2-hour deadline
  it('Rule 10: Should reject user cancellation when less than 2 hours before start', () => {
    const now = new Date(2026, 10, 15, 10, 0, 0);
    const reservation = {
      userId: 'user_123',
      startTime: new Date(2026, 10, 15, 11, 0, 0), // Only 1 hour before start!
      status: ReservationStatus.CONFIRMED,
    };
    const result = validateCancellation(reservation, 'user_123', Role.USER, now);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 400);
  });

  it('Rule 10: Should allow user cancellation when more than 2 hours before start', () => {
    const now = new Date(2026, 10, 15, 10, 0, 0);
    const reservation = {
      userId: 'user_123',
      startTime: new Date(2026, 10, 15, 14, 0, 0), // 4 hours before start!
      status: ReservationStatus.CONFIRMED,
    };
    const result = validateCancellation(reservation, 'user_123', Role.USER, now);
    assert.strictEqual(result.valid, true);
  });

  it('Rule 9: Should allow Admin to cancel even within 2 hours', () => {
    const now = new Date(2026, 10, 15, 10, 0, 0);
    const reservation = {
      userId: 'user_123',
      startTime: new Date(2026, 10, 15, 10, 30, 0), // 30 mins before start
      status: ReservationStatus.CONFIRMED,
    };
    const result = validateCancellation(reservation, 'admin_999', Role.ADMIN, now);
    assert.strictEqual(result.valid, true);
  });

  it('Rule 14: Should prevent unauthorized user from cancelling another user reservation', () => {
    const now = new Date(2026, 10, 15, 10, 0, 0);
    const reservation = {
      userId: 'user_123',
      startTime: new Date(2026, 10, 15, 16, 0, 0),
      status: ReservationStatus.CONFIRMED,
    };
    // Another user tries to cancel
    const result = validateCancellation(reservation, 'user_456', Role.USER, now);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.statusCode, 403);
  });
});
