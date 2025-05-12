import FileTools from './FileTools'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free File Tools - Browser-Based File Processing | lst97',
  description:
    'Free online file tools for file type detection and other file operations. All processing happens locally in your browser with no file uploads.',
  keywords: [
    'file tools',
    'file type detection',
    'file analyzer',
    'browser-based file tools',
    'no upload file tools',
    'free file processing',
  ],
  openGraph: {
    title: 'Free File Tools - Browser-Based File Processing | lst97',
    description:
      'Free online file tools for file type detection and other file operations. Your files never leave your device.',
    images: [
      {
        url: '/og/file-tools.png',
        width: 1200,
        height: 630,
        alt: 'lst97 File Tools',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free File Tools - Browser-Based File Processing',
    description:
      'Free online file tools for file type detection and other file operations. Your files never leave your device.',
    images: ['/og/file-tools.png'],
  },
  alternates: {
    canonical: '/tools/file',
  },
}

export default function Page() {
  return <FileTools />
}
