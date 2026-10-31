import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { createSubscriptionSchema } from '@/lib/validations/subscriptions';
import { calculateNextBillingDate } from '@/lib/utils/billing-dates';
import { generateSubscriptionNumber } from '@/lib/utils/number-generator';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

// GET /api/subscriptions - List subscriptions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 'UNAUTHORIZED', 401);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const customerIdParam = searchParams.get('customerId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Data isolation: Customer can ONLY see their own subscriptions
    if (user.role === 'CUSTOMER') {
      where.customerId = user.userId;
    } else if (customerIdParam) {
      where.customerId = customerIdParam;
    }

    if (status && ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    if (search.trim()) {
      where.OR = [
        { subscriptionNumber: { contains: search.trim(), mode: 'insensitive' } },
        { planName: { contains: search.trim(), mode: 'insensitive' } },
        { customer: { fullName: { contains: search.trim(), mode: 'insensitive' } } },
        { customer: { companyName: { contains: search.trim(), mode: 'insensitive' } } },
        { customer: { email: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
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
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              billingFrequency: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return successResponse({
      subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('Error fetching subscriptions:', err);
    return errorResponse(err.message || 'Failed to fetch subscriptions', 'INTERNAL_ERROR', 500);
  }
}

// POST /api/subscriptions - Create new subscription (Staff / Admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const body = await request.json();
    const validated = createSubscriptionSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { customerId, planId, startDate, expiryDate } = validated.data;

    // Verify customer exists
    const customer = await prisma.user.findFirst({
      where: { id: customerId, role: 'CUSTOMER', isActive: true },
    });
    if (!customer) {
      return errorResponse('Selected customer not found or inactive', 'NOT_FOUND', 404);
    }

    // Verify plan exists and is active
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });
    if (!plan || !plan.isActive) {
      return errorResponse('Selected subscription plan is not active', 'INVALID_PLAN', 400);
    }

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const expiry = expiryDate ? new Date(expiryDate) : null;
    if (expiry) expiry.setHours(0, 0, 0, 0);

    // Calculate initial nextBillingDate (start date + one frequency cycle)
    const nextBilling = calculateNextBillingDate(start, plan.billingFrequency);

    // Snapshot plan pricing
    const unitPrice = plan.price;
    const taxPercent = plan.taxPercent;
    const priceNum = Number(unitPrice);
    const taxNum = Number(taxPercent);
    const totalPerPeriod = priceNum + (priceNum * taxNum) / 100;

    // Generate next sequence number
    const totalCount = await prisma.subscription.count();
    const subscriptionNumber = generateSubscriptionNumber(totalCount + 1, start);

    // Create subscription transactionally with audit record
    const subscription = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: customer.id,
          planId: plan.id,
          startDate: start,
          expiryDate: expiry,
          nextBillingDate: nextBilling,
          status: 'ACTIVE',
          unitPrice,
          taxPercent,
          totalPerPeriod,
          planName: plan.name,
          billingFrequency: plan.billingFrequency,
        },
        include: {
          customer: {
            select: { id: true, fullName: true, email: true, companyName: true },
          },
          plan: {
            select: { id: true, name: true, price: true, billingFrequency: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          entityName: 'subscription',
          entityId: sub.id,
          action: 'CREATED',
          performedBy: user!.userId,
          details: {
            subscriptionNumber: sub.subscriptionNumber,
            planName: plan.name,
            totalPerPeriod,
            customerName: customer.fullName,
          },
        },
      });

      return sub;
    });

    return successResponse(subscription, 201, 'Subscription created and activated successfully');
  } catch (err: any) {
    console.error('Error creating subscription:', err);
    return errorResponse(err.message || 'Failed to create subscription', 'INTERNAL_ERROR', 500);
  }
}
