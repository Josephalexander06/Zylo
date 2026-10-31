'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Pagination } from '@/components/ui/pagination';
import { ErrorDisplay } from '@/components/ui/error-display';
import { formatINR, formatDate } from '@/lib/utils/format';
import {
  CreditCard,
  PlusCircle,
  Search,
  ArrowRight,
  Calendar,
  User,
} from 'lucide-react';

interface SubscriptionItem {
  id: string;
  subscriptionNumber: string;
  planName: string;
  billingFrequency: 'MONTHLY' | 'YEARLY';
  totalPerPeriod: string | number;
  startDate: string;
  nextBillingDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  customer: {
    fullName: string;
    companyName?: string | null;
    email: string;
  };
}

export default function StaffSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/subscriptions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch subscriptions');
      }

      setSubscriptions(data.data.subscriptions || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
      setTotalItems(data.data.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Error loading subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customer Subscriptions"
        description="Monitor active recurring subscriptions, agreements, and upcoming renewal billing schedules."
        action={
          <Link
            href="/staff/subscriptions/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
          >
            <PlusCircle className="h-4 w-4" />
            New Subscription
          </Link>
        }
      />

      <ErrorDisplay error={error} />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search sub #, customer, or plan..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PAUSED">Paused Only</option>
            <option value="CLOSED">Closed Only</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No customer subscriptions found"
          description="Create a new recurring subscription for an existing customer to begin automated billing."
          action={
            <Link
              href="/staff/subscriptions/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              Start New Subscription
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Subscription #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Plan &amp; Frequency</th>
                  <th className="px-6 py-3.5">Agreed Price</th>
                  <th className="px-6 py-3.5">Next Billing</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/staff/subscriptions/${sub.id}`}
                        className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {sub.subscriptionNumber}
                      </Link>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Started {formatDate(sub.startDate)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">
                        {sub.customer.fullName}
                      </div>
                      {sub.customer.companyName && (
                        <div className="text-xs text-gray-500">{sub.customer.companyName}</div>
                      )}
                      <div className="text-[11px] text-gray-400">{sub.customer.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sub.planName}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {sub.billingFrequency}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">
                        {formatINR(sub.totalPerPeriod)}
                      </div>
                      <div className="text-[11px] text-gray-400">per cycle</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-gray-900 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        <span>{formatDate(sub.nextBillingDate)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/staff/subscriptions/${sub.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={15}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

