'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { ErrorDisplay } from '@/components/ui/error-display';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { formatINR, formatDate } from '@/lib/utils/format';
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  User,
  PauseCircle,
  PlayCircle,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface SubscriptionDetail {
  id: string;
  subscriptionNumber: string;
  planName: string;
  billingFrequency: 'MONTHLY' | 'YEARLY';
  unitPrice: string | number;
  taxPercent: string | number;
  totalPerPeriod: string | number;
  startDate: string;
  nextBillingDate: string;
  expiryDate?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    companyName?: string | null;
    phone?: string | null;
  };
  invoices: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: string | number;
    amountPaid: string | number;
    outstandingAmount: string | number;
    status: string;
  }[];
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load subscription');
      }

      setSubscription(data.data.subscription);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while loading subscription');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchSubscription();
  }, [id, fetchSubscription]);

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'PAUSED' | 'CLOSED') => {
    const actionLabel =
      newStatus === 'PAUSED'
        ? 'pause'
        : newStatus === 'ACTIVE'
        ? 'resume'
        : 'permanently close';

    if (!confirm(`Are you sure you want to ${actionLabel} this subscription?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to change status`);
      }

      await fetchSubscription();
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <ErrorDisplay error="Subscription not found." />
        <Link href="/staff/subscriptions" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Subscriptions List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/staff/subscriptions"
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Subscriptions
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-gray-900">
              {subscription.subscriptionNumber}
            </h1>
            <StatusBadge status={subscription.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Created on {formatDate(subscription.createdAt)} &bull; {subscription.billingFrequency} billing cycle
          </p>
        </div>

        {/* State Transition Actions */}
        <div className="flex items-center gap-2">
          {subscription.status === 'ACTIVE' && (
            <button
              onClick={() => handleStatusChange('PAUSED')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-semibold transition"
            >
              <PauseCircle className="h-4 w-4 text-amber-600" />
              Pause Subscription
            </button>
          )}

          {subscription.status === 'PAUSED' && (
            <button
              onClick={() => handleStatusChange('ACTIVE')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition"
            >
              <PlayCircle className="h-4 w-4 text-emerald-600" />
              Resume Subscription
            </button>
          )}

          {subscription.status !== 'CLOSED' && (
            <button
              onClick={() => handleStatusChange('CLOSED')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition"
            >
              <XCircle className="h-4 w-4 text-rose-600" />
              Close Subscription
            </button>
          )}
        </div>
      </div>

      <ErrorDisplay error={error} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Customer and Dates */}
        <div className="space-y-6 md:col-span-1">
          {/* Customer Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <User className="h-4 w-4 text-blue-600" />
              Customer Details
            </h3>
            <div className="pt-2">
              <div className="font-bold text-gray-900 text-base">{subscription.customer.fullName}</div>
              {subscription.customer.companyName && (
                <div className="text-xs font-medium text-gray-600 mt-0.5">
                  {subscription.customer.companyName}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">{subscription.customer.email}</div>
              {subscription.customer.phone && (
                <div className="text-xs text-blue-600 font-medium mt-1">{subscription.customer.phone}</div>
              )}
            </div>
          </div>

          {/* Schedule & Renewal */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" />
              Billing Timeline
            </h3>
            <div className="pt-2 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Agreement Start:</span>
                <span className="font-semibold text-gray-900">{formatDate(subscription.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Next Billing Date:</span>
                <span className="font-bold text-blue-600">{formatDate(subscription.nextBillingDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Agreement Expiry:</span>
                <span className="font-medium text-gray-700">
                  {subscription.expiryDate ? formatDate(subscription.expiryDate) : 'Open-Ended'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing terms & Invoice History */}
        <div className="space-y-6 md:col-span-2">
          {/* Price Snapshot Terms */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Snapshotted Plan Agreement
                </span>
                <h2 className="text-xl font-bold mt-1">{subscription.planName}</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {subscription.billingFrequency}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/80 text-center">
              <div>
                <p className="text-xs text-slate-400">Agreed Base</p>
                <p className="text-base font-bold text-white mt-1">{formatINR(subscription.unitPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">GST Rate</p>
                <p className="text-base font-bold text-amber-300 mt-1">{subscription.taxPercent}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Billed Per Period</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {formatINR(subscription.totalPerPeriod)}
                </p>
              </div>
            </div>
          </div>

          {/* Generated Invoices for this subscription */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                Issued Invoices ({subscription.invoices.length})
              </h3>
            </div>

            {subscription.invoices.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                No invoices have been billed for this subscription yet.
                <p className="text-xs text-gray-400 mt-1">
                  Run billing on billing day ({formatDate(subscription.nextBillingDate)}) to generate the first invoice.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Outstanding</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscription.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-6 py-3.5 font-mono text-xs font-bold text-gray-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-3.5 text-xs">{formatDate(inv.invoiceDate)}</td>
                        <td className="px-6 py-3.5 text-xs text-gray-500">{formatDate(inv.dueDate)}</td>
                        <td className="px-6 py-3.5 font-semibold text-gray-900">
                          {formatINR(inv.totalAmount)}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-rose-600">
                          {formatINR(inv.outstandingAmount)}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/staff/invoices/${inv.id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Details &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

