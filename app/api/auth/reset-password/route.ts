import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { getCurrentUser } from '@/lib/auth/session';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Session expired or invalid reset link', 'UNAUTHORIZED', 401);
    }

    const body = await request.json();
    const validated = resetPasswordSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { password } = validated.data;
    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.userId },
      data: { passwordHash },
    });

    return successResponse({ success: true }, 200, 'Password has been updated successfully.');
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}
