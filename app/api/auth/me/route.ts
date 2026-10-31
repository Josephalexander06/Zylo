import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function GET() {
  const session = await getCurrentUser();

  if (!session) {
    return errorResponse('Not authenticated', 'UNAUTHORIZED', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      companyName: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    return errorResponse('User not found or deactivated', 'UNAUTHORIZED', 401);
  }

  return successResponse(user);
}

