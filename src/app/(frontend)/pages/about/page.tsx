'use client'

import { Suspense } from 'react'
import AboutClient from './AboutClient'
import { PageLoading } from '@/frontend/components/common/loading/Loading'

export default function AboutPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading about page..." />}>
      <AboutClient />
    </Suspense>
  )
}
