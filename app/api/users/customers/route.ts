import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'CUSTOMER',
    };

    if (search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { companyName: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          companyName: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return successResponse({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
