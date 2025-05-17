'use client'

import { Suspense } from 'react'
import WelcomeClient from './WelcomeClient'
import { PageLoading } from '@/frontend/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'

export default function WelcomePage() {
  return (
    <Suspense fallback={<PageLoading message="Loading welcome page..." />}>
      <WelcomeClient />
      <Footer />
    </Suspense>
  )
}
