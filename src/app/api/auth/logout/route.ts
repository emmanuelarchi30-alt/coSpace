import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  clearAuthCookies,
  REFRESH_COOKIE_NAME,
  verifyRefreshToken,
} from '@/lib/auth';

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const rawRefreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (rawRefreshToken) {
      const payload = await verifyRefreshToken(rawRefreshToken);
      if (payload?.userId) {
        // Revoke stored refresh token in database
        await prisma.user.updateMany({
          where: { id: payload.userId },
          data: { refreshToken: null },
        });
      }
    }

    // Clear HTTP-only cookies
    await clearAuthCookies();

    return NextResponse.json({
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if DB call failed
    await clearAuthCookies();
    return NextResponse.json(
      { message: 'Sesión cerrada' },
      { status: 200 }
    );
  }
}
