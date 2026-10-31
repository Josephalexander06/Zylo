import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  AlertTriangle,
  Clock,
  CreditCard,
  PlusCircle,
  Zap,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default async function StaffDashboardPage() {
  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const [
    activeSubsCount,
    overdueInvoices,
    upcomingRenewals,
    totalCustomers,
  ] = await Promise.all([
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.findMany({
      where: {
        status: 'CONFIRMED',
        dueDate: { lt: today },
        outstandingAmount: { gt: 0 },
      },
      include: { customer: { select: { fullName: true, companyName: true, phone: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: next7Days },
      },
      include: { customer: { select: { fullName: true, companyName: true, phone: true } } },
      orderBy: { nextBillingDate: 'asc' },
      take: 10,
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Renewal Rescue Queue</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
              Live Priority
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Actionable work queue: Follow up with clients with overdue invoices and renewals due in the next 7 days.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/staff/billing"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            <Zap className="h-4 w-4" />
            Run Due Billing
          </Link>
          <Link
            href="/staff/subscriptions/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            New Subscription
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeSubsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Managed Customers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div
          className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${
            overdueInvoices.length > 0 ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200 bg-white'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Overdue Invoices</p>
            <p className="text-2xl font-bold text-rose-800 mt-1">{overdueInvoices.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div
          className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${
            upcomingRenewals.length > 0 ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200 bg-white'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Due in 7 Days</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{upcomingRenewals.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Action Queue 1: Overdue Invoices */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <h2 className="font-bold text-rose-900 text-sm">Priority 1 &bull; Overdue Invoices Requiring Follow-Up</h2>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
            {overdueInvoices.length} Pending
          </span>
        </div>

        {overdueInvoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            All invoices are paid or up to date. No overdue accounts!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Balance Owed</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-rose-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{inv.customer.fullName}</div>
                      {inv.customer.companyName && (
                        <div className="text-xs text-gray-500">{inv.customer.companyName}</div>
                      )}
                      {inv.customer.phone && (
                        <div className="text-xs text-blue-600">{inv.customer.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-rose-600 font-medium">{formatDate(inv.dueDate)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatINR(inv.outstandingAmount)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/staff/invoices/${inv.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                      >
                        Record Payment
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Queue 2: Upcoming Renewals */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            <h2 className="font-bold text-amber-900 text-sm">Priority 2 &bull; Subscriptions Renewing in Next 7 Days</h2>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            {upcomingRenewals.length} Upcoming
          </span>
        </div>

        {upcomingRenewals.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            No renewals due within the next 7 days.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Next Billing</th>
                  <th className="px-6 py-3">Amount/Period</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingRenewals.map((sub) => (
                  <tr key={sub.id} className="hover:bg-amber-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{sub.customer.fullName}</div>
                      {sub.customer.companyName && (
                        <div className="text-xs text-gray-500">{sub.customer.companyName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sub.planName}</div>
                      <div className="text-xs text-gray-500">{sub.billingFrequency}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-amber-700">{formatDate(sub.nextBillingDate)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatINR(sub.totalPerPeriod)}</td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
