import { z } from 'zod';

export const planSchema = z.object({
  name: z
    .string()
    .min(3, 'Plan name must be at least 3 characters')
    .max(100, 'Plan name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
  price: z
    .number({ invalid_type_error: 'Price must be a valid number' })
    .positive('Price must be greater than ₹0')
    .max(9999999.99, 'Price cannot exceed ₹99,99,999.99'),
  billingFrequency: z.enum(['MONTHLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Billing frequency must be either MONTHLY or YEARLY' }),
  }),
  taxPercent: z
    .number({ invalid_type_error: 'Tax percentage must be a number' })
    .min(0, 'Tax rate cannot be negative')
    .max(28, 'Tax rate cannot exceed 28% (GST max)')
    .default(18),
});

export const updatePlanSchema = planSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type PlanInput = z.infer<typeof planSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

