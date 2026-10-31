import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const { id } = await params;

    const customer = await prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: true,
            invoices: true,
          },
        },
      },
    });

    if (!customer) {
      return errorResponse('Customer not found', 'NOT_FOUND', 404);
    }

    return successResponse({ customer });
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
