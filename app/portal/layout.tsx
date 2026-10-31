'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, UserCircle } from 'lucide-react';
import clsx from 'clsx';

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'My Dashboard', href: '/portal' },
    { name: 'My Subscriptions', href: '/portal/subscriptions' },
    { name: 'My Invoices', href: '/portal/invoices' },
    { name: 'My Profile', href: '/portal/profile' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-base shadow-sm">
                Z
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Zylo <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider ml-1">Portal</span>
              </span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
              <UserCircle className="h-3.5 w-3.5" />
              Customer Account
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 hover:underline font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
