'use client'
import { Dashboard } from '@/frontend/components/main/Dashboard'
import { ContentDisplay } from '@/frontend/components/common/display/ContentDisplay'
import { useState, use } from 'react'
import { PlainDialog } from '@/frontend/components/ui/Dialogs'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import styles from '@/frontend/components/common/layout/layout.module.css'
import { Post } from '@/frontend/models/Post'
import { usePosts } from '@/frontend/hooks/usePosts'
import { CacheStatus } from '@/frontend/components/utils/CacheStatus'
import { motion } from 'framer-motion'
import Image from 'next/image'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { Tags, Tag } from '@/frontend/components/ui/Tags'

// Loading state component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh]">
    <LoadingSpinner />
    <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading content...</div>
  </div>
)

// Error state component
const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh]">
    <Image
      src="/anthropology-skeleton-icon.svg"
      alt="Error"
      width={100}
      height={100}
      className="m-4"
    />
    <div className="text-[var(--color-error)] font-['Press_Start_2P'] text-sm mt-4">
      Error loading content: {message}
    </div>
  </div>
)

// Post header component
const PostHeader = ({
  post,
  cacheComponent,
}: {
  post: Post | null
  cacheComponent: React.ReactNode
}) => (
  <div className="mx-auto max-w-7xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[8px_8px_0_var(--shadow)] rounded-md mb-8 relative overflow-hidden ">
    {/* Pixel noise overlay */}
    <div
      className="bg-pixel-noise absolute inset-0 pointer-events-none z-0 opacity-10"
      aria-hidden="true"
    />

    {/* Horizontal lines overlay */}
    <div
      className="pointer-events-none absolute inset-0 z-0 opacity-10 bg-horizontal-lines"
      aria-hidden="true"
    />

    {/* Cache status indicator */}
    <div className="absolute top-2 right-2 z-10">{cacheComponent}</div>

    <div className="flex flex-col sm:flex-row gap-4 m-4 justify-between relative z-1">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h1 className="font-['Press_Start_2P'] text-xl sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)]">
            {post?.title}
          </h1>

          {post?.categories && post.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.categories.map((category, index) => (
                <Tag
                  key={`category-${index}`}
                  label={category}
                  type={
                    [
                      'normal',
                      'fire',
                      'water',
                      'electric',
                      'grass',
                      'ice',
                      'fighting',
                      'poison',
                      'ground',
                      'flying',
                      'psychic',
                      'bug',
                      'rock',
                      'ghost',
                      'dragon',
                      'dark',
                      'steel',
                      'fairy',
                    ][index % 18] || 'normal'
                  }
                />
              ))}
            </div>
          )}
        </div>

        <p className="font-['Press_Start_2P'] text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 opacity-80">
          {post?.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm font-['Press_Start_2P']">
          <span className="flex items-center gap-1">
            <span className="text-[var(--color-accent)]">📅</span>{' '}
            <span className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
              {new Date(post?.publishedDate ?? '').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-[var(--color-accent)]">⏱️</span>{' '}
            <span className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
              {post?.readtime} min read
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-[var(--color-accent)]">👁️</span>{' '}
            <span className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
              {post?.views} views
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-[var(--color-accent)]">❤️</span>{' '}
            <span className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
              {post?.likes} likes
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
)

// Post content component
const PostContent = ({ post }: { post: Post | null }) => (
  <div className="mx-auto max-w-7xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[8px_8px_0_var(--shadow)] rounded-md p-4 sm:p-6 relative  pixel-scanlines">
    {/* Grid pattern overlay */}
    <div
      className="pointer-events-none absolute inset-0 z-0 opacity-5 bg-grid-lines"
      aria-hidden="true"
    />

    <ContentDisplay attributes={[post].filter(Boolean) as Post[]} type="post" />
  </div>
)

// Cache information dialog
const CacheInfoDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <PlainDialog open={open} onClose={onClose} title='Meaning of the "cached" and "fresh"'>
    <div className="flex flex-col gap-4 font-['Press_Start_2P']">
      <p className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
        This page uses React Query for data fetching, which implements an intelligent caching
        system.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
          If the content is already in React Query's cache then it is marked as{' '}
        </span>
        <span className="inline-block pixel-borders">
          <span className="bg-[var(--color-secondary)] px-2 py-1 font-['Press_Start_2P'] text-xs text-[var(--color-text)]">
            cache
          </span>
        </span>
        <span className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
          else it's marked as
        </span>
        <span className="inline-block pixel-borders">
          <span className="bg-[var(--color-primary)] px-2 py-1 font-['Press_Start_2P'] text-xs text-[var(--color-text)]">
            fresh
          </span>
        </span>
      </div>
      <p className="text-[var(--color-text)] dark:text-[var(--color-text-light)]">
        React Query automatically manages cache invalidation based on staleTime and cacheTime
        settings. By default, data becomes stale after a few minutes and is refetched when needed.
      </p>
      <p className="text-[var(--color-text)] dark:text-[var(--color-text-light)] bg-[var(--color-hover)] dark:bg-[var(--color-hover-dark)] p-2 border-l-4 border-[var(--color-accent)]">
        To force a fresh fetch, you can refresh the page while holding Shift or Ctrl key (depends on
        your browser).
      </p>
    </div>
  </PlainDialog>
)

// Main component
function ResourceContent({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const resolvedParams = use(params)
  const { post, isLoading, error } = usePosts({ slug: resolvedParams.slug })

  try {
    if (isLoading) {
      return (
        <Dashboard>
          <LoadingState />
        </Dashboard>
      )
    }

    if (error) {
      return (
        <Dashboard>
          <ErrorState message={error.message} />
        </Dashboard>
      )
    }

    const cacheStatusComponent = (
      <CacheStatus
        queryKey={['posts', undefined, resolvedParams.slug]}
        onClick={() => setIsDialogOpen(true)}
      />
    )

    return (
      <Dashboard>
        <div className="fixed top-0 left-0 w-full h-screen z-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.5 }}
          >
            <PixelArtAnimation
              opacity={0.3}
              sizeRange={[50, 100]}
              numSquares={20}
              interactionDistance={200}
              colors={['#ffe580']}
              className="w-full h-screen"
            />
          </motion.div>
        </div>

        <div className="relative mt-32 z-10">
          <div className="mx-auto max-w-7xl">
            <PostHeader post={post} cacheComponent={cacheStatusComponent} />
            <PostContent post={post} />
          </div>

          <CacheInfoDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </div>
      </Dashboard>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return (
      <Dashboard>
        <ErrorState message="Error loading resource details." />
      </Dashboard>
    )
  }
}

export default ResourceContent
