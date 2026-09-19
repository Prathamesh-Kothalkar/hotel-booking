"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import { AccountCard, AccountShell } from '@/components/account-shell'
import { clearAuthToken, getApiUrl, getAuthToken } from '@/lib/auth'
import { ProfileSkeleton } from '@/components/ui/page-skeleton'

type UserProfile = {
  name: string
  email: string
  phone: string | number
}

const emptyProfile: UserProfile = { name: '', email: '', phone: '' }

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const token = getAuthToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    async function loadProfile() {
      try {
        const response = await fetch(getApiUrl('/users/my-profile'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 401) {
          clearAuthToken()
          setError('Your session has expired. Please log in again.')
          return
        }

        if (!response.ok) {
          setError('Unable to load your profile. Please try again.')
          return
        }

        const data: UserProfile = await response.json()
        setProfile({
          name: data.name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
        })
        setIsAuthenticated(true)
      } catch(err) {
        setError('Unable to connect to the server. Please try again.'+(err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  function handleProfileChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setSaved(false)
  }

  function handleLogout() {
    clearAuthToken()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <AccountShell title="Profile settings" description="Loading your profile...">
        <ProfileSkeleton />
      </AccountShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AccountShell
        title="Profile settings"
        description="Sign in to view and manage your traveler details."
      >
        <AccountCard>
          <p className="text-slate-700" role="alert">
            {error || 'Please log in first to view your profile.'}
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

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <AccountShell
      title="Profile settings"
      description="Keep your traveler details up to date so every booking feels effortless."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AccountCard>
          <h2 className="text-xl font-semibold text-slate-900">Personal details</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Full name
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Email address
              <input
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                type="email"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Phone number
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                type="tel"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-sky-700"
            >
              {saved ? 'Changes saved' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </AccountCard>

        <AccountCard>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {initials || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{profile.name}</h2>
              <p className="text-sm text-slate-500">Authenticated account</p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Email</p>
            <p className="mt-1 break-all font-medium text-slate-900">{profile.email}</p>
          </div>
        </AccountCard>
      </div>
    </AccountShell>
  )
}
