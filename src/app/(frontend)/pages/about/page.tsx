'use client'

import { Suspense } from 'react'
import AboutClient from './AboutClient'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'

// Loading component
function Loading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <LoadingSpinner />
      <div className="mt-4 font-pixel text-sm">Loading about page...</div>
    </div>
  )
}

// Client component that wraps the client component in a Suspense boundary
export default function AboutPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AboutClient />
    </Suspense>
  )
}
