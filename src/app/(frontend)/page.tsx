// Server component that doesn't use any client hooks
import { Suspense } from 'react'
import LandingClient from './LandingClient'
import { ServerPageLoading } from '@/app/(frontend)/providers/LoadingProvider'

// Root component wrapped in suspense
export default function LandingPage() {
  return (
    <Suspense fallback={<ServerPageLoading message="Loading..." />}>
      <LandingClient />
    </Suspense>
  )
}
