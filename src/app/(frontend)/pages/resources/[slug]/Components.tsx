'use client'

import React from 'react'
import { Post } from '@/frontend/models/Post'
import { ContentDisplay } from '@/frontend/components/common/renderers'
import { Tag } from '@/frontend/components/ui/Tags'
import Image from 'next/image'
import { PageLoading } from '@/frontend/components/common/loading/Loading'

// Loading state component - re-export PageLoading with custom message
export const LoadingState = () => <PageLoading message="Loading content..." />

// Error state component
export const ErrorState = ({ message }: { message: string }) => (
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
export const PostHeader = ({
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
                  label={category || ''}
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
export const PostContent = ({ post }: { post: Post | null }) => (
  <div className="mx-auto max-w-7xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[8px_8px_0_var(--shadow)] rounded-md p-4 sm:p-6 relative  pixel-scanlines">
    {/* Grid pattern overlay */}
    <div
      className="pointer-events-none absolute inset-0 z-0 opacity-5 bg-grid-lines"
      aria-hidden="true"
    />

    <ContentDisplay attributes={[post].filter(Boolean) as Post[]} type="post" />
  </div>
)
