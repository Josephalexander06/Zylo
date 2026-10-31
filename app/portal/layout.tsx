import React from 'react';
import Link from 'next/link';

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { name: 'My Dashboard', href: '/portal' },
    { name: 'My Subscriptions', href: '/portal/subscriptions' },
    { name: 'My Invoices', href: '/portal/invoices' },
    { name: 'My Profile', href: '/portal/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal" className="text-xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-blue-600 inline-block"></span>
              Brightloop Customer Portal
            </Link>

            <nav className="hidden md:flex space-x-4">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Customer Account</span>
            <Link href="/login" className="text-sm text-red-600 hover:underline">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

