import { Suspense } from 'react'
import ToolsClient from './ToolsClient'
import { PageLoading } from '@/app/(frontend)/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Browser-Based Tools - lst97',
  description:
    'Collection of free, fast, and private browser-based tools. Convert images, format code, manipulate PDFs and more without uploading your files.',
  keywords: [
    'free tools',
    'browser tools',
    'image converter',
    'no upload tools',
    'privacy-focused tools',
    'web utilities',
  ],
  openGraph: {
    title: 'Free Browser-Based Tools - lst97',
    description:
      'Collection of free, fast, and private browser-based tools. All processing happens in your browser, no file uploads needed.',
    images: [
      {
        url: '/og/tools.png',
        width: 1200,
        height: 630,
        alt: 'lst97 Browser Tools',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Browser-Based Tools - lst97',
    description:
      'Collection of free, fast, and private browser-based tools. All processing happens in your browser.',
    images: ['/og/tools.png'],
  },
  alternates: {
    canonical: '/tools',
  },
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading tools..." />}>
      <ToolsClient />
      <Footer />
    </Suspense>
  )
}
