'use client'

import { Suspense } from 'react'
import ResourcesClient from './ResourcesClient'
import { PageLoading } from '@/app/(frontend)/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'

export default function ResourcesPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading resources..." />}>
      <ResourcesClient />
      <Footer />
    </Suspense>
  )
}
