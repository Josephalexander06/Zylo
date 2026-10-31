'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Zap,
  Package,
  LogOut,
  UserCheck,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href: string;
}

interface SidebarProps {
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  title: string;
  badge: string;
  links: NavItem[];
}

function getIconForHref(href: string): LucideIcon {
  if (href === '/admin' || href === '/staff' || href === '/portal') return LayoutDashboard;
  if (href.includes('plans')) return Package;
  if (href.includes('staff')) return Users;
  if (href.includes('customers')) return Users;
  if (href.includes('subscriptions')) return CreditCard;
  if (href.includes('invoices')) return FileText;
  if (href.includes('billing')) return Zap;
  return FileText;
}

export function Sidebar({ role, title, badge, links }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <Link
          href={role === 'ADMIN' ? '/admin' : role === 'STAFF' ? '/staff' : '/portal'}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-base shadow-sm">
            Z
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Zylo</h1>
            <p className="text-[11px] text-slate-400 font-medium">{title}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' &&
              item.href !== '/staff' &&
              item.href !== '/portal' &&
              pathname.startsWith(item.href));
          const Icon = getIconForHref(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className={clsx('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {role === 'ADMIN' ? (
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          ) : (
            <UserCheck className="h-4 w-4 text-emerald-400" />
          )}
          <span className="font-medium text-slate-300">{badge}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:underline font-medium transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
