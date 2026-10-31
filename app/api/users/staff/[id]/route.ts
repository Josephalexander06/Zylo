import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { updateStaffSchema } from '@/lib/validations/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

// GET /api/users/staff/[id] - Admin view staff details
export async function GET(
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
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!staff) {
      return errorResponse('Staff member not found', 'NOT_FOUND', 404);
    }

    return successResponse({ staff });
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

// PUT /api/users/staff/[id] - Admin update staff
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const { id } = await params;
    const body = await request.json();
    const validated = updateStaffSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { fullName, phone, isActive } = validated.data;

    const staff = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        phone: phone || null,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    return successResponse({ staff }, 200, 'Staff profile updated successfully');
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
