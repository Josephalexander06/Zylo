import React from 'react';
import clsx from 'clsx';

type StatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'CLOSED'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'
  | 'OVERDUE'
  | 'ADMIN'
  | 'STAFF'
  | 'CUSTOMER';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CONFIRMED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  DRAFT: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  PAUSED: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  OVERDUE: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  CLOSED: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  ADMIN: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  STAFF: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  CUSTOMER: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const style = statusStyles[normalized] || 'bg-gray-50 text-gray-700 ring-gray-600/20';

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
        style,
        className
      )}
    >
      {status}
    </span>
  );
}

