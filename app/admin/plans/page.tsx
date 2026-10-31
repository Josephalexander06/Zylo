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
  Package,
  PlusCircle,
  Search,
  CheckCircle,
  XCircle,
  CreditCard,
  Percent,
} from 'lucide-react';

interface PlanItem {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  billingFrequency: 'MONTHLY' | 'YEARLY';
  taxPercent: string | number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    subscriptions: number;
  };
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search.trim()) params.set('search', search.trim());
      if (frequencyFilter) params.set('frequency', frequencyFilter);

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch plans');
      }

      setPlans(data.data.plans || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
      setTotalItems(data.data.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [page, search, frequencyFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleToggleActive = async (plan: PlanItem) => {
    const action = plan.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} the plan "${plan.name}"?`)) {
      return;
    }

    setActionLoadingId(plan.id);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} plan`);
      }

      await fetchPlans();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} plan`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Subscription Plans"
        description="Configure pricing, billing intervals, and default GST rates for Brightloop subscription services."
        action={
          <Link
            href="/admin/plans/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Plan
          </Link>
        }
      />

      <ErrorDisplay error={error} />

      {/* Filters Bar */}
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
            placeholder="Search plans by name..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={frequencyFilter}
            onChange={(e) => {
              setFrequencyFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Frequencies</option>
            <option value="MONTHLY">Monthly Plans</option>
            <option value="YEARLY">Yearly Plans</option>
          </select>
        </div>
      </div>

      {/* Plans List Table */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No subscription plans found"
          description="Create your first recurring software plan with pricing and tax rates."
          action={
            <Link
              href="/admin/plans/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              Create Plan Now
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Plan Name &amp; Description</th>
                  <th className="px-6 py-3.5">Frequency</th>
                  <th className="px-6 py-3.5">Price &amp; Tax</th>
                  <th className="px-6 py-3.5">Total / Period</th>
                  <th className="px-6 py-3.5">Subscribers</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan) => {
                  const p = Number(plan.price);
                  const t = Number(plan.taxPercent);
                  const total = p + (p * t) / 100;
                  const isActionLoading = actionLoadingId === plan.id;

                  return (
                    <tr key={plan.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{plan.name}</div>
                        {plan.description && (
                          <div className="text-xs text-gray-500 max-w-sm truncate mt-0.5">
                            {plan.description}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-400 mt-1">
                          Created {formatDate(plan.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {plan.billingFrequency}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{formatINR(plan.price)}</div>
                        <div className="text-xs text-blue-600 font-medium mt-0.5 flex items-center gap-0.5">
                          <Percent className="h-3 w-3" />
                          {plan.taxPercent}% GST
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm">
                          {formatINR(total)}
                        </div>
                        <div className="text-[11px] text-gray-500">incl. GST</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                          <span>{plan._count?.subscriptions || 0} active</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={plan.isActive ? 'ACTIVE' : 'CLOSED'} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleActive(plan)}
                          disabled={isActionLoading}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                            plan.isActive
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          } disabled:opacity-50`}
                        >
                          {plan.isActive ? (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={10}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

