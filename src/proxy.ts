import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/auth';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'clave_secreta_acceso_cospace_jwt_2026_segura_12345678'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'clave_secreta_refresco_cospace_jwt_2026_segura_87654321'
);

interface TokenData {
  userId: string;
  role: string;
  email: string;
}

// Función auxiliar para verificar la firma del token con jose
async function verifyToken(token: string, secret: Uint8Array): Promise<TokenData | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

// Proxy de protección de rutas privadas y administrativas en Next.js 16 (Requisito 8)
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  let session: TokenData | null = null;

  if (accessToken) {
    session = await verifyToken(accessToken, ACCESS_SECRET);
  }

  // Si el access token expiró pero existe refresh token, verificar sesión activa
  if (!session && refreshToken) {
    session = await verifyToken(refreshToken, REFRESH_SECRET);
  }

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPrivateRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/my-reservations');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. Redirigir al dashboard si ya cuenta con sesión activa e intenta ir a login/registro
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Proteger rutas privadas: requiere sesión activa obligatoria
  if (isPrivateRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Proteger rutas de administración: requiere rol de ADMIN
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'ADMIN') {
      // Bloquear acceso no autorizado y redirigir al dashboard
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized_admin', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

export default proxy;
