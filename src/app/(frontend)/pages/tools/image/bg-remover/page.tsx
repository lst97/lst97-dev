import ImageBackgroundRemoverPage from './ImageBackgroundRemoverPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free AI Background Remover with Multi-Threaded Processing | lst97',
  description:
    "Remove image backgrounds instantly with our high-performance AI tool. Uses multi-threaded processing with BRIA AI's RMBG-1.4 (fp32) model. No uploads, 100% private, browser-based.",
  keywords: [
    'background remover',
    'remove background from image',
    'transparent background',
    'ai background remover',
    'free background removal',
    'browser background remover',
    'no upload background remover',
    'multi-threaded image processing',
    'RMBG-1.4 model',
    'client-side background removal',
    'web workers',
    'private image processing',
    'batch image processing',
    'product photography tool',
    'transparent PNG creator',
    'offline background remover',
  ],
  openGraph: {
    title: 'Free AI Background Remover with Multi-Threaded Processing | lst97',
    description:
      "Remove backgrounds instantly with our high-performance AI tool. Features multi-threaded processing with 8 parallel workers using BRIA AI's RMBG-1.4 (fp32) model. All processing happens in your browser for complete privacy.",
    images: [
      {
        url: '/og/bg-remover.png',
        width: 1200,
        height: 630,
        alt: 'lst97 Background Remover Tool - AI-powered image processing',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Background Remover with Multi-Threaded Processing',
    description:
      "Remove backgrounds with our high-performance AI tool. Uses multi-threaded Web Workers (2 preprocessing, 4 segmentation, 2 postprocessing) with BRIA AI's RMBG-1.4 model. 100% private, browser-based.",
    images: ['/og/bg-remover.png'],
  },
  alternates: {
    canonical: '/tools/image/bg-remover',
  },
}

export default function Page() {
  return <ImageBackgroundRemoverPage />
}
