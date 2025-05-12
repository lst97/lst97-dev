import ImageTools from './ImageTools'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Image Tools - Browser-Based Image Processing | lst97',
  description:
    'Free online image tools for converting formats, removing backgrounds, and more. All processing happens locally in your browser with no file uploads.',
  keywords: [
    'image tools',
    'image converter',
    'background remover',
    'browser-based image tools',
    'no upload image tools',
    'free image processing',
  ],
  openGraph: {
    title: 'Free Image Tools - Browser-Based Image Processing | lst97',
    description:
      'Free online image tools for converting formats, removing backgrounds, and more. Your files never leave your device.',
    images: [
      {
        url: '/og/image-tools.png',
        width: 1200,
        height: 630,
        alt: 'lst97 Image Tools',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Tools - Browser-Based Image Processing',
    description:
      'Free online image tools for converting formats, removing backgrounds, and more. Your files never leave your device.',
    images: ['/og/image-tools.png'],
  },
  alternates: {
    canonical: '/tools/image',
  },
}

export default function Page() {
  return <ImageTools />
}
