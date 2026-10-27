import { ReservationStatus, Role, Space } from '@prisma/client';
import prisma from './prisma';

export interface BusinessRuleValidationResult {
  valid: boolean;
  message?: string;
  statusCode?: number;
}

export interface ReservationParams {
  userId: string;
  spaceId: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Validates reservation duration:
 * 1. Must be exact whole hours (e.g. 10:00 to 12:00, not 10:30 to 11:45)
 * 2. Duration must be between 1 and 4 hours
 */
export function validateDurationAndHours(start: Date, end: Date): BusinessRuleValidationResult {
  // Check exact whole hours (minutes, seconds, ms must be 0)
  if (
    start.getMinutes() !== 0 ||
    start.getSeconds() !== 0 ||
    start.getMilliseconds() !== 0 ||
    end.getMinutes() !== 0 ||
    end.getSeconds() !== 0 ||
    end.getMilliseconds() !== 0
  ) {
    return {
      valid: false,
      message: 'Las reservas deben realizarse en horas completas en punto (por ejemplo, de 10:00 a 12:00, sin minutos intermedios).',
      statusCode: 400,
    };
  }

  const durationMs = end.getTime() - start.getTime();
  const hours = durationMs / (1000 * 60 * 60);

  if (hours < 1 || hours > 4 || !Number.isInteger(hours)) {
    return {
      valid: false,
      message: 'Una reserva debe durar entre 1 y 4 horas completas.',
      statusCode: 400,
    };
  }

  return { valid: true };
}

/**
 * Validates allowed operating hours:
 * Must be between 7:00 and 21:00.
 */
export function validateOperatingHours(start: Date, end: Date): BusinessRuleValidationResult {
  const startHour = start.getHours();
  const endHour = end.getHours();

  if (startHour < 7 || startHour >= 21) {
    return {
      valid: false,
      message: 'El horario de reservas es exclusivamente entre las 7:00 y las 21:00.',
      statusCode: 400,
    };
  }

  // If end is at 21:00, that's valid. If end hour > 21 or past 21:00, invalid.
  if (endHour > 21 || (endHour === 21 && (end.getMinutes() > 0 || end.getSeconds() > 0))) {
    return {
      valid: false,
      message: 'Las reservas deben finalizar a más tardar a las 21:00.',
      statusCode: 400,
    };
  }

  // Must be on the same calendar day
  if (
    start.getFullYear() !== end.getFullYear() ||
    start.getMonth() !== end.getMonth() ||
    start.getDate() !== end.getDate()
  ) {
    return {
      valid: false,
      message: 'La reserva debe iniciar y terminar el mismo día dentro del horario hábil.',
      statusCode: 400,
    };
  }

  return { valid: true };
}

/**
 * Validates advance booking window:
 * Cannot be in the past or more than 30 days in advance.
 */
export function validateBookingWindow(start: Date, now: Date = new Date()): BusinessRuleValidationResult {
  if (start.getTime() <= now.getTime()) {
    return {
      valid: false,
      message: 'No se puede reservar en el pasado ni en el momento exacto actual.',
      statusCode: 400,
    };
  }

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (start.getTime() > now.getTime() + thirtyDaysMs) {
    return {
      valid: false,
      message: 'No se puede reservar con más de 30 días de anticipación.',
      statusCode: 400,
    };
  }

  return { valid: true };
}

/**
 * Checks if a user has exceeded the limit of 3 future confirmed reservations.
 */
export async function validateUserMaxFutureReservations(
  userId: string,
  now: Date = new Date()
): Promise<BusinessRuleValidationResult> {
  const activeCount = await prisma.reservation.count({
    where: {
      userId,
      status: ReservationStatus.CONFIRMED,
      endTime: { gt: now },
    },
  });

  if (activeCount >= 3) {
    return {
      valid: false,
      message: 'Un usuario puede tener un máximo de 3 reservas futuras confirmadas al mismo tiempo.',
      statusCode: 400,
    };
  }

  return { valid: true };
}

/**
 * Checks for space overlap:
 * Two confirmed reservations cannot overlap in the same space.
 * Overlap condition: start < existingEnd && end > existingStart
 */
export async function validateSpaceOverlap(
  spaceId: string,
  start: Date,
  end: Date
): Promise<BusinessRuleValidationResult> {
  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      spaceId,
      status: ReservationStatus.CONFIRMED,
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (overlappingReservation) {
    return {
      valid: false,
      message: 'El espacio ya cuenta con una reserva confirmada en el horario solicitado.',
      statusCode: 409, // Conflict
    };
  }

  return { valid: true };
}

/**
 * Checks for user overlap:
 * A user cannot have two overlapping confirmed reservations, even in different spaces.
 */
export async function validateUserOverlap(
  userId: string,
  start: Date,
  end: Date
): Promise<BusinessRuleValidationResult> {
  const overlappingUserReservation = await prisma.reservation.findFirst({
    where: {
      userId,
      status: ReservationStatus.CONFIRMED,
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (overlappingUserReservation) {
    return {
      valid: false,
      message: 'Ya tienes otra reserva confirmada que se solapa con este horario.',
      statusCode: 409, // Conflict
    };
  }

  return { valid: true };
}

/**
 * Validates space availability and active status.
 */
export function validateSpaceActive(space: Space | null): BusinessRuleValidationResult {
  if (!space) {
    return {
      valid: false,
      message: 'El espacio solicitado no existe.',
      statusCode: 404,
    };
  }

  if (!space.isActive) {
    return {
      valid: false,
      message: 'No se puede reservar un espacio que se encuentra desactivado.',
      statusCode: 400,
    };
  }

  return { valid: true };
}

/**
 * Server calculates total price:
 * hours * pricePerHour. Never accept from client!
 */
export function calculateTotalPrice(hours: number, pricePerHour: number): number {
  return Number((hours * pricePerHour).toFixed(2));
}

/**
 * Validates cancellation rules:
 * - Only the owner or an admin can cancel.
 * - Standard users can only cancel up to 2 hours before start time.
 */
export function validateCancellation(
  reservation: { userId: string; startTime: Date; status: ReservationStatus },
  currentUserId: string,
  currentUserRole: Role,
  now: Date = new Date()
): BusinessRuleValidationResult {
  if (reservation.status === ReservationStatus.CANCELLED) {
    return {
      valid: false,
      message: 'La reserva ya se encuentra cancelada.',
      statusCode: 400,
    };
  }

  // Rule 9: Only owner or admin can cancel
  const isOwner = reservation.userId === currentUserId;
  const isAdmin = currentUserRole === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    return {
      valid: false,
      message: 'No tienes autorización para cancelar esta reserva.',
      statusCode: 403,
    };
  }

  // Rule 10: Standard users can cancel up to 2 hours before start
  if (!isAdmin) {
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const timeUntilStart = reservation.startTime.getTime() - now.getTime();

    if (timeUntilStart < twoHoursMs) {
      return {
        valid: false,
        message: 'Solo puedes cancelar una reserva con al menos 2 horas de anticipación a su inicio.',
        statusCode: 400,
      };
    }
  }

  return { valid: true };
}

/**
 * Rule 13: Cannot deactivate a space that has future confirmed reservations.
 */
export async function validateSpaceDeactivation(
  spaceId: string,
  now: Date = new Date()
): Promise<BusinessRuleValidationResult> {
  const futureReservationsCount = await prisma.reservation.count({
    where: {
      spaceId,
      status: ReservationStatus.CONFIRMED,
      endTime: { gt: now },
    },
  });

  if (futureReservationsCount > 0) {
    return {
      valid: false,
      message: `No se puede desactivar el espacio porque tiene ${futureReservationsCount} reserva(s) futura(s) confirmada(s).`,
      statusCode: 409,
    };
  }

  return { valid: true };
}
