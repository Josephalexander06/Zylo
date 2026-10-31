import React from 'react';
import Link from 'next/link';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { name: 'Dashboard', href: '/staff' },
    { name: 'Customers', href: '/staff/customers' },
    { name: 'Quotations', href: '/staff/quotations' },
    { name: 'Subscriptions', href: '/staff/subscriptions' },
    { name: 'Invoices', href: '/staff/invoices' },
    { name: 'Payments', href: '/staff/payments' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-emerald-900">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-emerald-400 inline-block"></span>
            Brightloop SMS
          </h1>
          <p className="text-xs text-emerald-300 mt-1 uppercase tracking-wider font-semibold">
            Staff Portal
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-emerald-100 hover:bg-emerald-900 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-900 flex items-center justify-between text-xs text-emerald-300">
          <span>Staff Member</span>
          <Link href="/login" className="text-red-400 hover:underline">
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="text-sm font-medium text-gray-500">
            Operations & Customer Management
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Staff Access
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

