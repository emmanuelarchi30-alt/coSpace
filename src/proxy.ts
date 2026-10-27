import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/auth';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret_change_me_in_prod_12345678'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_change_me_in_prod_87654321'
);

interface TokenData {
  userId: string;
  role: string;
  email: string;
}

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

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  let session: TokenData | null = null;

  if (accessToken) {
    session = await verifyToken(accessToken, ACCESS_SECRET);
  }

  // If access token is expired or invalid, but refresh token exists, verify refresh token
  if (!session && refreshToken) {
    session = await verifyToken(refreshToken, REFRESH_SECRET);
  }

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPrivateRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/my-reservations');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. If accessing login/register while already authenticated, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Protect private routes: must have active session
  if (isPrivateRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Protect admin routes: must have active session AND role === ADMIN
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'ADMIN') {
      // Forbidden: redirect to regular dashboard
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized_admin', request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;
