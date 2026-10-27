import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  setAuthCookies,
  verifyPassword,
} from '@/lib/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de inicio de sesión inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const rateLimitIdentifier = `login:${ip}:${email.toLowerCase()}`;

    // Rate Limiting Check (Extra Points)
    const rateLimit = checkRateLimit(rateLimitIdentifier, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Por favor espera ${rateLimit.resetInSeconds} segundos antes de volver a intentar.`,
        },
        { status: 429 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful login
    resetRateLimit(rateLimitIdentifier);

    // Generate Access and Refresh Tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Store hashed refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashToken(refreshToken) },
    });

    // Set secure HTTP-only cookies (NO tokens in body)
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el inicio de sesión' },
      { status: 500 }
    );
  }
}
