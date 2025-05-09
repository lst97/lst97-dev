'use client'

import React, { Suspense } from 'react'
import { PostsList } from '@/app/(frontend)/components/common/items/Posts'
import { usePosts } from '@/frontend/hooks/usePosts'
import { LoadingSpinner } from '@/app/(frontend)/components/common/loading/Loading'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import dynamic from 'next/dynamic'

// Dynamically import the Dashboard component to prevent useSearchParams issues
const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading dashboard...</div>
      </div>
    ),
  },
)

// Create a client component that will use useSearchParams
const ResourcesContent = () => {
  const { posts, isLoading, error } = usePosts()

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh]">
        <Image
          src="/anthropology-skeleton-icon.svg"
          alt="Error"
          width={100}
          height={100}
          className="m-4"
        />
        <div className="m-4 text-[var(--color-error)] font-['Press_Start_2P'] text-sm">
          Error loading posts: {error.message}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mt-32 relative z-10 mb-32">
        <div className="mx-auto max-w-7xl">
          <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[8px_8px_0_var(--shadow)] rounded-md p-4 sm:p-6 mb-8 relative ">
            {/* Pixel noise overlay */}
            <div
              className="bg-pixel-noise absolute inset-0 pointer-events-none z-0 opacity-10"
              aria-hidden="true"
            />

            {/* Grid pattern overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-5 bg-grid-lines"
              aria-hidden="true"
            />

            <h1 className="font-['Press_Start_2P'] text-xl sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4">
              Resources
            </h1>

            <p className="text-[var(--color-text)] dark:text-[var(--color-text-light)] font-['Press_Start_2P'] mb-6">
              Just like blog posts which may be fun to know.
            </p>
          </div>

          <div className="relative z-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner />
                <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                  Loading posts...
                </div>
              </div>
            ) : posts.length > 0 ? (
              <PostsList
                posts={posts}
                showFilter={true}
                className="grid grid-cols-1 divide-y divide-[var(--color-border)] dark:divide-[var(--color-border-dark)]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[8px_8px_0_var(--shadow)] rounded-md p-4 sm:p-6 ">
                <Image
                  src="/sad-game-controller.png"
                  alt="No posts"
                  width={64}
                  height={64}
                  className="m-4 [image-rendering:pixelated]"
                />
                <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                  No posts available yet
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ResourcesClient() {
  return (
    <DynamicDashboard>
      {/* Background animation */}
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

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12 mt-32">
            <LoadingSpinner />
            <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
              Loading resources...
            </div>
          </div>
        }
      >
        <ResourcesContent />
      </Suspense>
    </DynamicDashboard>
  )
}
