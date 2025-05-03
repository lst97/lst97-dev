'use client'
import { Dashboard } from '@/frontend/components/main/Dashboard'
import { ContentDisplay } from '@/frontend/components/common/display/ContentDisplay'
import { useState, use } from 'react'
import { PlainDialog } from '@/app/(frontend)/components/ui/Dialogs'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import styles from '@/frontend/components/common/layout/layout.module.css'
import { Post } from '@/frontend/models/Post'
import { usePosts } from '@/frontend/hooks/usePosts'
import categoryStyles from '@/frontend/components/common/items/notes.module.css'

function ResourceContent({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const resolvedParams = use(params)
  const { post, isLoading, error, isCached } = usePosts(resolvedParams.slug)

  try {
    if (isLoading) {
      return (
        <Dashboard>
          <LoadingSpinner />
          <div className="p-8">
            <div className="text-center">Loading content...</div>
          </div>
        </Dashboard>
      )
    }

    if (error) {
      return (
        <Dashboard>
          <div className="p-8">
            <div className="text-red-500">Error loading content: {error.message}</div>
          </div>
        </Dashboard>
      )
    }

    return (
      <Dashboard>
        <div className="p-8 relative">
          <div
            className="absolute top-0 right-0 border-double border-4 rounded-md border-black m-2"
            onClick={() => {
              setIsDialogOpen(true)
            }}
          >
            <p className="p-1 hover:cursor-pointer bg-amber-100 hover:bg-amber-200 rounded-md">{`${
              isCached ? 'cached' : 'fresh'
            }`}</p>
          </div>
          <div className={`${styles.pixelArtBorder} mt-8 mb-8`}>
            <div className="flex flex-row gap-4 m-2 justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-4 w-full">{post?.title}</h1>

                <p className="text-gray-600 mb-2">{post?.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    📅{' '}
                    {new Date(post?.publishedDate ?? '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                    })}
                  </span>
                  <span>⏱️ {post?.readtime} min read</span>
                  <span>👁️ {post?.views} views</span>
                  <span>❤️ {post?.likes} likes</span>
                </div>
              </div>
              <div className="flex flex-col justify-center items-end">
                <div className="flex gap-2 flex-wrap justify-end">
                  <span className={`${categoryStyles.pkmNoteChip} ${categoryStyles.normal}`}>
                    {post?.categories}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <ContentDisplay attributes={[post].filter(Boolean) as Post[]} type="post" />
          <PlainDialog
            open={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false)
            }}
            title='Meaning of the "cached" and "fresh"'
          >
            <div className="flex flex-col gap-2">
              <p>
                The content is first check if it present in the cache, if not then fetched from the
                server and stored in the cache.
              </p>
              <div className="flex items-center gap-2">
                <span>If the content is present in the cache then it is </span>
                <span className="inline-block border-4 border-double border-black rounded-md">
                  <span className="bg-amber-100 px-1 rounded-md">cache</span>
                </span>
                <span>else</span>
                <span className="inline-block border-4 border-double border-black rounded-md">
                  <span className="bg-amber-100 px-1 rounded-md">fresh</span>
                </span>
                <span>.</span>
              </div>
              <p>
                The cache also have it own expiration time for 30 minutes, after which the content
                is fetched from the server.
              </p>
              <a
                href="https://mclibrary.duke.edu/about/blog/clear-cache"
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 my-2"
              >
                How to clear cache?
              </a>
            </div>
          </PlainDialog>
        </div>
      </Dashboard>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return <div>Error loading resource details.</div>
  }
}

export default ResourceContent
