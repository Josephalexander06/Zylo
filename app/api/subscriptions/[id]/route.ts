import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { updateSubscriptionStatusSchema } from '@/lib/validations/subscriptions';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

// GET /api/subscriptions/[id]
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
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            companyName: true,
            phone: true,
          },
        },
        plan: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            invoiceDate: true,
            dueDate: true,
            totalAmount: true,
            amountPaid: true,
            outstandingAmount: true,
            status: true,
          },
        },
      },
    });

    if (!subscription) {
      return errorResponse('Subscription not found', 'NOT_FOUND', 404);
    }

    // Role boundary: Customer can only view their own subscription
    if (user.role === 'CUSTOMER' && subscription.customerId !== user.userId) {
      return errorResponse('Access denied', 'FORBIDDEN', 403);
    }

    return successResponse({ subscription });
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

// PATCH /api/subscriptions/[id] - Pause, resume, or close subscription (Staff/Admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const { id } = await params;
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Subscription not found', 'NOT_FOUND', 404);
    }

    const body = await request.json();
    const validated = updateSubscriptionStatusSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { status } = validated.data;

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          entityName: 'subscription',
          entityId: sub.id,
          action: `STATUS_CHANGE_TO_${status}`,
          performedBy: user!.userId,
          details: {
            oldStatus: existing.status,
            newStatus: status,
            subscriptionNumber: sub.subscriptionNumber,
          },
        },
      });

      return sub;
    });

    return successResponse(
      updated,
      200,
      `Subscription status has been updated to ${status}`
    );
  } catch (err: any) {
    return errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
