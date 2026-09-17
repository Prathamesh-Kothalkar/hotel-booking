'use client'

import {
  AlertCircle,
  Check,
  ChevronRight,
  Download,
  MapPin,
  Users,
  Star,
} from 'lucide-react'
import {
  BookingConfirmation,
  BookingConfirmationCardProps,
  ChatMessageProps,
  EnhancedChatResponse,
  ResponseType,
  RoomCardProps,
  RoomResult,
  SearchResultsViewProps,
} from '@/lib/Hotel-booking.types'

export interface MessageRendererProps {
  message: EnhancedChatResponse
  onAction?: (action: string) => void
  onRoomSelect?: (room: RoomResult) => void
}

export interface SuggestedActionsProps {
  actions?: string[]
  onAction?: (action: string) => void
}

export interface QuestionPromptProps {
  message: string
  actions?: string[]
  onAction?: (action: string) => void
}

export interface TextMessageProps {
  text: string
}

export interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export interface RoomSearchResultsProps extends SearchResultsViewProps {
  onRoomSelect?: (room: RoomResult) => void
}

function formatPrice(price: number | null | undefined) {
  if (typeof price !== 'number' || Number.isNaN(price)) return 'Price unavailable'
  return `₹${price.toLocaleString('en-IN')}`
}

function responseLabel(responseType: string) {
  return responseType.replaceAll('_', ' ').toLowerCase()
}

/** Routes each structured assistant response to its matching presentation component. */
export function MessageRenderer({ message, onAction, onRoomSelect }: MessageRendererProps) {
  switch (message.responseType) {
    case ResponseType.SEARCH_RESULTS:
      return (
        <>
          <TextMessage text={message.reply} />
          <RoomSearchResults
            results={message.searchResults ?? []}
            suggestedActions={message.suggestedActions}
            onActionSelect={onAction}
            onRoomSelect={onRoomSelect}
          />
        </>
      )
    case ResponseType.BOOKING_CONFIRMATION:
      return message.bookingConfirmation ? (
        <>
          <TextMessage text={message.reply} />
          <BookingConfirmationCard
            booking={message.bookingConfirmation}
            onDownload={() => onAction?.('Download receipt')}
            onNewSearch={() => onAction?.('Search again')}
            onViewBookings={() => onAction?.('View bookings')}
          />
        </>
      ) : <ErrorMessage message="The booking confirmation was incomplete." />
    case ResponseType.QUESTION:
      return (
        <QuestionPrompt
          message={message.reply}
          actions={message.suggestedActions}
          onAction={onAction}
        />
      )
    case ResponseType.ERROR:
      return <ErrorMessage message={message.error || message.reply || 'Something went wrong.'} onRetry={() => onAction?.('Retry')} />
    case ResponseType.TEXT:
    case 'ROOM_SELECTED':
    default:
      return <TextMessage text={message.reply} />
  }
}

export function SuggestedActions({ actions = [], onAction }: SuggestedActionsProps) {
  if (!actions.length) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction?.(action)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:scale-[1.02] hover:border-blue-400 hover:shadow-md active:scale-95"
        >
          {action}
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  )
}

export function RoomSearchResults({
  results,
  suggestedActions,
  onActionSelect,
  onRoomSelect,
}: RoomSearchResultsProps) {
  return (
    <div className="mt-3 space-y-3">
      {results.length ? (
        results.map((room) => (
          <RoomCard key={room.roomId} room={room} onSelect={(roomId) => {
            const selectedRoom = results.find((item) => item.roomId === roomId)
            if (selectedRoom) onRoomSelect?.(selectedRoom)
          }} />
        ))
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No rooms matched those preferences.
        </div>
      )}
      <SuggestedActions actions={suggestedActions} onAction={onActionSelect} />
    </div>
  )
}

export function RoomCard({ room, onSelect, isSelected = false }: RoomCardProps) {
  const image = room.images?.[0]
  const roomType = room.roomType.toLowerCase()
  const badgeClass = roomType.includes('super')
    ? 'bg-purple-100 text-purple-700'
    : roomType.includes('deluxe')
      ? 'bg-green-100 text-green-700'
      : 'bg-blue-100 text-blue-700'

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'}`}>
      <div className="flex gap-3 p-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-blue-50 to-indigo-100 text-3xl">
          {image ? <img src={image} alt={room.hotelName} className="h-full w-full object-cover" /> : '🏨'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-gray-900">{room.hotelName}</h3>
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {room.location || 'Location unavailable'}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
              {room.roomType}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <Users className="h-3.5 w-3.5" /> {room.noOfBeds} {room.noOfBeds === 1 ? 'bed' : 'beds'} · #{room.roomId}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" /> {room.rating ?? 'New'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-3">
        <div>
          <strong className="text-lg font-black text-gray-900">{formatPrice(room.price)}</strong>
          <span className="ml-1 text-xs text-gray-500">/ night</span>
        </div>
        <button
          type="button"
          disabled={room.status !== 'AVAILABLE'}
          onClick={() => onSelect?.(room.roomId)}
          className="rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:shadow-md disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400"
        >
          {room.status === 'AVAILABLE' ? 'Select Room' : room.status}
        </button>
      </div>
    </article>
  )
}

export function BookingConfirmationCard({
  booking,
  onDownload,
  onNewSearch,
  onViewBookings,
}: BookingConfirmationCardProps & { onViewBookings?: () => void }) {
  const details = [
    ['Booking ID', `#${booking.bookingId}`],
    ['Hotel', booking.hotel],
    ['Room', booking.roomType],
    ['Dates', `${booking.checkInDate} – ${booking.checkOutDate}`],
    ['Guests', `${booking.numGuests}`],
    ['Status', booking.status || 'CONFIRMED'],
  ]

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 bg-green-50 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white"><Check className="h-5 w-5" /></span>
        <div><p className="text-sm font-bold text-green-800">Booking confirmed</p><p className="text-xs text-green-700">Your stay is reserved.</p></div>
        <span className="ml-auto rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">{booking.status || 'CONFIRMED'}</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-gray-100">
        {details.map(([label, value]) => <div key={label} className="bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 truncate text-sm font-semibold text-gray-800">{value || '—'}</p></div>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
        <div><p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Total amount</p><p className="text-2xl font-black text-gray-900">{formatPrice(booking.totalAmount)}</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onViewBookings} className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">View bookings</button>
          <button type="button" onClick={onNewSearch} className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Search again</button>
          <button type="button" onClick={onDownload} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"><Download className="h-3.5 w-3.5" /> Receipt</button>
        </div>
      </div>
    </div>
  )
}

export function QuestionPrompt({ message, actions = [], onAction }: QuestionPromptProps) {
  return (
    <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <TextMessage text={message} />
      <SuggestedActions actions={actions} onAction={onAction} />
    </div>
  )
}

export function ChatMessage({ message, onAction, onRoomSelect }: ChatMessageProps) {
  const isUser = message.type === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${isUser ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
        {message.reply ? <MessageRenderer message={message} onAction={onAction} onRoomSelect={onRoomSelect} /> : <LoadingDots />}
        {message.timestamp && <time className="mt-2 block text-[10px] opacity-60">{message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>}
      </div>
    </div>
  )
}

export function LoadingDots() {
  return <div className="flex items-center gap-1 p-2" role="status" aria-label="Loading"><span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-current" /></div>
}

export function TextMessage({ text }: TextMessageProps) {
  return <div className="whitespace-pre-wrap text-sm leading-6 text-gray-800">{text || 'No response available.'}</div>
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1"><p>{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-2 font-bold underline underline-offset-2 hover:text-red-900">Try again</button>}</div>
    </div>
  )
}
