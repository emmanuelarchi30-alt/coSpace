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

    // Validar reglas de negocio para cancelación (Reglas 9, 10, 14)
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

    // Regla 11: Cancelar cambia el estado a CANCELLED. El registro NO se elimina.
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

    // Actualizar estado del pago a reembolsado
    await prisma.payment.updateMany({
      where: { reservationId: id },
      data: { status: 'REFUNDED' },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        reservationId: id,
        action: 'RESERVATION_CANCELLED',
        entity: 'Reservation',
        entityId: id,
        details: `Reserva cancelada por el usuario ${session.email}`,
      },
    });

    return NextResponse.json({
      message: 'Reserva cancelada exitosamente',
      reservation: updated,
    });
  } catch (error) {
    console.error('Error al cancelar la reserva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al cancelar la reserva' },
      { status: 500 }
    );
  }
}

// Permitir tanto PATCH como POST para cancelación (compatibilidad con clientes y pruebas automatizadas)
export const POST = PATCH;
