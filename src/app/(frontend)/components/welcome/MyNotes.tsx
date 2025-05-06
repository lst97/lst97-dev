'use client'

import { useEffect, useState } from 'react'
import { NoteItem, NoteList } from '@/frontend/components/common/items/Notes'
import { PkmTitle } from '@/frontend/components/common/Titles'
import Image from 'next/image'
import { Post } from '@/frontend/models/Post'
import { usePosts } from '@/frontend/hooks/usePosts'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'

export const MyNotes = () => {
  const { posts, isLoading, error } = usePosts()
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([])

  useEffect(() => {
    if (posts && posts.length > 0) {
      // Filter for featured posts and limit to 3
      const featured = posts
        .filter((post) => post.featuredPost === true)
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, 3)

      setFeaturedPosts(featured)
    }
  }, [posts])

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
          Featured Notes
        </PkmTitle>
      </div>
      <div className="px-16">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-[var(--color-error)] font-['Press_Start_2P'] text-sm">
            Error loading notes
          </div>
        ) : featuredPosts.length > 0 ? (
          <NoteList>
            {featuredPosts.map((post) => (
              <NoteItem
                key={post.documentId}
                title={post.title}
                date={new Date(post.publishedDate).toISOString()}
                href={`/pages/resources/${post.slug}`}
                description={post.description}
                icon={post.featuredImage || '/document-pixel-art.png'}
                stats={{
                  readingTime: post.readtime,
                  views: post.views,
                  likes: post.likes,
                }}
                categories={post.categories.map((category) => ({
                  name: category,
                  type: 'normal',
                }))}
              />
            ))}
          </NoteList>
        ) : (
          <div className="text-center py-4 text-[var(--color-text)] dark:text-[var(--color-text-light)] font-['Press_Start_2P'] text-sm">
            No featured notes available
          </div>
        )}
      </div>
    </div>
  )
}
