/**
 * Formats a sequence number into the standard project pattern:
 * PREFIX-YYYYMM-NNNN (e.g., SUB-202610-0001)
 */
export function generateReferenceNumber(prefix: 'SUB' | 'INV' | 'QUO' | 'PAY', sequence: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seqPadded = String(sequence).padStart(4, '0');

  return `${prefix}-${year}${month}-${seqPadded}`;
}

export function generateSubscriptionNumber(sequence: number, date?: Date): string {
  return generateReferenceNumber('SUB', sequence, date);
}

export function generateInvoiceNumber(sequence: number, date?: Date): string {
  return generateReferenceNumber('INV', sequence, date);
}

export function generateQuotationNumber(sequence: number, date?: Date): string {
  return generateReferenceNumber('QUO', sequence, date);
}

export function generatePaymentReference(sequence: number, date?: Date): string {
  return generateReferenceNumber('PAY', sequence, date);
}

