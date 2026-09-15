'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { openHotelAssistant } from '@/components/hotel-ai-assistant'
import { SiteHeader } from '@/components/site-header'
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Heart,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from 'lucide-react'

const hotels = [
  {
    name: 'The Hoxton, Rome',
    place: 'Rome, Italy',
    price: '$189',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=85',
    tag: 'Guest favorite',
  },
  {
    name: 'Hotel Saint Cecilia',
    place: 'Austin, Texas',
    price: '$245',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85',
    tag: 'Quiet luxury',
  },
  {
    name: 'Casa Cook Rhodes',
    place: 'Rhodes, Greece',
    price: '$312',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=85',
    tag: 'Design-led stay',
  },
]

const destinations = [
  {
    name: 'New York',
    count: '1,240 stays',
    image:
      'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Paris',
    count: '982 stays',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Tokyo',
    count: '864 stays',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Lisbon',
    count: '711 stays',
    image:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=700&q=80',
  },
]

export default function Page() {
  const router = useRouter()
  const [saved, setSaved] = useState<string[]>([])
  const [destination, setDestination] = useState('Anywhere')
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [guests, setGuests] = useState(2)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    if (destination.trim() && destination !== 'Anywhere') params.set('location', destination.trim())
    if (guests) params.set('guests', String(guests))
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    router.push(`/rooms?${params.toString()}`)
  }

  const toggleSaved = (name: string) =>
    setSaved((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden pb-14 pt-12 md:pt-16" id="top">
        <div className="shell relative">
          <div className="absolute -right-28 top-0 h-[26rem] w-[30rem] rounded-full bg-sky-200/60 blur-3xl" />
          <div className="absolute right-8 top-16 h-[18rem] w-[18rem] rounded-full border border-sky-200/80" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Your always-on travel co-pilot
            </div>

            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.08em] text-slate-900 md:text-7xl lg:text-[5rem]">
              Stay somewhere
              <span className="mt-2 block font-serif italic font-medium text-sky-700">worth remembering.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              Hotel.ai finds the right place for the way you want to travel — with real answers,
              thoughtful recommendations, and support at any hour.
            </p>

            <div className="mt-8 max-w-5xl rounded-[24px] border border-slate-200 bg-white p-2.5 shadow-[0_25px_80px_rgba(15,23,42,0.12)]" id="stays">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="flex min-h-[72px] flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4">
                  <Search className="h-4 w-4 text-sky-700" />
                  <div className="flex-1">
                    <label htmlFor="destination" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Where to?
                    </label>
                    <input
                      id="destination"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                      aria-label="Destination"
                      className="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      placeholder="Pune"
                    />
                  </div>
                </div>

                <div className="flex min-h-[72px] flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4">
                  <CalendarDays className="h-4 w-4 text-sky-700" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Check in</p>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(event) => setCheckIn(event.target.value)}
                      className="mt-1 w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                      aria-label="Check-in date"
                    />
                  </div>
                </div>

                <div className="flex min-h-[72px] flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4">
                  <CalendarDays className="h-4 w-4 text-sky-700" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Check out</p>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || undefined}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="mt-1 w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                      aria-label="Check-out date"
                    />
                  </div>
                </div>

                <div className="relative flex min-h-[72px] flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4">
                  <UserRound className="h-4 w-4 text-sky-700" />
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-between gap-3 text-left"
                    onClick={() => setGuestsOpen(!guestsOpen)}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Guests</p>
                      <span className="mt-1 block text-sm font-semibold text-slate-800">{guests} guests</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {guestsOpen && (
                    <div className="absolute left-3 top-[82px] z-10 flex w-[200px] items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                      <span className="text-sm font-medium text-slate-700">Adults</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600"
                          onClick={() => setGuests((current) => Math.max(1, current - 1))}
                        >
                          −
                        </button>
                        <strong className="min-w-4 text-center text-sm text-slate-900">{guests}</strong>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600"
                          onClick={() => setGuests((current) => current + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-2xl bg-[#f2643d] px-6 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e4572d]"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              <SlidersHorizontal className="h-4 w-4 text-sky-700" />
              Tell us what matters to you. Hotel.ai will do the rest.
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="inspiration">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Go somewhere good</span>
            <h2>Popular right now</h2>
          </div>
          <a href="#stays" className="arrow-link">
            Explore all
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="destination-grid">
          {destinations.map((destinationItem) => (
            <a className="destination-card" href="#stays" key={destinationItem.name}>
              <img src={destinationItem.image} alt={`${destinationItem.name} travel`} />
              <div className="destination-overlay">
                <strong>{destinationItem.name}</strong>
                <span>{destinationItem.count}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="section shell" id="about">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Chosen by Hotel.ai</span>
            <h2>Stays with a little more soul</h2>
          </div>
          <button className="filter-button" type="button">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="hotel-grid">
          {hotels.map((hotel) => {
            const isSaved = saved.includes(hotel.name)

            return (
              <article className="hotel-card" key={hotel.name}>
                <div className="hotel-image-wrap">
                  <img src={hotel.image} alt={hotel.name} />
                  <span className="hotel-tag">{hotel.tag}</span>
                  <button
                    className={`heart-button ${isSaved ? 'is-saved' : ''}`}
                    type="button"
                    aria-label={`Save ${hotel.name}`}
                    onClick={() => toggleSaved(hotel.name)}
                  >
                    <Heart className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="hotel-info">
                  <div className="hotel-title-row">
                    <div>
                      <h3>{hotel.name}</h3>
                      <p>{hotel.place}</p>
                    </div>
                    <span className="rating">★ {hotel.rating}</span>
                  </div>

                  <div className="hotel-bottom">
                    <span>
                      From <strong>{hotel.price}</strong> <small>/ night</small>
                    </span>
                    <button type="button" onClick={openHotelAssistant}>
                      Ask Hotel.ai
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="assistant-banner">
        <div className="shell assistant-inner">
          <div className="assistant-icon">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="section-kicker">Need a second opinion?</span>
            <h2>Ask Hotel.ai anything.</h2>
            <p>“Is this neighborhood good for a first visit?” “Find me a quiet room with a bathtub.”</p>
          </div>
          <button type="button" className="dark-button" onClick={openHotelAssistant}>
            Chat with Hotel.ai
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <div className="footer-brand">
            <div className="brand-copy">
              <strong>
                Hotel<span>.ai</span>
              </strong>
              <small>24x7 AI Support</small>
            </div>
            <p>Better stays begin with better questions.</p>
          </div>

          <div className="footer-links">
            <a href="#stays">Find a stay</a>
            <a href="#inspiration">Inspiration</a>
            <a href="#about">About us</a>
            <a href="#top">Support</a>
          </div>

          <span className="copyright">© 2025 Hotel.ai</span>
        </div>
      </footer>

    </main>
  )
}
