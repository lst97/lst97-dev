import { Metadata } from 'next'
import GuestBookClient from './GuestBookClient'

export const metadata: Metadata = {
  title: 'Guest Book - LST97',
  description:
    'Sign my digital guest book and leave a message. Share your thoughts, feedback, or just say hello!',
  keywords: ['guest book', 'messages', 'comments', 'feedback', 'digital guest book'],
  openGraph: {
    title: 'Guest Book - LST97',
    description:
      'Sign my digital guest book and leave a message. Share your thoughts, feedback, or just say hello!',
    type: 'website',
    url: '/pages/welcome/guest-book',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guest Book - LST97',
    description:
      'Sign my digital guest book and leave a message. Share your thoughts, feedback, or just say hello!',
  },
}

export default function GuestBookPage() {
  return <GuestBookClient />
}
