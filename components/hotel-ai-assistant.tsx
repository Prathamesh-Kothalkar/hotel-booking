'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clearAuthToken, getApiUrl, getAuthToken } from '@/lib/auth'
import { ChatMessage, EnhancedChatResponse, ResponseType, RoomResult } from '@/lib/Hotel-booking.types'
import { LoadingDots, MessageRenderer } from '@/components/chat-message-renderer'

export const ASSISTANT_OPEN_EVENT = 'hotel-ai:open-assistant'

export function openHotelAssistant() {
  window.dispatchEvent(new Event(ASSISTANT_OPEN_EVENT))
}

export function HotelAiAssistant() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const handleOpen = () => {
      setIsLoggedIn(Boolean(getAuthToken()))
      setOpen(true)
    }

    window.addEventListener(ASSISTANT_OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, handleOpen)
  }, [])

  function handleOpen() {
    setIsLoggedIn(Boolean(getAuthToken()))
    setOpen(true)
  }

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim()
    const token = getAuthToken()

    if (!trimmedMessage || isSending) return
    if (!token) {
      setIsLoggedIn(false)
      setError('Please log in to chat with Hotel.ai.')
      return
    }

    setMessages((current) => [...current, {
      reply: trimmedMessage,
      responseType: ResponseType.TEXT,
      type: 'user',
      timestamp: new Date(),
    }])
    setQuestion('')
    setError('')
    setIsSending(true)

    try {
      const response = await fetch(getApiUrl('/chat'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedMessage, sessionId }),
      })

      if (response.status === 401) {
        clearAuthToken()
        setIsLoggedIn(false)
        setError('Your session has expired. Please log in again.')
        return
      }

      if (!response.ok) {
        setError('The assistant could not answer right now. Please try again.')
        return
      }

      const data: EnhancedChatResponse = await response.json()
      if (!data.reply && data.responseType !== ResponseType.ERROR) {
        setError('The assistant returned an empty response. Please try again.')
        return
      }

      setMessages((current) => [...current, { ...data, type: 'bot', timestamp: new Date() }])
    } catch {
      setError('Unable to connect to the assistant. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(question)
  }

  function handleAction(action: string) {
    void sendMessage(action)
  }

  function handleRoomSelect(room: RoomResult) {
    void sendMessage(`I want to select room ${room.roomId} at ${room.hotelName}.`)
  }

  return (
    <>
      <button type="button" className="assistant-launcher" onClick={handleOpen} aria-label="Open Hotel.ai assistant">
        <MessageCircle className="h-5 w-5" />
        <span>Ask Hotel.ai</span>
      </button>

      {open && (
        <div className="assistant-overlay" role="presentation" onClick={() => setOpen(false)}>
          <aside
            className="assistant-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="section-kicker">Hotel.ai concierge</span>
                <h2 id="assistant-title">How can I help?</h2>
              </div>
              <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isLoggedIn ? (
              <div className="assistant-login-prompt">
                <div className="assistant-icon">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3>Sign in to chat with Hotel.ai</h3>
                <p>Log in to ask travel questions, save conversations, and get help with your stays.</p>
                <Link href="/login" onClick={() => setOpen(false)} className="assistant-login-button">
                  Log in to continue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="assistant-conversation" aria-live="polite">
                  {messages.length === 0 && (
                    <div className="assistant-message">
                      <div className="assistant-avatar">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p>Hi there. Tell me where you’re going, or the kind of stay you’re dreaming about.</p>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div key={`${message.type ?? 'bot'}-${index}`} className={`mb-3 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${message.type === 'user' ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        <MessageRenderer message={message} onAction={handleAction} onRoomSelect={handleRoomSelect} />
                      </div>
                    </div>
                  ))}

                  {isSending && <div className="mb-3 flex justify-start"><div className="rounded-2xl bg-gray-100 text-gray-800"><LoadingDots /></div></div>}
                </div>

                <div className="suggestion-list">
                  {['Find a romantic weekend', 'Best hotels near the beach', 'Help me choose a destination'].map((suggestion) => (
                    <button key={suggestion} type="button" disabled={isSending} onClick={() => void sendMessage(suggestion)}>
                      {suggestion}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <form className="drawer-input" onSubmit={handleSubmit}>
                  <input disabled={isSending} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask anything about your stay..." aria-label="Ask Hotel.ai" />
                  <button type="submit" disabled={isSending || !question.trim()} aria-label="Send question">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                {error && <small className="assistant-error" role="alert">{error}</small>}
                <small className="signin-note">Your concierge is ready to help with your next stay.</small>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
