import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  hashToken,
  setAuthCookies,
} from '@/lib/auth';
import { Role } from '@prisma/client';
import { checkRateLimit } from '@/lib/rateLimit';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Demasiados intentos de registro. Por favor espera ${rateLimit.resetInSeconds} segundos antes de volver a intentar.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validación fallida', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Verificar si el correo ya se encuentra registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya se encuentra registrado' },
        { status: 409 }
      );
    }

    // Hashear contraseña con bcrypt
    const hashedPassword = await hashPassword(password);

    // Crear usuario con rol USER por defecto (el rol ADMIN se crea exclusivamente por seed)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: Role.USER,
      },
    });

    // Generar tokens de acceso y renovación
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);
    const hashedRefresh = hashToken(refreshToken);

    // Guardar token de refresco en la base de datos
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

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user.id,
        details: `Nuevo usuario registrado: ${user.email}`,
      },
    });

    // Configurar cookies seguras HTTP-only
    await setAuthCookies(accessToken, refreshToken);

    // Retornar información del usuario sin exponer tokens en la respuesta (Requisito 7)
    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el registro' },
      { status: 500 }
    );
  }
}
