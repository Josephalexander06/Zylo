'use client';

import React, { useEffect, useState } from 'react';

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile');

        if (data.profile) {
          setProfile({
            fullName: data.profile.full_name || '',
            email: data.profile.email || '',
            companyName: data.profile.company_name || '',
            phone: data.profile.phone || '',
          });
        }
      } catch (err: any) {
        setError(err?.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          companyName: profile.companyName,
          phone: profile.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Account Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal contact information and business account details.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-md border border-emerald-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Registered Email (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Email addresses cannot be changed directly for security and billing association.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Company Name (For Invoice Header)
            </label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              placeholder="e.g. Acme Software Ltd."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Contact Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+91 98765 00000"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

