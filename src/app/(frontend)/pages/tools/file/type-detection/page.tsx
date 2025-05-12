import TypeDetectionPage from './FileTypeDetectionPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free File Type Detector - Identify File Types with AI | lst97',
  description:
    'Detect file types using Google Magika AI technology. Identify file formats and MIME types with high accuracy without uploading files.',
  keywords: [
    'file type detector',
    'file format identifier',
    'MIME type detection',
    'file analysis tool',
    'Google Magika AI',
    'free file analysis',
    'browser file type detector',
    'no upload file analyzer',
  ],
  openGraph: {
    title: 'Free File Type Detector - Identify File Types with AI | lst97',
    description:
      'Detect file types using Google Magika AI technology. Identify file formats and MIME types with high accuracy without uploading files.',
    images: [
      {
        url: '/og/file-detector.png',
        width: 1200,
        height: 630,
        alt: 'lst97 File Type Detection Tool',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free File Type Detector - Identify File Types with AI',
    description:
      'Detect file types using Google Magika AI technology. Identify file formats and MIME types without uploading files.',
    images: ['/og/file-detector.png'],
  },
  alternates: {
    canonical: '/tools/file/type-detection',
  },
}

export default function Page() {
  return <TypeDetectionPage />
}
