'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import {
  NavigationProgressProvider,
  ReactQueryProvider,
  TooltipProvider,
} from '@/frontend/providers'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <ReactQueryProvider>
        <NavigationProgressProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </NavigationProgressProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  )
}
