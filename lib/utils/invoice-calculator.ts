export interface LineItemInput {
  quantity: number;
  unitPrice: number;
}

export interface DiscountInput {
  type: 'fixed' | 'percentage';
  value: number;
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  outstandingAmount: number;
}

/**
 * Calculates complete invoice totals strictly following the Brightloop specification:
 * 1. Subtotal = Sum of (quantity * unitPrice)
 * 2. Discount applied first
 * 3. Taxable Amount = Subtotal - Discount
 * 4. Tax calculated on Taxable Amount
 * 5. Total = Taxable Amount + Tax Amount
 * 6. Outstanding = Total - Amount Paid
 */
export function calculateInvoiceTotals(
  items: LineItemInput[],
  taxRatePercent: number = 0,
  discount?: DiscountInput | null,
  amountPaid: number = 0
): CalculationResult {
  const subtotal = items.reduce((acc, item) => {
    return acc + Math.round(item.quantity * item.unitPrice * 100) / 100;
  }, 0);

  let discountAmount = 0;
  if (discount && discount.value > 0) {
    if (discount.type === 'fixed') {
      discountAmount = Math.min(discount.value, subtotal);
    } else if (discount.type === 'percentage') {
      discountAmount = Math.round(((subtotal * discount.value) / 100) * 100) / 100;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(((taxableAmount * taxRatePercent) / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;
  const outstandingAmount = Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
    outstandingAmount,
  };
}

