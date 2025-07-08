import { Suspense } from 'react'
import DinoGameClient from './DinoGameClient'
import { PageLoading } from '@/frontend/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dino Game - lst97',
  description:
    'A simple, offline-friendly recreation of the classic Chrome Dino game.',
  keywords: [
    'dino game',
    'chrome dino',
    'browser game',
    'offline game',
    'javascript game',
  ],
  openGraph: {
    title: 'Dino Game - lst97',
    description:
      'A simple, offline-friendly recreation of the classic Chrome Dino game.',
    images: [
      {
        url: '/og/dino-game.png',
        width: 1200,
        height: 630,
        alt: 'Dino Game',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dino Game - lst97',
    description:
      'A simple, offline-friendly recreation of the classic Chrome Dino game.',
    images: ['/og/dino-game.png'],
  },
  alternates: {
    canonical: '/games/dino',
  },
}

export default function DinoGamePage() {
  return (
    <Suspense fallback={<PageLoading message="Loading game..." />}>
      <DinoGameClient />
      <Footer />
    </Suspense>
  )
}
