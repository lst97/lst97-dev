'use client'

import { Suspense } from 'react'
import ServicesClient from './ServicesClient'
import { PageLoading } from '@/frontend/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'

export default function ServicesPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading services..." />}>
      <ServicesClient />
      <Footer />
    </Suspense>
  )
}
