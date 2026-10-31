import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { createStaffSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

// GET /api/users/staff - List staff (Admin only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const staffList = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ staff: staffList });
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

// POST /api/users/staff - Create staff (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const body = await request.json();
    const validated = createStaffSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, password, fullName, phone } = validated.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return errorResponse('An account with this email already exists', 'EMAIL_EXISTS', 409);
    }

    const passwordHash = await hashPassword(password);

    const newStaff = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone: phone || null,
        role: 'STAFF',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return successResponse(newStaff, 201, 'Staff member added successfully');
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
