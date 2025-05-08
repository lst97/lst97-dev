// Server component that doesn't use any client hooks
import { Suspense } from 'react'
import LandingClient from './LandingClient'

// Loading component
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-pixel text-xl">Loading...</div>
    </div>
  )
}

// Root component wrapped in suspense
export default function LandingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LandingClient />
    </Suspense>
  )
}
