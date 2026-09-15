import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { HotelAiAssistant } from '@/components/hotel-ai-assistant'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hotel.ai — 24x7 AI Agent Support',
  description: 'Hotel.ai is your always-on travel co-pilot for finding better stays and getting real answers at any hour.',
  generator: 'Next.js',
  applicationName: 'Hotel.ai',
  referrer: 'origin-when-cross-origin',
  keywords: ['Hotel.ai', 'AI Agent', 'Travel', 'Stays', 'Bookings', 'Support'],
  authors: [{ name: 'Prathamesh Kothalkar', url: '' }],
  colorScheme: 'light',
  creator: 'Prathamesh Kothalkar',
  publisher: 'Prathamesh Kothalkar',
 
  openGraph: {
    title: 'Hotel.ai — 24x7 AI Agent Support',
    description: 'Hotel.ai is your always-on travel co-pilot for finding better stays and getting real answers at any hour.',
    url: 'https://hotel-ai.vercel.app',
    siteName: 'Hotel.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#dbeef1',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <link rel="icon" href="/favicon.png" sizes="any" />
      <body className="antialiased">
        {children}
        <HotelAiAssistant />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
