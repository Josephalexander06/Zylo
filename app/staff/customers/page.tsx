'use client';

import React, { useEffect, useState } from 'react';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async (query = '', pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/customers?search=${encodeURIComponent(query)}&page=${pageNum}&limit=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch customers');

      setCustomers(data.customers || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(search, page);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Registered Customers</h2>
          <p className="text-sm text-gray-500">
            View customer accounts, company associations, and prepare quotations or subscriptions.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, company..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Customer Name</th>
                <th className="px-6 py-3 text-left">Company</th>
                <th className="px-6 py-3 text-left">Email Address</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Registered Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.company_name || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => alert(`Customer ID: ${c.id}\nEmail: ${c.email}`)}
                        className="text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        View Info
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 text-xs"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

