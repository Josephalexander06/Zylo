import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenUserPayload } from './jwt';

export const AUTH_COOKIE_NAME = 'zylo_session';

export async function getCurrentUser(): Promise<TokenUserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;
  return verifyToken(token);
}

export async function getUserFromRequest(request: NextRequest): Promise<TokenUserPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireRole(
  user: TokenUserPayload | null,
  allowedRoles: ('ADMIN' | 'STAFF' | 'CUSTOMER')[]
): { authorized: boolean; errorResponse?: NextResponse } {
  if (!user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'You do not have permission to perform this action', code: 'FORBIDDEN' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

