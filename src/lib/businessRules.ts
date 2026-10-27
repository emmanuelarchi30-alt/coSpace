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
 * Regla 1: Valida la duración de la reserva:
 * 1. Debe ser en horas completas exactas (por ejemplo: de 10:00 a 12:00, no de 10:30 a 11:45).
 * 2. La duración debe estar entre 1 y 4 horas completas.
 */
export function validateDurationAndHours(start: Date, end: Date): BusinessRuleValidationResult {
  // Comprobación de horas completas exactas (minutos, segundos y milisegundos en 0)
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
 * Regla 2: Valida el horario de operación permitido:
 * Solo se puede reservar entre las 7:00 y las 21:00.
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

  // Si finaliza a las 21:00 es válido; si excede las 21:00 es inválido
  if (endHour > 21 || (endHour === 21 && (end.getMinutes() > 0 || end.getSeconds() > 0))) {
    return {
      valid: false,
      message: 'Las reservas deben finalizar a más tardar a las 21:00.',
      statusCode: 400,
    };
  }

  // Debe ser en el mismo día del calendario
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
 * Regla 3: Valida la ventana temporal de reserva:
 * No se puede reservar en el pasado ni con más de 30 días de anticipación.
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
 * Regla 6: Comprueba que el usuario no exceda el límite de 3 reservas futuras confirmadas.
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
 * Regla 4: Valida solapamiento en el espacio:
 * Dos reservas confirmadas no pueden solaparse en el mismo espacio.
 * Condición de solapamiento: inicio < finExistente && fin > inicioExistente
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
      statusCode: 409,
    };
  }

  return { valid: true };
}

/**
 * Regla 5: Valida solapamiento del usuario:
 * Un usuario no puede tener dos reservas confirmadas que se solapen en el tiempo,
 * incluso si corresponden a espacios diferentes.
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
      statusCode: 409,
    };
  }

  return { valid: true };
}

/**
 * Regla 7: Valida disponibilidad y estado activo del espacio:
 * No se puede reservar un espacio desactivado.
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
 * Regla 8: El servidor calcula el precio total:
 * horas * precioPorHora. Nunca se acepta desde el cliente.
 */
export function calculateTotalPrice(hours: number, pricePerHour: number): number {
  return Number((hours * pricePerHour).toFixed(2));
}

/**
 * Reglas 9, 10 y 14: Valida reglas de cancelación:
 * - Solo el dueño de la reserva o un administrador puede cancelarla.
 * - Los usuarios estándar solo pueden cancelar hasta 2 horas antes del inicio.
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

  // Regla 9 y 14: Solo el dueño de la reserva o un administrador puede cancelarla
  const isOwner = reservation.userId === currentUserId;
  const isAdmin = currentUserRole === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    return {
      valid: false,
      message: 'No tienes autorización para cancelar esta reserva.',
      statusCode: 403,
    };
  }

  // Regla 10: Los usuarios estándar pueden cancelar hasta 2 horas antes del inicio
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
 * Regla 13: No se puede desactivar un espacio que tenga reservas futuras confirmadas.
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
