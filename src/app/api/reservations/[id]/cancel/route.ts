import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateCancellation } from '@/lib/businessRules';
import { ReservationStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        space: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // Validate cancellation rules (Rules 9, 10, 14)
    const validation = validateCancellation(
      reservation,
      session.userId,
      session.role,
      new Date()
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: validation.statusCode || 400 }
      );
    }

    // Rule 11: Cancelling changes status to CANCELLED. Record is NOT deleted.
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        space: {
          select: {
            name: true,
            type: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Reserva cancelada exitosamente',
      reservation: updated,
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al cancelar la reserva' },
      { status: 500 }
    );
  }
}
