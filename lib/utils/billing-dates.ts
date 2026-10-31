import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

/**
 * Calculates the next billing date given a current date and a billing frequency.
 * Handles month-end and leap-year edge cases consistently using date-fns.
 */
export function calculateNextBillingDate(
  startDate: Date | string,
  frequency: 'MONTHLY' | 'YEARLY' | 'monthly' | 'yearly' | 'daily' | 'weekly' | string
): Date {
  const date = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate.getTime());
  const freq = frequency.toLowerCase();

  switch (freq) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
}

/**
 * Formats a Date object to YYYY-MM-DD format.
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
