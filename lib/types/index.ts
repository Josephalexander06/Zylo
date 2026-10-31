export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';
export type BillingFrequency = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD' | 'OTHER';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  companyName?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  billingFrequency: BillingFrequency;
  taxPercent: number | string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  planId: string;
  startDate: string | Date;
  expiryDate?: string | Date | null;
  nextBillingDate: string | Date;
  status: SubscriptionStatus;
  unitPrice: number | string;
  taxPercent: number | string;
  totalPerPeriod: number | string;
  planName: string;
  billingFrequency: BillingFrequency;
  createdAt: string | Date;
  updatedAt: string | Date;
  customer?: UserProfile;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  subscriptionId?: string | null;
  billingPeriodStart?: string | Date | null;
  billingPeriodEnd?: string | Date | null;
  invoiceDate: string | Date;
  dueDate: string | Date;
  description: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  taxPercent: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  amountPaid: number | string;
  outstandingAmount: number | string;
  status: InvoiceStatus;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  customer?: UserProfile;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  paymentReference: string;
  invoiceId: string;
  customerId: string;
  paymentMethod: PaymentMethod;
  amount: number | string;
  paymentDate: string | Date;
  transactionId?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string | Date;
  createdBy?: UserProfile | null;
  invoice?: Invoice;
}

export interface FollowUp {
  id: string;
  entityType: 'subscription' | 'invoice';
  entityId: string;
  note: string;
  staffId: string;
  createdAt: string | Date;
  staff?: UserProfile;
}
