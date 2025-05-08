'use client'

import { Suspense } from 'react'
import WelcomeClient from './WelcomeClient'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import { Footer } from '@/frontend/components/footer'

// Loading component
function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoadingSpinner />
      <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading welcome page...</div>
    </div>
  )
}

// Client component that wraps the client component in a Suspense boundary
export default function WelcomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <WelcomeClient />
      <Footer />
    </Suspense>
  )
}
