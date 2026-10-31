import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';
import { AUTH_COOKIE_NAME } from './lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const user = token ? await verifyToken(token) : null;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  // If authenticated user visits login/register, redirect to their dashboard
  if (user && isAuthPage) {
    if (user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (user.role === 'STAFF') {
      return NextResponse.redirect(new URL('/staff', request.url));
    } else {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }

  // Protected Admin Routes: /admin/*
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN') {
      // Redirect staff to /staff, customer to /portal
      const target = user.role === 'STAFF' ? '/staff' : '/portal';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Protected Staff Routes: /staff/*
  if (pathname.startsWith('/staff')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }

  // Protected Customer Portal Routes: /portal/*
  if (pathname.startsWith('/portal')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Admin and staff can also inspect portal or be redirected
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
