'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorDisplay } from '@/components/ui/error-display';
import { formatINR } from '@/lib/utils/format';
import { Package, ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function NewPlanPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingFrequency: 'MONTHLY' as 'MONTHLY' | 'YEARLY',
    taxPercent: '18',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live calculations
  const numPrice = parseFloat(formData.price) || 0;
  const numTax = parseFloat(formData.taxPercent) || 0;
  const taxAmount = (numPrice * numTax) / 100;
  const totalPerPeriod = numPrice + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        billingFrequency: formData.billingFrequency,
        taxPercent: parseFloat(formData.taxPercent),
      };

      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create plan');
      }

      router.push('/admin/plans');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while creating the plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/plans"
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Plans List
        </Link>
      </div>

      <PageHeader
        title="Create Subscription Plan"
        description="Configure pricing, billing intervals, and default GST rates for recurring subscriptions."
      />

      <ErrorDisplay error={error} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Plan Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Standard Business Monthly"
                className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="mt-1 text-xs text-gray-400">Descriptive name visible to staff and customers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Base Price (₹ INR) *
                </label>
                <div className="mt-1.5 relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="4999.00"
                    className="block w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Billing Frequency *
                </label>
                <select
                  value={formData.billingFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingFrequency: e.target.value as 'MONTHLY' | 'YEARLY',
                    })
                  }
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MONTHLY">Monthly (Billed Every Month)</option>
                  <option value="YEARLY">Yearly (Billed Once Per Year)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tax / GST Rate (%)
                </label>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {formData.taxPercent}% GST
                </span>
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="28"
                value={formData.taxPercent}
                onChange={(e) => setFormData({ ...formData, taxPercent: e.target.value })}
                className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Standard Indian GST rates: 18% (Software Services), 12%, 5%, or 0% (Tax Exempt).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Plan Description (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Includes 10 user seats, unlimited recurring invoices, and phone support..."
                className="mt-1.5 block w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link
                href="/admin/plans"
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Saving Plan...' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Calculation & Summary Column */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md border border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
              <Sparkles className="h-4 w-4" />
              Live Billing Summary
            </div>

            <div className="text-xl font-bold truncate">
              {formData.name || 'Untitled Plan'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Interval: <span className="text-white font-medium">{formData.billingFrequency}</span>
            </div>

            <div className="my-5 border-t border-slate-700/80 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Recurring Price</span>
                <span className="font-semibold">{formatINR(numPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST Tax ({numTax}%)</span>
                <span className="font-semibold text-amber-300">+{formatINR(taxAmount)}</span>
              </div>
              <div className="border-t border-slate-700/80 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Customer Pays:</span>
                <span className="text-emerald-400 text-base">{formatINR(totalPerPeriod)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
              💡 <strong>Integrity Guarantee:</strong> Once a customer subscribes, this price and tax rate are permanently locked into their subscription record.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

