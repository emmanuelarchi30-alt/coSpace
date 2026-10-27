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

    // Verify token signature and expiration
    const payload = await verifyRefreshToken(rawRefreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token de renovación inválido o expirado' },
        { status: 401 }
      );
    }

    // Validate that the hashed token in database matches (revocation check)
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

    // Generate new Access and Refresh tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newAccessToken = await generateAccessToken(tokenPayload);
    const newRefreshToken = await generateRefreshToken(tokenPayload);

    // Update hashed refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashToken(newRefreshToken) },
    });

    // Update HTTP-only cookies
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
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Error interno al renovar sesión' },
      { status: 500 }
    );
  }
}
