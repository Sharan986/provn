import { NextResponse } from 'next/server';
import { decodeJwt } from './utils/jwt';

export function middleware(request) {
  let response = NextResponse.next({ request });

  // Get token from cookies
  const token = request.cookies.get('provn_access')?.value;
  const user = token ? decodeJwt(token) : null;
  const role = user?.role || 'student';

  // Protected routes
  const protectedPaths = ['/dashboard', '/simulator', '/discover', '/tasks'];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('mode', 'login');
    return NextResponse.redirect(url);
  }

  // If logged in user visits /auth, redirect to dashboard
  if (user && request.nextUrl.pathname === '/auth') {
    const url = request.nextUrl.clone();
    url.pathname = `/dashboard/${role}`;
    return NextResponse.redirect(url);
  }

  // Role-based route restrictions
  if (user) {
    const pathname = request.nextUrl.pathname;
    
    // Redirect /dashboard to role-specific dashboard
    if (pathname === '/dashboard') {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    // Restrict /dashboard/[role]
    if (pathname.startsWith('/dashboard/')) {
      const requestedRole = pathname.split('/')[2];
      if (requestedRole && requestedRole !== role) {
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${role}`;
        return NextResponse.redirect(url);
      }
    }

    // Restrict /onboarding/[role]
    if (pathname.startsWith('/onboarding/')) {
      const requestedRole = pathname.split('/')[2];
      if (requestedRole && requestedRole !== role) {
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${role}`;
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
