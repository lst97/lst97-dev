import { NoteItem, NoteList } from '@/frontend/components/common/items/Notes'
import type { NoteCategory } from '@/frontend/components/common/items/Notes'
import { PkmTitle } from '@/frontend/components/common/Titles'
import Image from 'next/image'

export const MyNotes = () => {
  // Demo notes array for mapping
  const demoNotes: Array<{
    title: string
    date: string
    href: string
    description: string
    icon: string
    stats: { readingTime: number; views: number; likes: number }
    categories: NoteCategory[]
  }> = [
    {
      title: 'Implementing Pokemon-style UI',
      date: '2024-03-15',
      href: '/notes/pokemon-ui',
      description:
        'A deep dive into creating retro game-inspired user interfaces using React and CSS. Learn how to implement pixel-perfect designs with modern web technologies.',
      icon: '/code-pixel-art.png',
      stats: { readingTime: 8, views: 128, likes: 32 },
      categories: [
        { name: 'UI/UX', type: 'psychic' as const },
        { name: 'React', type: 'electric' as const },
        { name: 'CSS', type: 'water' as const },
      ],
    },
    {
      title: 'Building a Personal Website',
      date: '2024-03-10',
      href: '/notes/website',
      description:
        'Step-by-step guide on building a modern personal website using Next.js and TypeScript. Includes tips on performance optimization and SEO.',
      icon: '/web-pixel-art.png',
      stats: { readingTime: 12, views: 256, likes: 64 },
      categories: [
        { name: 'Next.js', type: 'dark' as const },
        { name: 'TypeScript', type: 'steel' as const },
      ],
    },
    {
      title: 'Learning Next.js and React',
      date: '2024-03-05',
      href: '/notes/nextjs',
      description:
        'Getting started with Next.js and React development. Essential concepts, best practices, and common pitfalls to avoid.',
      icon: '/book-pixel-art.png',
      stats: { readingTime: 15, views: 512, likes: 128 },
      categories: [
        { name: 'Tutorial', type: 'normal' as const },
        { name: 'React', type: 'electric' as const },
      ],
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-center mb-6 mt-8">
        <PkmTitle className="p-4 w-2/4">
          <Image
            className="inline-block h-7 w-7"
            alt="👀"
            src="data:image/png;base64,R0lGODlhDgAPAKIEAMzMmWZmZv///wAAAP///wAAAAAAAAAAACH5BAEAAAQALAAAAAAOAA8AAAMwSLrc/hCO0SYbQlCFNc8Z1YUE1okaOaWi6U1rG5fBELz1vQWAp/A+zmZhiRiPSEUCADs="
            width={28}
            height={28}
            style={{ width: '28px', height: '28px' }}
          />{' '}
          Latest Notes
        </PkmTitle>
      </div>
      <div className="px-16">
        <NoteList>
          {demoNotes.map((note) => (
            <NoteItem
              key={note.title} // Use note.id if available in real data
              {...note}
            />
          ))}
        </NoteList>
      </div>
    </div>
  )
}
