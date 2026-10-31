import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validations/auth';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { errorResponse } from '@/lib/utils/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return errorResponse(validatedData.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, password } = validatedData.data;

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    if (!user.isActive) {
      return errorResponse('Your account has been deactivated. Please contact support.', 'DEACTIVATED', 403);
    }

    // Sign JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    // Determine redirect
    let redirectUrl = '/portal';
    if (user.role === 'ADMIN') {
      redirectUrl = '/admin';
    } else if (user.role === 'STAFF') {
      redirectUrl = '/staff';
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyName: user.companyName,
      },
      redirectUrl,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return errorResponse(err.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}
