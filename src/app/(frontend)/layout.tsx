import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/frontend/globals.css'
import { ClientProviders } from '@/frontend/providers'

const inter = Inter({ subsets: ['latin'] })

const ogDescription =
  'Personal website of Nelson Lai (LST97) - Full-Stack Developer specializing in React, Next.js, and modern web development with a focus on performance and user experience.'
const ogTitle = 'LST97 | Full-Stack Developer & Software Engineer'
const baseUrl = process.env.BASE_URL || 'https://lst97.dev'

// Encode OG image parameters
const ogImageParams = new URLSearchParams({
  title: 'LST97',
  description: 'Full-Stack Developer & Software Engineer',
  type: 'website',
}).toString()

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: ogTitle,
    template: '%s | LST97',
  },
  description: ogDescription,
  keywords: [
    'full-stack developer',
    'software engineer',
    'web development',
    'react',
    'next.js',
    'frontend',
    'backend',
    'pixel art',
    'game development',
    'nelson lai',
  ],
  authors: [{ name: 'Nelson Lai', url: 'https://github.com/lst97' }],
  creator: 'Nelson Lai',
  publisher: 'LST97',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'LST97',
    title: ogTitle,
    description: ogDescription,
    images: [
      {
        url: `${baseUrl}/api/og?${ogImageParams}`,
        width: 1200,
        height: 630,
        alt: 'LST97 - Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: ogTitle,
    description: ogDescription,
    images: [`${baseUrl}/api/og?${ogImageParams}`],
    creator: '@lst97',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with your actual verification code
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={baseUrl} />
      </head>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
