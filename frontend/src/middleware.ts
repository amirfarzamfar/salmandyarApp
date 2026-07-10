import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPrimaryJwtRole, isJwtExpired } from '@/lib/auth-jwt';
import { resolveRoleHomePath } from '@/utils/role-routing';

const authCookieName = 'salmandyar_auth_token';
const protectedPrefixes = ['/dashboard', '/nurse-portal', '/portal'];

const routeRoles: Record<string, Set<string>> = {
  '/dashboard': new Set(['Admin', 'Supervisor', 'SuperAdmin', 'Manager']),
  '/nurse-portal': new Set(['Nurse', 'AssistantNurse', 'ElderlyCareAssistant', 'Physiotherapist']),
  '/portal': new Set(['Patient', 'Elderly', 'PatientFamily']),
};

function applyNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  return response;
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(authCookieName, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
}

function createLoginRedirect(request: NextRequest, shouldClearCookie = false) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);

  const response = NextResponse.redirect(loginUrl);
  if (shouldClearCookie) {
    clearAuthCookie(response);
  }

  return applyNoCacheHeaders(response);
}

function getProtectedPrefix(pathname: string) {
  return protectedPrefixes.find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';
  const protectedPrefix = getProtectedPrefix(pathname);

  if (!isLoginPage && !protectedPrefix) {
    return NextResponse.next();
  }

  const token = request.cookies.get(authCookieName)?.value;
  const hasValidToken = !!token && !isJwtExpired(token, 5);

  if (isLoginPage) {
    if (!hasValidToken) {
      return applyNoCacheHeaders(NextResponse.next());
    }

    const role = getPrimaryJwtRole(token);
    if (!role) {
      const response = NextResponse.next();
      clearAuthCookie(response);
      return applyNoCacheHeaders(response);
    }

    return applyNoCacheHeaders(NextResponse.redirect(new URL(resolveRoleHomePath(role), request.url)));
  }

  if (!hasValidToken) {
    return createLoginRedirect(request, !!token);
  }

  const role = getPrimaryJwtRole(token);
  const allowedRoles = protectedPrefix ? routeRoles[protectedPrefix] : null;

  if (!role || (allowedRoles && !allowedRoles.has(role))) {
    return applyNoCacheHeaders(NextResponse.redirect(new URL(role ? resolveRoleHomePath(role) : '/login', request.url)));
  }

  return applyNoCacheHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/nurse-portal/:path*', '/portal/:path*'],
};
