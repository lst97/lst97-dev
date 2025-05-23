// Server component that doesn't use any client hooks
import { Suspense } from 'react'
import { Metadata } from 'next'
import LandingClient from './LandingClient'
import { ServerPageLoading } from '@/frontend/providers/LoadingProvider'

// Define metadata for better SEO
export const metadata: Metadata = {
  title: 'LST97.DEV - Full-Stack Developer & Software Engineer',
  description:
    'Personal website of Nelson Lai (LST97) - Full-Stack Developer specializing in React, Next.js, and modern web development.',
  keywords: ['Developer', 'Software Engineer', 'Full-Stack', 'React', 'Next.js', 'Pixel Art'],
  authors: [{ name: 'Nelson Lai', url: 'https://lst97.dev' }],
  openGraph: {
    title: 'LST97.DEV - Full-Stack Developer & Software Engineer',
    description:
      'Personal website of Nelson Lai (LST97) - Full-Stack Developer specializing in React, Next.js, and modern web development.',
    url: 'https://lst97.dev',
    siteName: 'LST97.DEV',
    images: [
      {
        url: 'https://lst97.dev/me-pixel-art.png',
        width: 256,
        height: 256,
        alt: 'Nelson Lai - Full-Stack Developer pixel art portrait',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LST97.DEV - Full-Stack Developer & Software Engineer',
    description:
      'Personal website of Nelson Lai (LST97) - Full-Stack Developer specializing in React, Next.js, and modern web development.',
    images: ['https://lst97.dev/me-pixel-art.png'],
  },
}

// Root component wrapped in suspense for SSR support
export default function LandingPage() {
  return (
    <Suspense fallback={<ServerPageLoading message="Loading..." />}>
      <LandingClient />
    </Suspense>
  )
}
