'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorDisplay } from '@/components/ui/error-display';
import { formatINR, formatDate } from '@/lib/utils/format';
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  Sparkles,
  User,
  Package,
} from 'lucide-react';

interface CustomerOption {
  id: string;
  fullName: string;
  email: string;
  companyName?: string | null;
}

interface PlanOption {
  id: string;
  name: string;
  price: string | number;
  taxPercent: string | number;
  billingFrequency: 'MONTHLY' | 'YEARLY';
}

export default function NewSubscriptionPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active customers and plans
  useEffect(() => {
    async function loadOptions() {
      try {
        const [custRes, planRes] = await Promise.all([
          fetch('/api/users/customers?limit=100'),
          fetch('/api/plans?activeOnly=true&limit=100'),
        ]);

        const custData = await custRes.json();
        const planData = await planRes.json();

        if (custRes.ok && custData.data?.customers) {
          setCustomers(custData.data.customers);
          if (custData.data.customers.length > 0) {
            setCustomerId(custData.data.customers[0].id);
          }
        }

        if (planRes.ok && planData.data?.plans) {
          setPlans(planData.data.plans);
          if (planData.data.plans.length > 0) {
            setPlanId(planData.data.plans[0].id);
          }
        }
      } catch (err: any) {
        setError('Failed to load customers or plans. Please refresh.');
      } finally {
        setLoadingData(false);
      }
    }

    loadOptions();
  }, []);

  const selectedPlan = plans.find((p) => p.id === planId);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Price calculations
  const priceNum = selectedPlan ? Number(selectedPlan.price) : 0;
  const taxNum = selectedPlan ? Number(selectedPlan.taxPercent) : 0;
  const taxAmount = (priceNum * taxNum) / 100;
  const totalPerPeriod = priceNum + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !planId) {
      setError('Please select both a customer and a subscription plan.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          planId,
          startDate,
          expiryDate: expiryDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      router.push('/staff/subscriptions');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/staff/subscriptions"
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Subscriptions
        </Link>
      </div>

      <PageHeader
        title="Start New Subscription"
        description="Enroll a registered customer into a recurring plan. Pricing and tax terms are snapshotted permanently."
      />

      <ErrorDisplay error={error} />

      {loadingData ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-sm text-gray-500 animate-pulse">
          Loading customer accounts and plan catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Customer *
                </label>
                {customers.length === 0 ? (
                  <div className="mt-1.5 p-3 rounded-lg bg-amber-50 text-xs text-amber-800 border border-amber-200">
                    No registered customers found. Please have the customer register first.
                  </div>
                ) : (
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} {c.companyName ? `(${c.companyName})` : ''} &bull; {c.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Plan Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Subscription Plan *
                </label>
                {plans.length === 0 ? (
                  <div className="mt-1.5 p-3 rounded-lg bg-amber-50 text-xs text-amber-800 border border-amber-200">
                    No active plans found. Please ask an Admin to create an active plan.
                  </div>
                ) : (
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} &bull; {formatINR(p.price)} / {p.billingFrequency.toLowerCase()} ({p.taxPercent}% GST)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">First billing period begins on this date.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">Leave blank for open-ended recurring subscription.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Link
                  href="/staff/subscriptions"
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || customers.length === 0 || plans.length === 0}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
                >
                  {submitting ? 'Activating Subscription...' : 'Activate Subscription'}
                </button>
              </div>
            </form>
          </div>

          {/* Agreement Snapshot Sidebar */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md border border-slate-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                <Sparkles className="h-4 w-4" />
                Agreement Snapshot
              </div>

              <div className="text-sm font-medium text-slate-300">
                Customer: <span className="text-white font-bold">{selectedCustomer?.fullName || '-'}</span>
              </div>
              {selectedCustomer?.companyName && (
                <div className="text-xs text-slate-400">{selectedCustomer.companyName}</div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700/80">
                <div className="text-base font-bold text-white">
                  {selectedPlan?.name || 'No Plan Selected'}
                </div>
                <div className="text-xs text-slate-400">
                  Frequency: <span className="text-white font-medium">{selectedPlan?.billingFrequency || '-'}</span>
                </div>
              </div>

              <div className="my-5 border-t border-slate-700/80 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Recurring Base Price</span>
                  <span className="font-semibold">{formatINR(priceNum)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>GST Rate ({taxNum}%)</span>
                  <span className="font-semibold text-amber-300">+{formatINR(taxAmount)}</span>
                </div>
                <div className="border-t border-slate-700/80 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Per Period</span>
                  <span className="text-emerald-400 text-base">{formatINR(totalPerPeriod)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
                🔒 <strong>Price Lock Guarantee:</strong> Future modifications to the plan catalog will not retroactively alter this customer's recurring price.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

