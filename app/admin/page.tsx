import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
  PlusCircle,
  Clock,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const [
    totalCustomers,
    totalPlans,
    activeSubscriptions,
    recentInvoices,
    recentPayments,
    paymentsSum,
    invoicesSum,
    overdueCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { fullName: true, companyName: true } } },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { fullName: true } } },
    }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.invoice.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { outstandingAmount: true },
    }),
    prisma.invoice.count({
      where: {
        status: 'CONFIRMED',
        dueDate: { lt: new Date() },
        outstandingAmount: { gt: 0 },
      },
    }),
  ]);

  const revenueTotal = Number(paymentsSum._sum.amount || 0);
  const outstandingTotal = Number(invoicesSum._sum.outstandingAmount || 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time platform financial statistics and subscription health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/plans"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Manage Plans
          </Link>
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            <Users className="h-4 w-4 text-gray-500" />
            Staff Team
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customers
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Active customer profiles</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Plans
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{totalPlans}</div>
            <p className="text-xs text-gray-500 mt-1">Recurring products configured</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Subscriptions
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{activeSubscriptions}</div>
            <p className="text-xs text-gray-500 mt-1">Active recurring billing accounts</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{formatINR(revenueTotal)}</div>
            <p className="text-xs text-gray-500 mt-1">Total payments received</p>
          </div>
        </div>

        <div
          className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
            overdueCount > 0
              ? 'border-rose-200 bg-rose-50/40'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Overdue Invoices
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-rose-700">{overdueCount}</div>
            <p className="text-xs text-rose-600 mt-1">
              {formatINR(outstandingTotal)} outstanding
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Invoices</h3>
            <Link
              href="/staff/invoices"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                No invoices generated yet.
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{inv.customer.fullName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatINR(inv.totalAmount)}</div>
                    <div className="mt-1">
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Recorded Payments</h3>
            <span className="text-xs text-gray-400 font-medium">Bank &amp; UPI</span>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPayments.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <CreditCard className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                No payment transactions recorded yet.
              </div>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{p.customer.fullName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.paymentMethod} &bull; {formatDate(p.paymentDate)}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    +{formatINR(p.amount)}
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
