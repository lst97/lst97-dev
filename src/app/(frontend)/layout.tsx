import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/frontend/globals.css'
import ClientProviders from '@/frontend/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LST97',
  description: 'A personal website for LST97',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
