/**
 * This component provides a unified way to handle loading states across both server and client components.
 * It dynamically imports either the static or animated version of loading components,
 * preventing the "use export * in client boundary" error in Next.js.
 */

import React from 'react'
import { StaticLoadingSpinner, StaticPageLoading } from '@/frontend/components/common/loading'

interface SpinnerProps {
  message?: string
}

interface PageProps {
  message?: string
}

// This version can be safely used in server components
export const ServerLoadingSpinner: React.FC<SpinnerProps> = StaticLoadingSpinner
export const ServerPageLoading: React.FC<PageProps> = StaticPageLoading

// This component should be dynamically imported in client components
export const getClientLoadingComponents = async () => {
  const { LoadingSpinner, PageLoading } = await import('@/frontend/components/common/loading')
  return {
    ClientLoadingSpinner: LoadingSpinner,
    ClientPageLoading: PageLoading,
  }
}
