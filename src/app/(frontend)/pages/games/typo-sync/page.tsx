import { Suspense } from 'react'
import TypoSyncGameClient from './TypoSyncGameClient'
import type { Metadata } from 'next'
import { PageLoading } from '@/frontend/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'

export const metadata: Metadata = {
  title: 'TypoSync Game - A Rhythm Typing Game | lst97',
  description:
    'TypoSync is a rhythm-based typing game. Test your typing speed and accuracy while syncing to the beat.',
  keywords: ['typing game', 'rhythm game', 'browser game', 'typing test', 'TypoSync'],
  openGraph: {
    title: 'TypoSync Game - A Rhythm Typing Game | lst97',
    description:
      'TypoSync is a rhythm-based typing game. Test your typing speed and accuracy while syncing to the beat.',
    images: [
      {
        url: '/og/typo-sync-game.png',
        width: 1200,
        height: 630,
        alt: 'TypoSync Game',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypoSync Game - A Rhythm Typing Game',
    description:
      'TypoSync is a rhythm-based typing game. Test your typing speed and accuracy while syncing to the beat.',
    images: ['/og/typo-sync-game.png'],
  },
  alternates: {
    canonical: '/games/typo-sync',
  },
}

export default function TypoSyncGamePage() {
  return (
    <Suspense fallback={<PageLoading message="Loading game..." />}>
      <TypoSyncGameClient />
      <Footer />
    </Suspense>
  )
}
