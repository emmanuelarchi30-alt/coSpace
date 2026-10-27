import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role, SpaceType } from '@prisma/client';

const spaceCreateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  type: z.nativeEnum(SpaceType),
  capacity: z.number().int().positive('La capacidad debe ser un número entero positivo'),
  pricePerHour: z.number().positive('El precio por hora debe ser positivo'),
  imageUrl: z.string().url('Debe ser una URL válida de imagen'),
  location: z.string().optional(),
  amenities: z.array(z.string()).min(1, 'Agrega al menos una comodidad o servicio'),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SpaceType | null;
    const includeInactive = searchParams.get('all') === 'true';

    let shouldShowAll = false;
    if (includeInactive) {
      const session = await getSession();
      if (session?.role === Role.ADMIN) {
        shouldShowAll = true;
      }
    }

    const whereClause: {
      type?: SpaceType;
      isActive?: boolean;
    } = {};

    if (type && Object.values(SpaceType).includes(type)) {
      whereClause.type = type;
    }

    if (!shouldShowAll) {
      whereClause.isActive = true; // Regla 12: Los espacios desactivados no aparecen en el catálogo público
    }

    const spaces = await prisma.space.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ spaces });
  } catch (error) {
    console.error('Error al consultar espacios:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar los espacios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validar autenticación y rol de administrador
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado: solo administradores pueden crear espacios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = spaceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos del espacio inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const space = await prisma.space.create({
      data: {
        ...parsed.data,
        pricePerHour: parsed.data.pricePerHour,
        isActive: true,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'SPACE_CREATED',
        entity: 'Space',
        entityId: space.id,
        details: `Nuevo espacio creado por administrador: ${space.name} (${space.type})`,
      },
    });

    return NextResponse.json(
      { message: 'Espacio creado exitosamente', space },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear el espacio:', error);
    return NextResponse.json(
      { error: 'Error interno al crear el espacio' },
      { status: 500 }
    );
  }
}
