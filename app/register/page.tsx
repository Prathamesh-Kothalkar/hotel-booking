"use client"

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { getApiUrl, storeAuthToken } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.status === 409) {
        setError('An account with this email is already registered.')
        return
      }

      if (!response.ok) {
        setError('Unable to create your account. Please try again.')
        return
      }

      const data: { token?: string } = await response.json()
      if (!data.token) {
        setError('The server did not return an authentication token.')
        return
      }

      storeAuthToken(data.token)
      router.push('/profile')
    } catch(err) {
      setError('Unable to connect to the server. Please try again.' + (err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.2),_transparent_25%),linear-gradient(180deg,_#f6f9fb_0%,_#eef7fb_100%)] px-4 py-10">
        <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_40px_90px_rgba(15,23,42,0.12)] lg:p-10">
          <Link href="/" className="mb-10 block">
            <img
              src="./logo-booking.png"
              alt="Hotel.ai"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Start exploring</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Save favorite stays and let Hotel.ai help you travel smarter.
          </p>

          <form
            className="mt-8 flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Full name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Morgan"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Create password
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

            <button
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
