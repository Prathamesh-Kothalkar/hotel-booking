'use client'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />
}

export function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" role="status" aria-label="Loading profile">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full sm:col-span-2" />
        </div>
        <Skeleton className="mt-7 h-12 w-32" />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-28" /></div>
        </div>
        <Skeleton className="mt-8 h-20 w-full" />
      </div>
    </div>
  )
}

export function BookingListSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading bookings">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-sm sm:flex">
          <Skeleton className="h-44 w-full rounded-none sm:h-auto sm:w-52" />
          <div className="flex-1 space-y-4 p-5 lg:p-7"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-36" /></div>
        </div>
      ))}
    </div>
  )
}

export function RefundListSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading refunds">
      {[1, 2].map((item) => (
        <div key={item} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-sm sm:flex">
          <Skeleton className="h-44 w-full rounded-none sm:h-auto sm:w-52" />
          <div className="flex-1 space-y-4 p-5 lg:p-7"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-28" /></div>
        </div>
      ))}
    </div>
  )
}

export function RoomResultsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading rooms">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Skeleton className="h-56 rounded-none" />
          <div className="space-y-4 p-5"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-12 w-full" /><Skeleton className="h-11 w-full" /></div>
        </div>
      ))}
    </div>
  )
}
