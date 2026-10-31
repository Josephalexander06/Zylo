import { format } from 'date-fns';

/**
 * Formats a numeric or Decimal value into Indian Rupee format (e.g. ₹1,23,456.00)
 */
export function formatINR(amount: number | string | { toString(): string } | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return '₹0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats a date string or Date object into a readable date (e.g. 31 Oct 2026)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return format(d, 'dd MMM yyyy');
}

/**
 * Formats date into standard ISO YYYY-MM-DD
 */
export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

