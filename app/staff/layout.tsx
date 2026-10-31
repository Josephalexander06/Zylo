import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staffLinks = [
    { name: 'Rescue Queue', href: '/staff' },
    { name: 'Subscriptions', href: '/staff/subscriptions' },
    { name: 'Invoices', href: '/staff/invoices' },
    { name: 'Billing Run', href: '/staff/billing' },
    { name: 'Customers', href: '/staff/customers' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar
        role="STAFF"
        title="Staff Workspace"
        badge="Staff Member"
        links={staffLinks}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="text-sm font-medium text-gray-600">
            Brightloop Operations &bull; Staff Workspace
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Staff Access
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
