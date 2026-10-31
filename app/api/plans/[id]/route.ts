import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { updatePlanSchema } from '@/lib/validations/plans';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

// GET /api/plans/[id] - Get plan by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      return errorResponse('Plan not found', 'NOT_FOUND', 404);
    }

    return successResponse({ plan });
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

// PATCH /api/plans/[id] - Deactivate or update plan (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const { id } = await params;
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      return errorResponse('Plan not found', 'NOT_FOUND', 404);
    }

    const body = await request.json();

    if (typeof body.price === 'string') {
      body.price = parseFloat(body.price);
    }
    if (typeof body.taxPercent === 'string') {
      body.taxPercent = parseFloat(body.taxPercent);
    }

    const validated = updatePlanSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: validated.data,
    });

    return successResponse(
      updated,
      200,
      `Plan has been ${updated.isActive ? 'updated and activated' : 'deactivated'}`
    );
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

// DELETE /api/plans/[id] - Soft delete (deactivate) or hard delete if no subscriptions
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const { id } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) {
      return errorResponse('Plan not found', 'NOT_FOUND', 404);
    }

    if (plan._count.subscriptions > 0) {
      // Soft deactivate to maintain integrity of existing customer subscriptions
      await prisma.plan.update({
        where: { id },
        data: { isActive: false },
      });
      return successResponse(
        { deactivated: true },
        200,
        'Plan has existing subscriptions and was safely deactivated instead of deleted.'
      );
    }

    await prisma.plan.delete({ where: { id } });
    return successResponse({ deleted: true }, 200, 'Plan deleted successfully.');
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

