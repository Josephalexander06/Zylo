import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { planSchema } from '@/lib/validations/plans';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

// GET /api/plans - List subscription plans (paginated & searchable)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 'UNAUTHORIZED', 401);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const frequency = searchParams.get('frequency');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (activeOnly) {
      where.isActive = true;
    }

    if (frequency && (frequency === 'MONTHLY' || frequency === 'YEARLY')) {
      where.billingFrequency = frequency;
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, plans] = await Promise.all([
      prisma.plan.count({ where }),
      prisma.plan.findMany({
        where,
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
    ]);

    return successResponse({
      plans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('Error fetching plans:', err);
    return errorResponse(err.message || 'Failed to fetch plans', 'INTERNAL_ERROR', 500);
  }
}

// POST /api/plans - Create a new plan (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireRole(user, ['ADMIN']);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const body = await request.json();

    // Ensure price and taxPercent are numbers if passed as strings
    if (typeof body.price === 'string') {
      body.price = parseFloat(body.price);
    }
    if (typeof body.taxPercent === 'string') {
      body.taxPercent = parseFloat(body.taxPercent);
    }

    const validated = planSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(validated.error.errors[0].message, 'VALIDATION_ERROR', 400);
    }

    const { name, description, price, billingFrequency, taxPercent } = validated.data;

    // Check for duplicate active plan name
    const existing = await prisma.plan.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        isActive: true,
      },
    });

    if (existing) {
      return errorResponse('An active plan with this name already exists', 'PLAN_EXISTS', 409);
    }

    const newPlan = await prisma.plan.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price,
        billingFrequency,
        taxPercent,
        isActive: true,
      },
    });

    return successResponse(newPlan, 201, 'Subscription plan created successfully');
  } catch (err: any) {
    console.error('Error creating plan:', err);
    return errorResponse(err.message || 'Failed to create plan', 'INTERNAL_ERROR', 500);
  }
}

