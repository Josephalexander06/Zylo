import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = forgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email } = validated.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't leak whether an account exists for security
    return successResponse(
      { sent: true },
      200,
      'If an account exists with this email, password reset instructions have been sent.'
    );
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}
