'use client'

import { ReactNode } from 'react'
import NextNavigationProgressBar from '@/frontend/components/common/NextNavigationProgressBar'

interface NavigationProgressProviderProps {
  children: ReactNode
}

export default function NavigationProgressProvider({ children }: NavigationProgressProviderProps) {
  return (
    <>
      <NextNavigationProgressBar height={8} />
      {children}
    </>
  )
}
