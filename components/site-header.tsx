"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Globe2, Menu, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { clearAuthToken, getAuthToken } from '@/lib/auth'

const logoUrl ='./logo-booking.png'

export function SiteHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()))
  }, [])

  function handleLogout() {
    clearAuthToken()
    setIsLoggedIn(false)
    setMenuOpen(false)
    router.push('/login')
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="Hotel.ai home">
            <Image height={150} width={150} src={logoUrl} alt="Hotel.ai" />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/#stays">Find a stay</Link>
          {isLoggedIn ? (
            <>
              <Link href="/bookings">Bookings</Link>
              <Link href="/refunds">Refunds</Link>
              <button className="border-red-600 icon-text-button" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/#about">How it works</Link>
              <Link href="/register">Sign up</Link>
            </>
          )}
        </nav>

        <div className="header-actions">
          <button className="icon-text-button" type="button">
            <Globe2 />
            INR
          </button>
          <Link href="/profile" className="profile-button">
            <UserRound />
            Account
          </Link>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/#stays" onClick={() => setMenuOpen(false)}>
            Find a stay
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/bookings" onClick={() => setMenuOpen(false)}>
                Bookings
              </Link>
              <Link href="/refunds" onClick={() => setMenuOpen(false)}>
                Refunds
              </Link>
              <button className="border-red-600 icon-text-button" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/#about" onClick={() => setMenuOpen(false)}>
                How it works
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

export const siteLogoUrl = logoUrl
