"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AccountCard, AccountShell } from '@/components/account-shell'
import { clearAuthToken, getApiUrl, getAuthToken } from '@/lib/auth'

type Hotel = {
  id: number
  name: string
  location: string
  description: string | null
  images: string[] | null
  rating: number | null
  createdAt: string
  updatedAt: string
}

type Room = {
  roomId: number
  roomType: string
  price: number
  noOfBeds: number
  status: string
  images: string[] | null
  hotel: Hotel
  createdAt: string
  updatedAt: string
  version: number
}

type Booking = {
  bookingId: number
  checkInDate: string
  checkOutDate: string
  createdAt: string
  numGuests: number
  room: Room
  status: string
  totalAmount: number
  updatedAt: string
  version: number
}

const tabs = ['ALL', 'CONFIRMED', 'CANCELLED']

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tab, setTab] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelSuccess, setCancelSuccess] = useState(false)

  useEffect(() => {
    const token = getAuthToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    async function loadBookings() {
      try {
        const response = await fetch(getApiUrl('/users/my/bookings'), {
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
          setError('Unable to load your bookings. Please try again.')
          return
        }

        setBookings(await response.json())
        setIsAuthenticated(true)
      } catch {
        setError('Unable to connect to the server. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [])

  async function showBookingDetails(bookingId: number) {
    const token = getAuthToken()
    if (!token) {
      clearAuthToken()
      setIsAuthenticated(false)
      setError('Please log in first to view your bookings.')
      return
    }

    setIsDetailLoading(true)
    setDetailError('')
    setCancelError('')
    setCancelSuccess(false)

    try {
      const response = await fetch(getApiUrl(`/bookings/${bookingId}`), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401 || response.status === 403) {
        clearAuthToken()
        setIsAuthenticated(false)
        setDetailError('You are not authorized to view this booking.')
        return
      }

      if (!response.ok) {
        setDetailError('Unable to load the booking details. Please try again.')
        return
      }

      setSelectedBooking(await response.json())
    } catch {
      setDetailError('Unable to connect to the server. Please try again.')
    } finally {
      setIsDetailLoading(false)
    }
  }

  async function cancelBooking() {
    if (!selectedBooking) return

    const token = getAuthToken()
    if (!token) {
      clearAuthToken()
      setIsAuthenticated(false)
      setDetailError('Please log in first to cancel this booking.')
      return
    }

    setIsCancelling(true)
    setCancelError('')
    setCancelSuccess(false)

    try {
      const response = await fetch(getApiUrl(`/bookings/${selectedBooking.bookingId}/cancel`), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        clearAuthToken()
        setIsAuthenticated(false)
        setCancelError('Your session has expired. Please log in again.')
        return
      }

      if (response.status === 403) {
        setCancelError('You are not authorized to cancel this booking.')
        return
      }

      if (response.status === 409) {
        setCancelError('This booking is already cancelled or already has a refund request.')
        return
      }

      if (!response.ok) {
        setCancelError('Unable to cancel this booking. Please try again.')
        return
      }

      const cancelledBooking = { ...selectedBooking, status: 'CANCELLED' }
      setSelectedBooking(cancelledBooking)
      setBookings((current) => current.map((booking) => (
        booking.bookingId === cancelledBooking.bookingId ? cancelledBooking : booking
      )))
      setCancelSuccess(true)
    } catch {
      setCancelError('Unable to connect to the server. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  const filteredBookings = useMemo(
    () => tab === 'ALL' ? bookings : bookings.filter((booking) => booking.status === tab),
    [bookings, tab],
  )

  if (isLoading) {
    return (
      <AccountShell title="My bookings" description="Loading your stays...">
        <p className="text-sm text-slate-600" role="status">Checking your login...</p>
      </AccountShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AccountShell
        title="My bookings"
        description="Sign in to view your upcoming and previous stays."
      >
        <AccountCard>
          <p className="text-slate-700" role="alert">
            {error || 'Please log in first to view your bookings.'}
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
      title="My bookings"
      description="Everything you need for your next stay, right where you left it."
    >
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 sm:w-fit">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
              tab === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
              {item === 'ALL' ? 'All bookings' : item}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredBookings.length === 0 ? (
          <AccountCard>
            <p className="text-slate-600">No bookings found.</p>
          </AccountCard>
        ) : filteredBookings.map((booking) => (
            <AccountCard
              key={booking.bookingId}
              className="overflow-hidden p-0 sm:flex sm:flex-row sm:items-stretch"
            >
              {booking.room.hotel.images?.[0] ? (
                <img
                  src={booking.room.hotel.images[0]}
                  alt={booking.room.hotel.name}
                  className="h-48 w-full object-cover sm:h-auto sm:w-52"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 sm:h-auto sm:w-52">
                  No hotel image
                </div>
              )}

              <div className="flex flex-1 flex-col justify-between gap-5 p-5 lg:flex-row lg:p-7">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">{booking.room.hotel.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-600">{booking.room.hotel.location}</p>
                  <p className="mt-3 text-sm text-slate-700">
                    {formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {booking.room.roomType} room · {booking.numGuests} {booking.numGuests === 1 ? 'guest' : 'guests'}
                  </p>
                  {booking.room.hotel.rating !== null && (
                    <p className="mt-3 text-sm font-medium text-amber-600">
                      Rating {booking.room.hotel.rating}/5
                    </p>
                  )}
                </div>

                <div className="lg:text-right">
                  <p className="text-2xl font-bold tracking-tighter text-slate-900">
                    {formatAmount(booking.totalAmount)}
                  </p>
                  <p className="text-sm text-slate-500">Total stay</p>
                  <p className="mt-3 text-xs text-slate-500">Booking #{booking.bookingId}</p>
                  <button
                    type="button"
                    onClick={() => showBookingDetails(booking.bookingId)}
                    className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Full information
                  </button>
                </div>
              </div>
            </AccountCard>
          ))}
      </div>

      {(isDetailLoading || detailError || selectedBooking) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Booking details</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedBooking ? selectedBooking.room.hotel.name : 'Loading booking'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedBooking(null)
                  setDetailError('')
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {isDetailLoading && <p className="mt-6 text-sm text-slate-600" role="status">Loading booking details...</p>}
            {detailError && <p className="mt-6 text-sm text-red-600" role="alert">{detailError}</p>}

            {selectedBooking && !isDetailLoading && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  {selectedBooking.room.hotel.images?.[0] && (
                    <img
                      src={selectedBooking.room.hotel.images[0]}
                      alt={selectedBooking.room.hotel.name}
                      className="h-48 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
                <DetailItem label="Booking ID" value={`#${selectedBooking.bookingId}`} />
                <DetailItem label="Status" value={selectedBooking.status} />
                <DetailItem label="Location" value={selectedBooking.room.hotel.location} />
                <DetailItem label="Room" value={`${selectedBooking.room.roomType} (#${selectedBooking.room.roomId})`} />
                <DetailItem label="Check-in" value={formatDate(selectedBooking.checkInDate)} />
                <DetailItem label="Check-out" value={formatDate(selectedBooking.checkOutDate)} />
                <DetailItem label="Guests" value={String(selectedBooking.numGuests)} />
                <DetailItem label="Beds" value={String(selectedBooking.room.noOfBeds)} />
                <DetailItem label="Price per night" value={formatAmount(selectedBooking.room.price)} />
                <DetailItem label="Total amount" value={formatAmount(selectedBooking.totalAmount)} />
                <DetailItem label="Created" value={formatDateTime(selectedBooking.createdAt)} />
                <DetailItem label="Last updated" value={formatDateTime(selectedBooking.updatedAt)} />
                {selectedBooking.room.hotel.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">About the hotel</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{selectedBooking.room.hotel.description}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  {cancelSuccess && (
                    <p className="mb-3 text-sm text-emerald-700" role="status">
                      Booking cancelled and refund request created.
                    </p>
                  )}
                  {cancelError && (
                    <p className="mb-3 text-sm text-red-600" role="alert">{cancelError}</p>
                  )}
                  <button
                    type="button"
                    onClick={cancelBooking}
                    disabled={selectedBooking.status === 'CANCELLED' || isCancelling}
                    className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedBooking.status === 'CANCELLED'
                      ? 'Booking cancelled'
                      : isCancelling ? 'Cancelling booking...' : 'Cancel booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AccountShell>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  )
}
