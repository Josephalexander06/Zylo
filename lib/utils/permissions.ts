import { SubscriptionPlan, Subscription, UserRole } from '../types';

export function canPauseSubscription(plan: SubscriptionPlan): boolean {
  return plan.allow_pause && plan.is_active;
}

export function canCloseSubscriptionEarly(plan: SubscriptionPlan): boolean {
  return plan.allow_early_closure && plan.is_active;
}

export function canRenewSubscription(plan: SubscriptionPlan): boolean {
  return plan.allow_renewal && plan.is_active;
}

export function isInvoiceOverdue(dueDate: string | Date, outstandingAmount: number): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due < today && outstandingAmount > 0;
}

export function hasRoleAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

