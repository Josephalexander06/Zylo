import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const { id } = await params;

    const staff = await prisma.user.findFirst({
      where: { id, role: 'STAFF' },
    });

    if (!staff) {
      return errorResponse('Staff member not found', 'NOT_FOUND', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !staff.isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    return successResponse(
      { staff: updated },
      200,
      `Staff member account has been ${updated.isActive ? 'activated' : 'deactivated'}`
    );
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
