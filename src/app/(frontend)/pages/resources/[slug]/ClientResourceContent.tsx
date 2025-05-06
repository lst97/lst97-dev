'use client'

import { useState } from 'react'
import { Dashboard } from '@/frontend/components/main/Dashboard'
import { Post } from '@/frontend/models/Post'
import { ErrorState, LoadingState, PostHeader, PostContent } from './Components'
import { CacheStatus } from '@/frontend/components/utils/CacheStatus'
import { motion } from 'framer-motion'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { PlainDialog } from '@/frontend/components/ui/Dialogs'
import React from 'react'

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

interface ClientResourceContentProps {
  post: Post | null
  slug: string
}

export default function ClientResourceContent({ post, slug }: ClientResourceContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!post) {
    return (
      <Dashboard>
        <ErrorState message="Post not found" />
      </Dashboard>
    )
  }

  const cacheStatusComponent = (
    <CacheStatus queryKey={['posts', undefined, slug]} onClick={() => setIsDialogOpen(true)} />
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
}
