import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminLinks = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Subscription Plans', href: '/admin/plans' },
    { name: 'Staff Management', href: '/admin/staff' },
    { name: 'Subscriptions', href: '/staff/subscriptions' },
    { name: 'Invoices', href: '/staff/invoices' },
    { name: 'Billing Run', href: '/staff/billing' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar
        role="ADMIN"
        title="Admin Console"
        badge="Administrator"
        links={adminLinks}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="text-sm font-medium text-gray-600">
            Brightloop Operations &bull; Administrator Mode
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Admin Access
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
