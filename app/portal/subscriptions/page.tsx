import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatINR, formatDate } from '@/lib/utils/format';
import { CreditCard, Calendar, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default async function CustomerSubscriptionsPage() {
  const session = await getCurrentUser();

  const subscriptions = session
    ? await prisma.subscription.findMany({
        where: { customerId: session.userId },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="My Active Subscriptions"
        description="View your registered software services, recurring prices, and next scheduled billing dates."
      />

      {subscriptions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No active subscriptions found"
          description="You do not currently have any active subscriptions. Please contact the Brightloop sales team to activate your plan."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-gray-500">
                    {sub.subscriptionNumber}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-2">{sub.planName}</h3>
                <div className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                  {sub.billingFrequency} Billing Cycle
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Base Subscription Rate:</span>
                    <span className="font-semibold text-gray-900">{formatINR(sub.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable GST:</span>
                    <span className="font-semibold text-gray-900">{sub.taxPercent.toString()}%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
                    <span>Total Billed Per Period:</span>
                    <span className="text-blue-600 text-base">{formatINR(sub.totalPerPeriod)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Next Renewal: <strong>{formatDate(sub.nextBillingDate)}</strong></span>
                </div>
                <span className="text-[11px] text-gray-400">
                  Started {formatDate(sub.startDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
