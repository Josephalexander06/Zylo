import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { updateProfileSchema } from '@/lib/validations/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return errorResponse('User not found', 'NOT_FOUND', 404);
    }

    return successResponse({ profile });
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const body = await request.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { fullName, companyName, phone } = validated.data;

    const profile = await prisma.user.update({
      where: { id: session.userId },
      data: {
        fullName,
        companyName: companyName || null,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        phone: true,
        role: true,
      },
    });

    return successResponse({ profile }, 200, 'Profile updated successfully');
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
