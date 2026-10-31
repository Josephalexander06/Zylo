import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return errorResponse(validatedData.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, password, fullName, companyName, phone } = validatedData.data;

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return errorResponse('An account with this email already exists', 'EMAIL_EXISTS', 409);
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await hashPassword(password);

    // Create user with default role CUSTOMER
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        companyName: companyName || null,
        phone: phone || null,
        role: 'CUSTOMER',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        companyName: true,
        phone: true,
        createdAt: true,
      },
    });

    return successResponse(newUser, 201, 'Account registered successfully. You can now login.');
  } catch (err: any) {
    console.error('Registration error:', err);
    return errorResponse(err.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}
