'use client'
import { Dashboard } from '@/frontend/components/main/Dashboard'
import React from 'react'
import { PostsList } from '@/frontend/components/common/items/PostsList'
import { usePosts } from '@/frontend/hooks/usePosts'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import Image from 'next/image'
const Resources = () => {
  const { posts, isLoading, error } = usePosts()

  if (error) {
    return (
      <Dashboard>
        <div className="flex flex-col justify-center items-center">
          <Image
            src="/anthropology-skeleton-icon.svg"
            alt="Error"
            width={100}
            height={100}
            className="m-4"
          />
        </div>
        <div className="m-4 ">Error loading posts: {error.message}</div>
      </Dashboard>
    )
  }

  return (
    <Dashboard>
      <div className="mt-32 m-4 flex flex-col gap-4 justify-center">
        <p className="text-xl">Just like blog posts which may be fun to know.</p>
        {isLoading ? (
          <LoadingSpinner message="Loading posts..." />
        ) : (
          <PostsList posts={posts} className="grid grid-cols-1 divide-y divide-gray-400" />
        )}
      </div>
    </Dashboard>
  )
}

export default Resources
