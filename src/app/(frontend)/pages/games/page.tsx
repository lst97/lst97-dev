import { Suspense } from 'react'
import GamesClient from './GamesClient'
import { PageLoading } from '@/frontend/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browser-Based Games - lst97',
  description:
    'Collection of fun browser-based games. Play classic and new games directly in your browser.',
  keywords: [
    'browser games',
    'online games',
    'free games',
    'web games',
    'in-browser games',
  ],
  openGraph: {
    title: 'Browser-Based Games - lst97',
    description:
      'Collection of fun browser-based games to play directly in your browser.',
    images: [
      {
        url: '/og/games.png',
        width: 1200,
        height: 630,
        alt: 'lst97 Browser Games',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browser-Based Games - lst97',
    description:
      'Collection of fun browser-based games to play directly in your browser.',
    images: ['/og/games.png'],
  },
  alternates: {
    canonical: '/games',
  },
}

export default function GamesPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading games..." />}>
      <GamesClient />
      <Footer />
    </Suspense>
  )
}
