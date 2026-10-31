import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid('Please select a valid customer'),
  planId: z.string().uuid('Please select a valid subscription plan'),
  startDate: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
});

export const updateSubscriptionStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'], {
    errorMap: () => ({ message: 'Invalid subscription status' }),
  }),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionStatusInput = z.infer<typeof updateSubscriptionStatusSchema>;

