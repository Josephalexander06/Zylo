import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreditCard, FileText, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export default async function CustomerDashboardPage() {
  const session = await getCurrentUser();

  const [subscriptions, invoices] = session
    ? await Promise.all([
        prisma.subscription.findMany({
          where: { customerId: session.userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.invoice.findMany({
          where: { customerId: session.userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ])
    : [[], []];

  const activeCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const unpaidTotal = invoices
    .filter((inv) => inv.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + Number(curr.outstandingAmount), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-blue-100 border border-white/20 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Customer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back{session?.fullName ? `, ${session.fullName}` : ''}
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Track your subscriptions, upcoming renewal dates, and payment history in real time.
          </p>
        </div>
        <Link
          href="/portal/subscriptions"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition shadow-sm whitespace-nowrap"
        >
          My Subscriptions &rarr;
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Subscriptions
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activeCount}</p>
            <p className="text-xs text-gray-500 mt-1">Currently active software plans</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Outstanding Balance
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatINR(unpaidTotal)}</p>
            <p className="text-xs text-gray-500 mt-1">Due for payment</p>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              unpaidTotal > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Invoices
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{invoices.length}</p>
            <p className="text-xs text-gray-500 mt-1">Issued billing records</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recent Subscriptions & Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Active Subscriptions</h2>
            <Link
              href="/portal/subscriptions"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              All Subscriptions <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {subscriptions.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                You do not have any active subscriptions yet.
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{sub.planName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Next billing: <span className="font-medium text-gray-700">{formatDate(sub.nextBillingDate)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatINR(sub.totalPerPeriod)}</div>
                    <div className="mt-1">
                      <StatusBadge status={sub.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Invoices</h2>
            <Link
              href="/portal/invoices"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              All Invoices <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No invoices recorded for your account.
              </div>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-semibold text-gray-900">{inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Due: {formatDate(inv.dueDate)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatINR(inv.totalAmount)}</div>
                    <div className="mt-1">
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
