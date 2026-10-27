import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  clearAuthCookies,
  REFRESH_COOKIE_NAME,
  verifyRefreshToken,
  hashToken,
} from '@/lib/auth';

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const rawRefreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (rawRefreshToken) {
      const payload = await verifyRefreshToken(rawRefreshToken);
      if (payload?.userId) {
        const hashed = hashToken(rawRefreshToken);
        // Revocar token en el registro de usuario
        await prisma.user.updateMany({
          where: { id: payload.userId },
          data: { refreshToken: null },
        });

        // Marcar token como revocado en la tabla de refresh_tokens
        await prisma.refreshToken.updateMany({
          where: { tokenHash: hashed },
          data: { isRevoked: true },
        });

        // Registrar cierre de sesión en auditoría
        await prisma.auditLog.create({
          data: {
            userId: payload.userId,
            action: 'LOGOUT',
            entity: 'User',
            entityId: payload.userId,
            details: 'Cierre de sesión y revocación de tokens completada',
          },
        });
      }
    }

    // Limpiar cookies HTTP-only del navegador
    await clearAuthCookies();

    return NextResponse.json({
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Limpiar cookies de todas formas para proteger al usuario
    await clearAuthCookies();
    return NextResponse.json(
      { message: 'Sesión cerrada' },
      { status: 200 }
    );
  }
}
