import React from 'react';

export default function StaffDashboardPage() {
  const stats = [
    { label: 'Assigned Customers', count: '0' },
    { label: 'Pending Quotations', count: '0' },
    { label: 'Active Subscriptions', count: '0' },
    { label: 'Unpaid Invoices', count: '0' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Staff Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of active subscriptions and customer operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Operations</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700">
            + New Quotation
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            + New Subscription
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}

