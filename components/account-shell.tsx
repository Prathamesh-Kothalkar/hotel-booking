"use client"

import { SiteHeader } from '@/components/site-header'

export function AccountShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title: string
  description: string
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="shell py-10 lg:py-14">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Your Hotel.ai account
          </p>
          <h1 className="text-3xl font-black tracking-[-0.06em] text-slate-900 lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </main>
  )
}

export function AccountCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:p-7 ${className}`}
    >
      {children}
    </section>
  )
}
