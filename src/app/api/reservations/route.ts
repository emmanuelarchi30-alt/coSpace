import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ReservationStatus, Role } from '@prisma/client';
import {
  calculateTotalPrice,
  validateBookingWindow,
  validateDurationAndHours,
  validateOperatingHours,
  validateSpaceActive,
  validateSpaceOverlap,
  validateUserMaxFutureReservations,
  validateUserOverlap,
} from '@/lib/businessRules';

const reservationCreateSchema = z.object({
  spaceId: z.string().min(1, 'El ID del espacio es obligatorio'),
  startTime: z.string().datetime('Formato ISO de fecha y hora de inicio inválido'),
  endTime: z.string().datetime('Formato ISO de fecha y hora de fin inválido'),
  idempotencyKey: z.string().optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const viewAll = searchParams.get('all') === 'true' && session.role === Role.ADMIN;

    // Rule 14: Standard users can only view their own reservations
    const whereClause = viewAll
      ? {}
      : { userId: session.userId };

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        space: {
          select: {
            id: true,
            name: true,
            type: true,
            imageUrl: true,
            location: true,
            pricePerHour: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar las reservas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para realizar una reserva' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reservationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de reserva incompletos o inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { spaceId, idempotencyKey } = parsed.data;
    const startTime = new Date(parsed.data.startTime);
    const endTime = new Date(parsed.data.endTime);
    const now = new Date();

    // Idempotency check (Extra Credit)
    if (idempotencyKey) {
      const existing = await prisma.reservation.findUnique({
        where: { idempotencyKey },
        include: { space: true },
      });
      if (existing) {
        return NextResponse.json(
          { message: 'Reserva previamente procesada (idempotencia)', reservation: existing },
          { status: 200 }
        );
      }
    }

    // 1. Validate space exists and is active (Rule 7 & 12)
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
    });
    const spaceValidation = validateSpaceActive(space);
    if (!spaceValidation.valid || !space) {
      return NextResponse.json(
        { error: spaceValidation.message },
        { status: spaceValidation.statusCode || 400 }
      );
    }

    // 2. Validate duration and exact whole hours (Rule 1)
    const durationValidation = validateDurationAndHours(startTime, endTime);
    if (!durationValidation.valid) {
      return NextResponse.json(
        { error: durationValidation.message },
        { status: durationValidation.statusCode || 400 }
      );
    }

    // 3. Validate operating hours (7:00 to 21:00) (Rule 2)
    const operatingHoursValidation = validateOperatingHours(startTime, endTime);
    if (!operatingHoursValidation.valid) {
      return NextResponse.json(
        { error: operatingHoursValidation.message },
        { status: operatingHoursValidation.statusCode || 400 }
      );
    }

    // 4. Validate booking window (not in past, not > 30 days) (Rule 3)
    const windowValidation = validateBookingWindow(startTime, now);
    if (!windowValidation.valid) {
      return NextResponse.json(
        { error: windowValidation.message },
        { status: windowValidation.statusCode || 400 }
      );
    }

    // 5. Validate user maximum 3 future confirmed reservations (Rule 6)
    const maxFutureValidation = await validateUserMaxFutureReservations(session.userId, now);
    if (!maxFutureValidation.valid) {
      return NextResponse.json(
        { error: maxFutureValidation.message },
        { status: maxFutureValidation.statusCode || 400 }
      );
    }

    // 6. Validate space overlap (Rule 4)
    const spaceOverlapValidation = await validateSpaceOverlap(spaceId, startTime, endTime);
    if (!spaceOverlapValidation.valid) {
      return NextResponse.json(
        { error: spaceOverlapValidation.message },
        { status: spaceOverlapValidation.statusCode || 409 }
      );
    }

    // 7. Validate user overlap across any space (Rule 5)
    const userOverlapValidation = await validateUserOverlap(session.userId, startTime, endTime);
    if (!userOverlapValidation.valid) {
      return NextResponse.json(
        { error: userOverlapValidation.message },
        { status: userOverlapValidation.statusCode || 409 }
      );
    }

    // 8. Server calculates total price: hours * space.pricePerHour (Rule 8)
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalPrice = calculateTotalPrice(durationHours, Number(space.pricePerHour));

    // Create reservation in transaction with confirmed status
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.userId,
        spaceId,
        startTime,
        endTime,
        hours: durationHours,
        totalPrice,
        status: ReservationStatus.CONFIRMED,
        idempotencyKey: idempotencyKey || null,
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            type: true,
            imageUrl: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Reserva confirmada con éxito',
        reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la reserva' },
      { status: 500 }
    );
  }
}
