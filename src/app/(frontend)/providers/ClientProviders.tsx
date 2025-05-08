'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import {
  NavigationProgressProvider,
  ReactQueryProvider,
  TooltipProvider,
} from '@/frontend/providers'
import VercelProvider from './VercelProvider'
import SchemaOrg from '@/frontend/components/common/SchemaOrg'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <VercelProvider>
      <SchemaOrg type="WebSite" />
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
        <ReactQueryProvider>
          <NavigationProgressProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </NavigationProgressProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </VercelProvider>
  )
}
