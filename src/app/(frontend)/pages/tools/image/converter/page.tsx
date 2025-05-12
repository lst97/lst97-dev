import ImageConverterPage from './ImageConverterPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Image Converter - Convert JPG, PNG, WebP | lst97',
  description:
    'Convert images between JPG, PNG, WebP, and other formats for free. Fast browser-based tool with no file uploads and complete privacy.',
  keywords: [
    'image converter',
    'jpg to png',
    'png to webp',
    'webp converter',
    'free image conversion',
    'browser image converter',
    'no upload image converter',
  ],
  openGraph: {
    title: 'Free Image Converter - Convert JPG, PNG, WebP | lst97',
    description:
      'Convert images between JPG, PNG, WebP, and other formats for free. Fast browser-based tool with no file uploads and complete privacy.',
    images: [
      {
        url: '/og/image-converter.png',
        width: 1200,
        height: 630,
        alt: 'lst97 Image Converter Tool',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Converter - Convert JPG, PNG, WebP',
    description:
      'Convert images between JPG, PNG, WebP, and other formats for free. Fast browser-based tool with no file uploads.',
    images: ['/og/image-converter.png'],
  },
  alternates: {
    canonical: '/tools/image/converter',
  },
}

export default function Page() {
  return <ImageConverterPage />
}
