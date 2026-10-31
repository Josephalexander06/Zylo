import { UserRole } from '../types';

export function isInvoiceOverdue(dueDate: string | Date, outstandingAmount: number): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due < today && outstandingAmount > 0;
}

export function hasRoleAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}
