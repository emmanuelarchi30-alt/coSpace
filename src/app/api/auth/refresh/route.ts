import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  verifyRefreshToken,
} from '@/lib/auth';

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const rawRefreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (!rawRefreshToken) {
      return NextResponse.json(
        { error: 'No se proporcionó token de renovación' },
        { status: 401 }
      );
    }

    // Verificar firma y tiempo de expiración del token
    const payload = await verifyRefreshToken(rawRefreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token de renovación inválido o expirado' },
        { status: 401 }
      );
    }

    // Validar que el token coincida con el hash en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.refreshToken) {
      return NextResponse.json(
        { error: 'Sesión revocada o usuario no encontrado' },
        { status: 401 }
      );
    }

    const hashedIncoming = hashToken(rawRefreshToken);
    if (user.refreshToken !== hashedIncoming) {
      return NextResponse.json(
        { error: 'Token de renovación revocado o reemplazado' },
        { status: 401 }
      );
    }

    // Generar nuevo par de tokens (Rotación de tokens)
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newAccessToken = await generateAccessToken(tokenPayload);
    const newRefreshToken = await generateRefreshToken(tokenPayload);
    const hashedNew = hashToken(newRefreshToken);

    // Actualizar hash en usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedNew },
    });

    // Marcar token anterior como revocado y registrar el nuevo
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashedIncoming },
      data: { isRevoked: true },
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashedNew,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Registrar rotación en auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TOKEN_REFRESH',
        entity: 'RefreshToken',
        entityId: user.id,
        details: 'Rotación periódica de tokens de acceso y refresco',
      },
    });

    // Actualizar cookies HTTP-only
    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json({
      message: 'Token renovado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    return NextResponse.json(
      { error: 'Error interno al renovar sesión' },
      { status: 500 }
    );
  }
}
