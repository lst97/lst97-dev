'use client'

import { Suspense } from 'react'
import ServicesClient from './ServicesClient'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import { Footer } from '@/frontend/components/footer'

// Loading component
function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoadingSpinner />
      <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
        Loading services...
      </div>
    </div>
  )
}

// Client component that wraps the client component in a Suspense boundary
export default function ServicesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ServicesClient />
      <Footer />
    </Suspense>
  )
}
