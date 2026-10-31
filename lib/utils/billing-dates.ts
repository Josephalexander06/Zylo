import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { BillingFrequency } from '../types';

/**
 * Calculates the next billing date given a current date and a billing frequency.
 * Handles month-end and leap-year edge cases consistently using date-fns.
 */
export function calculateNextBillingDate(startDate: Date | string, frequency: BillingFrequency): Date {
  const date = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate.getTime());

  switch (frequency) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    default:
      throw new Error(`Unsupported billing frequency: ${frequency}`);
  }
}

/**
 * Formats a Date object to YYYY-MM-DD format.
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

