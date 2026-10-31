export type UserRole = 'admin' | 'staff' | 'customer';

export type SubscriptionStatus = 'draft' | 'quotation' | 'confirmed' | 'active' | 'closed';

export type InvoiceStatus = 'draft' | 'confirmed' | 'sent' | 'paid' | 'cancelled';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'converted' | 'expired' | 'rejected';

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ProductType = 'software' | 'service';

export type DiscountType = 'fixed' | 'percentage';

export type DiscountScope = 'product' | 'subscription';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'card' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  company_name?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  product_type: ProductType;
  sales_price: number;
  cost_price: number;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  additional_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  billing_frequency: BillingFrequency;
  min_quantity: number;
  available_from: string;
  available_until?: string | null;
  auto_close: boolean;
  allow_early_closure: boolean;
  allow_pause: boolean;
  allow_renewal: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number; // e.g. 18.00 for 18%
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase_amount?: number | null;
  min_quantity?: number | null;
  start_date: string;
  end_date: string;
  max_usage_count?: number | null;
  current_usage_count: number;
  scope: DiscountScope;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string | null;
  default_plan_id?: string | null;
  validity_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  plan_id?: string | null;
  template_id?: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string;
  payment_terms?: string | null;
  status: QuotationStatus;
  notes?: string | null;
  converted_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  customer_id: string;
  plan_id: string;
  quotation_id?: string | null;
  parent_subscription_id?: string | null;
  start_date: string;
  expiry_date?: string | null;
  next_billing_date: string;
  status: SubscriptionStatus;
  is_paused: boolean;
  paused_at?: string | null;
  payment_terms?: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  subscription_id?: string | null;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  outstanding_amount: number;
  status: InvoiceStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

export interface Payment {
  id: string;
  payment_reference: string;
  invoice_id: string;
  customer_id: string;
  payment_method: PaymentMethod;
  amount: number;
  payment_date: string;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface BillingRecord {
  id: string;
  subscription_id: string;
  invoice_id?: string | null;
  billing_period_start: string;
  billing_period_end: string;
  status: 'success' | 'failed' | 'skipped';
  error_message?: string | null;
  processed_at: string;
}

