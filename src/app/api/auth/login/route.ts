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

    // Control de límite de intentos (Seguridad y puntos extra)
    const rateLimit = checkRateLimit(rateLimitIdentifier, 15, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Por favor espera ${rateLimit.resetInSeconds} segundos antes de volver a intentar.`,
        },
        { status: 429 }
      );
    }

    // Buscar usuario en la base de datos de Supabase
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña con hash seguro bcrypt
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Restablecer contador de intentos tras autenticación exitosa
    resetRateLimit(rateLimitIdentifier);

    // Generar Access Token (15m) y Refresh Token (7d)
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);
    const hashedRefresh = hashToken(refreshToken);

    // Almacenar el token hasheado en el usuario y en la tabla de refresh_tokens
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashedRefresh,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Registrar evento de seguridad en la tabla de auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `Inicio de sesión exitoso desde ${ip}`,
      },
    });

    // Configurar cookies seguras HTTP-only (sin exponer tokens en el body)
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
    console.error('Error de autenticación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el inicio de sesión' },
      { status: 500 }
    );
  }
}
