"use client"

import { useState } from 'react'
import { AccountCard, AccountShell } from '@/components/account-shell'

export default function RefundsPage() {
  const [requested, setRequested] = useState(false)

  return (
    <AccountShell
      title="Refunds & support"
      description="Need help with a reservation? Tell us what happened and our team will take it from here."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <AccountCard>
          <h2 className="text-xl font-semibold text-slate-900">Request a refund</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Refund eligibility depends on the cancellation policy for your stay.
          </p>

          <div className="mt-6 flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Booking
              <input
                defaultValue="The Harbor House · Jun 18 – Jun 21, 2025"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Reason
              <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100">
                <option>Change of plans</option>
                <option>Hotel issue</option>
                <option>Duplicate booking</option>
                <option>Other</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Tell us more
              <textarea
                rows={4}
                placeholder="Share any details that can help us review your request..."
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>
          </div>

          <button
            onClick={() => setRequested(true)}
            className="mt-7 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-sky-700"
          >
            {requested ? 'Request submitted' : 'Submit refund request'}
          </button>
        </AccountCard>

        <AccountCard>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Recent requests</p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">Casa Lucía</h2>
                <p className="mt-1 text-sm text-slate-500">Submitted May 11, 2025</p>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-700">
                Under review
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              We&apos;ll email you when there&apos;s an update.
            </p>
          </div>

          <p className="mt-7 text-sm leading-6 text-slate-600">
            Need immediate help?{' '}
            <a href="mailto:support@hotel.ai" className="font-semibold text-primary hover:underline">
              Contact support
            </a>
            .
          </p>
        </AccountCard>
      </div>
    </AccountShell>
  )
}
