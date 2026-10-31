import React from 'react';

export default function AdminDashboardPage() {
  const kpis = [
    { title: 'Total Customers', value: '0', change: 'Active Accounts' },
    { title: 'Active Subscriptions', value: '0', change: 'Recurring' },
    { title: 'Revenue Received', value: '₹0.00', change: 'Actual Payments' },
    { title: 'Outstanding Balance', value: '₹0.00', change: 'Unpaid Invoices' },
    { title: 'Overdue Invoices', value: '0', change: 'Action Required', alert: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">Real-time subscription and financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className={`p-5 rounded-lg border bg-white shadow-sm flex flex-col justify-between ${
              kpi.alert ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
            }`}
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {kpi.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{kpi.value}</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">{kpi.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Invoices</h3>
          <p className="text-sm text-gray-500 italic">No recent invoices recorded.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <p className="text-sm text-gray-500 italic">No recent payment transactions recorded.</p>
        </div>
      </div>
    </div>
  );
}

