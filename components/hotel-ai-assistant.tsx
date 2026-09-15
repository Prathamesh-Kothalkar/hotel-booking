'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clearAuthToken, getApiUrl, getAuthToken } from '@/lib/auth'

export const ASSISTANT_OPEN_EVENT = 'hotel-ai:open-assistant'

export function openHotelAssistant() {
  window.dispatchEvent(new Event(ASSISTANT_OPEN_EVENT))
}

export function HotelAiAssistant() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

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

    setMessages((current) => [...current, { role: 'user', content: trimmedMessage }])
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
        body: JSON.stringify({ message: trimmedMessage }),
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

      const data: { reply?: string } = await response.json()
      if (!data.reply) {
        setError('The assistant returned an empty response. Please try again.')
        return
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.reply! }])
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
                    <div key={`${message.role}-${index}`} className={`assistant-message ${message.role === 'user' ? 'assistant-message-user' : ''}`}>
                      {message.role === 'assistant' && (
                        <div className="assistant-avatar">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      )}
                      <p>{message.content}</p>
                    </div>
                  ))}
                  {isSending && <p className="assistant-typing" role="status">Hotel.ai is thinking...</p>}
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
