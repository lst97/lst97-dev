'use client'

import { Suspense } from 'react'
import ResourcesClient from './ResourcesClient'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'

// Loading component
function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 mt-32">
      <LoadingSpinner />
      <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
        Loading resources...
      </div>
    </div>
  )
}

// Client component that wraps the client component in a Suspense boundary
export default function ResourcesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResourcesClient />
    </Suspense>
  )
}
