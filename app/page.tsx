import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-8 md:p-16">
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white">
            BL
          </div>
          <span className="text-xl font-bold tracking-tight">Brightloop Software</span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 rounded-md text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          Portal Sign In &rarr;
        </Link>
      </header>

      <main className="max-w-4xl mx-auto my-auto text-center space-y-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Subscription Management System
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Centralized Subscription & Recurring Billing Platform
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Brightloop SMS automates product configurations, quotation workflows, recurring invoices,
          tax calculations, discount rules, and customer billing.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/admin"
            className="px-6 py-3 bg-white text-slate-950 font-semibold rounded-lg text-sm hover:bg-slate-100 transition"
          >
            Open Admin Dashboard
          </Link>
          <Link
            href="/staff"
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg text-sm hover:bg-emerald-500 transition"
          >
            Open Staff Portal
          </Link>
          <Link
            href="/portal"
            className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg text-sm border border-slate-700 hover:bg-slate-700 transition"
          >
            Open Customer Portal
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 max-w-6xl mx-auto w-full border-t border-slate-800 pt-8">
        Brightloop Subscription Management System &bull; Next.js 15 &bull; Supabase PostgreSQL
      </footer>
    </div>
  );
}
