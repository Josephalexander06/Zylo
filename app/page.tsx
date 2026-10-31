import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 md:p-16">
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-sm">
            Z
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">Zylo</span>
            <span className="block text-[11px] text-slate-400 font-medium">Brightloop Subscription Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors shadow-sm"
          >
            Sign In &rarr;
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto my-auto text-center space-y-6 py-12">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Built for Indian SMBs &bull; Zero BaaS &bull; Local PostgreSQL
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Centralized Subscription &amp; Recurring Billing Platform
        </h1>
        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Replace error-prone spreadsheets, prevent missed renewals with the <strong>Renewal Rescue Queue</strong>, and generate invoices with atomic, one-click billing.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/admin"
            className="px-6 py-3 bg-white text-slate-950 font-semibold rounded-lg text-sm hover:bg-slate-100 transition shadow-sm"
          >
            Admin Console
          </Link>
          <Link
            href="/staff"
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg text-sm hover:bg-emerald-500 transition shadow-sm"
          >
            Staff Rescue Queue
          </Link>
          <Link
            href="/portal"
            className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg text-sm border border-slate-700 hover:bg-slate-700 transition"
          >
            Customer Portal
          </Link>
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="font-semibold text-sm text-blue-400">1. Renewal Rescue Queue</h4>
            <p className="mt-1 text-xs text-slate-400">Actionable priority queue of overdue invoices and renewals due in 7 days.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="font-semibold text-sm text-emerald-400">2. One-Click Billing Day</h4>
            <p className="mt-1 text-xs text-slate-400">Atomic, idempotent invoice generation with snapshotted pricing and locked periods.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="font-semibold text-sm text-sky-400">3. Customer Transparency</h4>
            <p className="mt-1 text-xs text-slate-400">Self-service portal for active subscriptions, invoices, and payment tracking.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 max-w-6xl mx-auto w-full border-t border-slate-900 pt-6">
        Zylo Subscription Management Platform &bull; Next.js 15 &bull; PostgreSQL &bull; Prisma &bull; Custom JWT
      </footer>
    </div>
  );
}
