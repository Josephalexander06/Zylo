import React from 'react';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your Brightloop software subscriptions, renewals, and billing records.
          </p>
        </div>
        <Link
          href="/portal/subscriptions"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          View My Subscriptions
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Active Subscriptions
          </p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">0</p>
          <p className="text-xs text-gray-400 mt-4">Running plans</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Upcoming Invoices
          </p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">0</p>
          <p className="text-xs text-gray-400 mt-4">Next billing cycle</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Outstanding Amount
          </p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">₹0.00</p>
          <p className="text-xs text-gray-400 mt-4">Total unpaid balance</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">Recent Invoices</h3>
          <Link href="/portal/invoices" className="text-sm text-blue-600 hover:underline">
            View All Invoices &rarr;
          </Link>
        </div>
        <div className="p-6 text-sm text-gray-500 italic">No invoices found.</div>
      </div>
    </div>
  );
}

