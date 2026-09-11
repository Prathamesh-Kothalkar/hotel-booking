"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AccountCard, AccountShell } from '@/components/account-shell'
import { clearAuthToken, getApiUrl, getAuthToken } from '@/lib/auth'

type Hotel = {
  name: string
  location: string
  images: string[] | null
  rating: number | null
}

type Room = {
  roomId: number
  roomType: string
  price: number
  noOfBeds: number
  images: string[] | null
  hotel: Hotel
}

type RefundBooking = {
  bookingId: number
  checkInDate: string
  checkOutDate: string
  createdAt: string
  numGuests: number
  room: Room
  status: string
  totalAmount: number
}

type RefundPayment = {
  paymentId: number
  paymentMethod: string
  transactionId: string
  status: string
  amount: number
  createdAt: string
}

type Refund = {
  refundId: number
  amount: number
  booking: RefundBooking
  payment: RefundPayment
  processedAt: string | null
  reason: string
  requestedAt: string
  status: string
}

const tabs = ['ALL', 'REQUESTED', 'PROCESSED', 'REJECTED']

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusClass(status: string) {
  if (status === 'PROCESSED') return 'bg-emerald-100 text-emerald-700'
  if (status === 'REJECTED') return 'bg-red-100 text-red-700'
  return 'bg-orange-100 text-orange-700'
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [tab, setTab] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)

  useEffect(() => {
    const token = getAuthToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    async function loadRefunds() {
      try {
        const response = await fetch(getApiUrl('/users/my/refunds'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 401) {
          clearAuthToken()
          setError('Your session has expired. Please log in again.')
          return
        }

        if (!response.ok) {
          setError('Unable to load your refunds. Please try again.')
          return
        }

        setRefunds(await response.json())
        setIsAuthenticated(true)
      } catch {
        setError('Unable to connect to the server. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadRefunds()
  }, [])

  const filteredRefunds = useMemo(
    () => tab === 'ALL' ? refunds : refunds.filter((refund) => refund.status === tab),
    [refunds, tab],
  )

  const totalRefunded = refunds
    .filter((refund) => refund.status === 'PROCESSED')
    .reduce((total, refund) => total + refund.amount, 0)

  const totalRequested = refunds.reduce((total, refund) => total + refund.amount, 0)

  if (isLoading) {
    return (
      <AccountShell title="Refunds & support" description="Loading your refund history...">
        <p className="text-sm text-slate-600" role="status">Checking your login...</p>
      </AccountShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AccountShell
        title="Refunds & support"
        description="Track refund requests and payment returns for your cancelled stays."
      >
        <AccountCard>
          <p className="text-slate-700" role="alert">
            {error || 'Please log in first to view your refunds.'}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-sky-700"
          >
            Log in
          </Link>
        </AccountCard>
      </AccountShell>
    )
  }

  return (
    <AccountShell
      title="Refunds & support"
      description="Track refund requests and payment returns for your cancelled stays."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total requests" value={String(refunds.length)} />
        <SummaryCard label="Amount requested" value={formatAmount(totalRequested)} />
        <SummaryCard label="Amount refunded" value={formatAmount(totalRefunded)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 sm:w-fit">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
              tab === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {item === 'ALL' ? 'All refunds' : item}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
        {filteredRefunds.length === 0 ? (
          <AccountCard>
            <p className="text-slate-600">No refunds found for this filter.</p>
          </AccountCard>
        ) : filteredRefunds.map((refund) => (
          <RefundCard key={refund.refundId} refund={refund} onSelect={() => setSelectedRefund(refund)} />
        ))}
      </div>

      {selectedRefund && (
        <RefundDetails refund={selectedRefund} onClose={() => setSelectedRefund(null)} />
      )}
    </AccountShell>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <AccountCard>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tighter text-slate-900">{value}</p>
    </AccountCard>
  )
}

function RefundCard({ refund, onSelect }: { refund: Refund; onSelect: () => void }) {
  const hotel = refund.booking.room.hotel
  const image = hotel.images?.[0] ?? refund.booking.room.images?.[0]

  return (
    <AccountCard className="overflow-hidden p-0 sm:flex sm:flex-row sm:items-stretch">
      {image ? (
        <img src={image} alt={hotel.name} className="h-44 w-full object-cover sm:h-auto sm:w-52" />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 sm:h-auto sm:w-52">No hotel image</div>
      )}
      <div className="flex flex-1 flex-col justify-between gap-5 p-5 lg:flex-row lg:p-7">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">{hotel.name}</h2>
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(refund.status)}`}>
              {refund.status}
            </span>
          </div>
          <p className="mt-2 text-slate-600">{hotel.location} · Booking #{refund.booking.bookingId}</p>
          <p className="mt-3 text-sm text-slate-700">
            {formatDate(refund.booking.checkInDate)} – {formatDate(refund.booking.checkOutDate)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{refund.booking.room.roomType} room · {refund.booking.numGuests} {refund.booking.numGuests === 1 ? 'guest' : 'guests'}</p>
          <p className="mt-3 text-sm text-slate-500">{refund.reason}</p>
        </div>
        <div className="lg:text-right">
          <p className="text-2xl font-bold tracking-tighter text-slate-900">{formatAmount(refund.amount)}</p>
          <p className="text-sm text-slate-500">Refund amount</p>
          <button type="button" onClick={onSelect} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">View details</button>
        </div>
      </div>
    </AccountCard>
  )
}

function RefundDetails({ refund, onClose }: { refund: Refund; onClose: () => void }) {
  const hotel = refund.booking.room.hotel

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Refund details</p>
            <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">{hotel.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailItem label="Refund ID" value={`#${refund.refundId}`} />
          <DetailItem label="Status" value={refund.status} />
          <DetailItem label="Refund amount" value={formatAmount(refund.amount)} />
          <DetailItem label="Reason" value={refund.reason} />
          <DetailItem label="Booking" value={`#${refund.booking.bookingId}`} />
          <DetailItem label="Dates" value={`${formatDate(refund.booking.checkInDate)} – ${formatDate(refund.booking.checkOutDate)}`} />
          <DetailItem label="Payment method" value={refund.payment.paymentMethod} />
          <DetailItem label="Payment status" value={refund.payment.status} />
          <DetailItem label="Transaction" value={refund.payment.transactionId} />
          <DetailItem label="Requested" value={formatDateTime(refund.requestedAt)} />
          <DetailItem label="Processed" value={refund.processedAt ? formatDateTime(refund.processedAt) : 'Still being reviewed'} />
          <DetailItem label="Room" value={`${refund.booking.room.roomType} (#${refund.booking.room.roomId})`} />
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 wrap-break-word font-medium text-slate-900">{value}</p>
    </div>
  )
}
