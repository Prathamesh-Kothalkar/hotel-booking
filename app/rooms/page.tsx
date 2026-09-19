'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, Star, Users } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { getApiUrl, getAuthToken } from '@/lib/auth'
import { RoomResultsSkeleton } from '@/components/ui/page-skeleton'

type Hotel = {
  id: number
  name: string
  location: string
  description: string | null
  images: string[] | null
  rating: number | null
}

type Room = {
  roomId: number
  roomType: string
  price: number
  noOfBeds: number
  status: string
  images: string[] | null
  hotel: Hotel
}

type SearchResponse = {
  content: Room[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

type BookingResponse = {
  bookingId: number
  status: string
  totalAmount: number
  checkInDate: string
  checkOutDate: string
}

const emptyResults: SearchResponse = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 20,
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function RoomsPage() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [guests, setGuests] = useState('2')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(0)
  const [results, setResults] = useState<SearchResponse>(emptyResults)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookingGuests, setBookingGuests] = useState('2')
  const [bookingCheckIn, setBookingCheckIn] = useState('')
  const [bookingCheckOut, setBookingCheckOut] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponse | null>(null)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setLocation(params.get('location') ?? '')
    setHotelName(params.get('hotelName') ?? '')
    setGuests(params.get('guests') ?? '2')
    setCheckIn(params.get('checkIn') ?? '')
    setCheckOut(params.get('checkOut') ?? '')
    setMinPrice(params.get('minPrice') ?? '')
    setMaxPrice(params.get('maxPrice') ?? '')
    setPage(Number(params.get('page') ?? '0'))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (location.trim()) params.set('location', location.trim())
    if (hotelName.trim()) params.set('hotelName', hotelName.trim())
    if (guests) params.set('guests', guests)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    params.set('page', String(page))

    let cancelled = false
    setIsLoading(true)
    setError('')

    fetch(getApiUrl(`/rooms/search?${params.toString()}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Search request failed')
        return response.json() as Promise<SearchResponse>
      })
      .then((data) => {
        if (!cancelled) setResults(data)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load rooms right now. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [location, hotelName, guests, checkIn, checkOut, minPrice, maxPrice, page])

  function updateSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(0)
  }

  function openBooking(room: Room) {
    if (!getAuthToken()) {
      router.push('/login')
      return
    }

    setSelectedRoom(room)
    setBookingGuests(guests || '1')
    setBookingCheckIn(checkIn)
    setBookingCheckOut(checkOut)
    setBookingError('')
    setBookingSuccess(null)
  }

  function closeBooking() {
    if (isBooking) return
    setSelectedRoom(null)
    setBookingError('')
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = getAuthToken()

    if (!token) {
      router.push('/login')
      return
    }

    setBookingError('')
    setIsBooking(true)

    try {
      const response = await fetch(getApiUrl('/bookings'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedRoom?.roomId,
          checkInDate: bookingCheckIn,
          checkOutDate: bookingCheckOut,
          numGuests: Number(bookingGuests),
        }),
      })

      if (response.status === 401) {
        setBookingError('Your session has expired. Please log in again.')
        return
      }

      if (response.status === 409) {
        setBookingError('This room is no longer available for those dates. Try another room or date range.')
        return
      }

      if (response.status === 402 || response.status === 422) {
        setBookingError('Payment could not be completed. Please check your details and try again.')
        return
      }

      if (!response.ok) {
        setBookingError('Unable to complete this booking. Please try again.')
        return
      }

      setBookingSuccess(await response.json())
    } catch {
      setBookingError('Unable to connect to the server. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#eef8fb_0%,#ffffff_55%,#fff4ed_100%)] py-10">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="section-kicker">Room search</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.07em] text-slate-900 md:text-5xl">
              Find a room that fits your trip.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Search available rooms by destination, dates, guests, hotel, and budget.
            </p>
          </div>

          <form onSubmit={updateSearch} className="mt-8 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
            <div className="grid gap-2 lg:grid-cols-4">
              <label className="flex min-h-16 items-center gap-3 rounded-2xl bg-slate-50 px-4">
                <MapPin className="h-4 w-4 text-sky-700" />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Location</span>
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Pune" className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none" />
                </span>
              </label>
              <label className="flex min-h-16 items-center gap-3 rounded-2xl bg-slate-50 px-4">
                <Search className="h-4 w-4 text-sky-700" />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Hotel</span>
                  <input value={hotelName} onChange={(event) => setHotelName(event.target.value)} placeholder="Any hotel" className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none" />
                </span>
              </label>
              <label className="flex min-h-16 items-center gap-3 rounded-2xl bg-slate-50 px-4">
                <Users className="h-4 w-4 text-sky-700" />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Guests</span>
                  <input type="number" min="1" value={guests} onChange={(event) => setGuests(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none" />
                </span>
              </label>
              <button type="submit" className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-[#f2643d] px-5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#e4572d]">
                <Search className="h-4 w-4" />
                Search rooms
              </button>
            </div>

            <div className="mt-2 grid gap-2 border-t border-slate-100 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 text-sky-700" />
                <span className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Check in</span><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-medium outline-none" /></span>
              </label>
              <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 text-sky-700" />
                <span className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Check out</span><input type="date" min={checkIn || undefined} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-medium outline-none" /></span>
              </label>
              <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600">
                <span className="text-base font-bold text-sky-700">₹</span>
                <span className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Min price</span><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Any" className="mt-1 w-full bg-transparent text-sm font-medium outline-none" /></span>
              </label>
              <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600">
                <span className="text-base font-bold text-sky-700">₹</span>
                <span className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Max price</span><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Any" className="mt-1 w-full bg-transparent text-sm font-medium outline-none" /></span>
              </label>
            </div>
          </form>
        </div>
      </section>

      <section className="shell py-10 lg:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Available rooms</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">{results.totalElements} stays found</h2>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><SlidersHorizontal className="h-4 w-4 text-sky-700" /> Refine your search above</div>
        </div>

        {isLoading ? (
          <RoomResultsSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700" role="alert">{error}</div>
        ) : results.content.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">No rooms match those filters.</h3>
            <p className="mt-2 text-slate-600">Try a different location, date, or price range.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.content.map((room) => <RoomCard key={room.roomId} room={room} onBook={openBooking} />)}
          </div>
        )}

        {results.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button type="button" disabled={page === 0 || isLoading} onClick={() => setPage((current) => current - 1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-semibold text-slate-600">Page {page + 1} of {results.totalPages}</span>
            <button type="button" disabled={page + 1 >= results.totalPages || isLoading} onClick={() => setPage((current) => current + 1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </section>

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Reserve your stay</p>
                <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">{selectedRoom.hotel.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedRoom.roomType} room · {formatAmount(selectedRoom.price)} per night</p>
              </div>
              <button type="button" onClick={closeBooking} disabled={isBooking} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Close</button>
            </div>

            {bookingSuccess ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Booking confirmed</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Your room is reserved.</h3>
                <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <p>Booking #{bookingSuccess.bookingId}</p>
                  <p>Status: {bookingSuccess.status}</p>
                  <p>Check-in: {bookingSuccess.checkInDate}</p>
                  <p>Check-out: {bookingSuccess.checkOutDate}</p>
                  <p className="font-bold sm:col-span-2">Total: {formatAmount(bookingSuccess.totalAmount)}</p>
                </div>
                <button type="button" onClick={() => router.push('/bookings')} className="mt-5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-sky-700">View my bookings</button>
              </div>
            ) : (
              <form onSubmit={submitBooking} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Check in
                    <input required type="date" value={bookingCheckIn} onChange={(event) => setBookingCheckIn(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Check out
                    <input required type="date" min={bookingCheckIn || undefined} value={bookingCheckOut} onChange={(event) => setBookingCheckOut(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Guests
                  <input required min="1" max={selectedRoom.noOfBeds} type="number" value={bookingGuests} onChange={(event) => setBookingGuests(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                  <span className="text-xs font-normal text-slate-500">Up to {selectedRoom.noOfBeds} guests for this room.</span>
                </label>
                {bookingError && <p className="text-sm text-red-600" role="alert">{bookingError}</p>}
                <button type="submit" disabled={isBooking} className="w-full rounded-xl bg-[#f2643d] px-5 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#e4572d] disabled:cursor-not-allowed disabled:opacity-60">
                  {isBooking ? 'Confirming booking...' : 'Confirm and book'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function RoomCard({ room, onBook }: { room: Room; onBook: (room: Room) => void }) {
  const image = room.images?.[0] ?? room.hotel.images?.[0]

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,23,42,0.1)]">
      <div className="relative h-56 bg-slate-100">
        {image ? <img src={image} alt={`${room.roomType} at ${room.hotel.name}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">No image available</div>}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">{room.status}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-[-0.04em] text-slate-900">{room.hotel.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{room.hotel.location}</p>
          </div>
          {room.hotel.rating !== null && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700"><Star className="h-3.5 w-3.5 fill-current" />{room.hotel.rating}</span>}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div><p className="text-sm font-semibold text-slate-700">{room.roomType}</p><p className="mt-1 text-xs text-slate-500">{room.noOfBeds} beds · Room #{room.roomId}</p></div>
          <p className="text-right"><strong className="block text-xl tracking-tighter text-slate-900">{formatAmount(room.price)}</strong><span className="text-xs text-slate-500">per night</span></p>
        </div>
        <button type="button" onClick={() => onBook(room)} disabled={room.status !== 'AVAILABLE'} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
          {room.status === 'AVAILABLE' ? 'Book this room' : 'Currently unavailable'}
        </button>
      </div>
    </article>
  )
}

