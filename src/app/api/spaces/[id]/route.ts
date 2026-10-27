import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role, SpaceType } from '@prisma/client';
import { validateSpaceDeactivation } from '@/lib/businessRules';

const spaceUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  type: z.nativeEnum(SpaceType).optional(),
  capacity: z.number().int().positive().optional(),
  pricePerHour: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  location: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 });
    }

    // Si el espacio está desactivado, únicamente el administrador puede consultarlo directamente
    if (!space.isActive) {
      const session = await getSession();
      if (session?.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Espacio no disponible o desactivado' }, { status: 404 });
      }
    }

    return NextResponse.json({ space });
  } catch (error) {
    console.error('Error al consultar detalle del espacio:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar el espacio' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado: solo administradores pueden editar espacios' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = spaceUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de actualización inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const existingSpace = await prisma.space.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 });
    }

    // Si se está desactivando el espacio, verificar la Regla 13 (no debe tener reservas futuras)
    if (parsed.data.isActive === false && existingSpace.isActive === true) {
      const deactivationValidation = await validateSpaceDeactivation(id);
      if (!deactivationValidation.valid) {
        return NextResponse.json(
          { error: deactivationValidation.message },
          { status: deactivationValidation.statusCode || 409 }
        );
      }
    }

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: parsed.data,
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'SPACE_UPDATED',
        entity: 'Space',
        entityId: id,
        details: `Espacio editado por administrador: ${updatedSpace.name}`,
      },
    });

    return NextResponse.json({
      message: 'Espacio actualizado exitosamente',
      space: updatedSpace,
    });
  } catch (error) {
    console.error('Error al actualizar el espacio:', error);
    return NextResponse.json(
      { error: 'Error interno al actualizar el espacio' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado: solo administradores pueden cambiar el estado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const isActive = Boolean(body.isActive);

    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 });
    }

    // Regla 13: No se puede desactivar un espacio que tenga reservas futuras confirmadas
    if (!isActive && space.isActive) {
      const deactivationValidation = await validateSpaceDeactivation(id);
      if (!deactivationValidation.valid) {
        return NextResponse.json(
          { error: deactivationValidation.message },
          { status: deactivationValidation.statusCode || 409 }
        );
      }
    }

    const updated = await prisma.space.update({
      where: { id },
      data: { isActive },
    });

    // Registrar cambio de estado en auditoría
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: isActive ? 'SPACE_ACTIVATED' : 'SPACE_DEACTIVATED',
        entity: 'Space',
        entityId: id,
        details: `Estado del espacio cambiado a ${isActive ? 'Activo' : 'Desactivado'}`,
      },
    });

    return NextResponse.json({
      message: isActive ? 'Espacio activado exitosamente' : 'Espacio desactivado exitosamente',
      space: updated,
    });
  } catch (error) {
    console.error('Error al cambiar estado del espacio:', error);
    return NextResponse.json(
      { error: 'Error interno al cambiar el estado del espacio' },
      { status: 500 }
    );
  }
}
