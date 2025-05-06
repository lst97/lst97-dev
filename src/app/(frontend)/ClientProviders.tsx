'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { ReactQueryProvider } from '@/frontend/providers/ReactQueryProvider'
import SchemaOrg from './components/common/SchemaOrg'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light">
      <ReactQueryProvider>
        {/* Add SchemaOrg component for site-wide structured data */}
        <SchemaOrg type="WebSite" />
        {children}
      </ReactQueryProvider>
    </ThemeProvider>
  )
}
