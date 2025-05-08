'use client'

import { Suspense } from 'react'
import ProjectsClient from './ProjectsClient'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import { Footer } from '@/frontend/components/footer'

// Loading component
function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoadingSpinner />
      <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
        Loading projects...
      </div>
    </div>
  )
}

// Client component that wraps the client component in a Suspense boundary
export default function ProjectsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectsClient />
      <Footer />
    </Suspense>
  )
}
