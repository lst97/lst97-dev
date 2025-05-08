'use client'

import React, { useState, useMemo } from 'react'
import { Post, PostSortField } from '@/frontend/models/Post'
import { NoteItem, NoteList } from './Notes'
import { routes } from '@/frontend/constants/routes'
import { FilterControls, SortOption, FilterOption } from '@/frontend/components/ui/FilterControls'

interface PostsListProps {
  posts: Post[]
  className?: string
  showFilter?: boolean
}

// Define default sort options
const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', value: 'publishedDate_desc', direction: 'desc' },
  { label: 'Oldest First', value: 'publishedDate_asc', direction: 'asc' },
  { label: 'Most Views', value: 'views_desc', direction: 'desc' },
  { label: 'Most Likes', value: 'likes_desc', direction: 'desc' },
  { label: 'A-Z', value: 'title_asc', direction: 'asc' },
  { label: 'Z-A', value: 'title_desc', direction: 'desc' },
  { label: 'Longest Read', value: 'readtime_desc', direction: 'desc' },
  { label: 'Shortest Read', value: 'readtime_asc', direction: 'asc' },
]

// Status options
const POST_STATUS_OPTIONS: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

// Featured options
const FEATURED_OPTIONS: FilterOption[] = [
  { label: 'All Posts', value: 'all' },
  { label: 'Featured Only', value: 'featured' },
  { label: 'Non-Featured', value: 'non-featured' },
]

export const PostsList: React.FC<PostsListProps> = ({ posts, className, showFilter = true }) => {
  const [activeSort, setActiveSort] = useState<SortOption>(DEFAULT_SORT_OPTIONS[0])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [activeStatus, setActiveStatus] = useState<string[]>(['all'])
  const [activeFeatured, setActiveFeatured] = useState<string[]>(['all'])

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    posts.forEach((post) => {
      post.categories?.forEach((category) => categorySet.add(category || ''))
    })
    return Array.from(categorySet).map((category) => ({
      label: category,
      value: category,
    }))
  }, [posts])

  // Apply filters and sorting
  const filteredPosts = useMemo(() => {
    // First apply filters
    let result = posts

    // Filter by categories if any selected
    if (activeCategories.length > 0) {
      result = result.filter((post) =>
        post.categories.some((category) => activeCategories.includes(category || '')),
      )
    }

    // Filter by post status
    if (activeStatus.length > 0 && activeStatus[0] !== 'all') {
      result = result.filter((post) => post.postStatus === activeStatus[0])
    }

    // Filter by featured status
    if (activeFeatured.length > 0) {
      if (activeFeatured[0] === 'featured') {
        result = result.filter((post) => post.featuredPost === true)
      } else if (activeFeatured[0] === 'non-featured') {
        result = result.filter((post) => post.featuredPost === false)
      }
    }

    // Then apply sorting
    const { value, direction } = activeSort

    // Extract the actual field name from the value (removing the _asc/_desc suffix)
    const fieldName = value.split('_')[0] as PostSortField

    return result.sort((a, b) => {
      const fieldA = a[fieldName]
      const fieldB = b[fieldName]

      // Handle string fields (title)
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return direction === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      // Handle date fields (publishedDate)
      if (fieldName === 'publishedDate') {
        const dateA = new Date(a.publishedDate).getTime()
        const dateB = new Date(b.publishedDate).getTime()
        return direction === 'asc' ? dateA - dateB : dateB - dateA
      }

      // Handle numeric fields (views, likes, readtime)
      return direction === 'asc' ? Number(fieldA) - Number(fieldB) : Number(fieldB) - Number(fieldA)
    })
  }, [posts, activeSort, activeCategories, activeStatus, activeFeatured])

  // Handler for the FilterControls component
  const handleStatusChange = (values: string[]) => {
    setActiveStatus(values)
  }

  const handleFeaturedChange = (values: string[]) => {
    setActiveFeatured(values)
  }

  return (
    <div className="flex flex-col gap-4">
      {showFilter && (
        <FilterControls
          sortOptions={DEFAULT_SORT_OPTIONS}
          onSortChange={setActiveSort}
          selectedSort={activeSort.value}
          filterGroups={[
            {
              label: 'Categories',
              options: categories,
              selectedValues: activeCategories,
              onChange: setActiveCategories,
              isMultiSelect: true,
            },
            {
              label: 'Status',
              options: POST_STATUS_OPTIONS,
              selectedValues: activeStatus,
              onChange: handleStatusChange,
              isMultiSelect: false,
            },
            {
              label: 'Featured',
              options: FEATURED_OPTIONS,
              selectedValues: activeFeatured,
              onChange: handleFeaturedChange,
              isMultiSelect: false,
            },
          ]}
          className="mb-4"
        />
      )}

      <NoteList className={className}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <NoteItem
              key={post.documentId}
              title={post.title}
              date={new Date(post.publishedDate).toISOString()}
              href={`${routes.resources}/${post.slug}`}
              description={post.description}
              icon={post.featuredImage || undefined}
              categories={post.categories.map((category) => ({
                name: category || '',
                type: 'normal',
              }))}
              stats={{
                readingTime: post.readtime,
                views: post.views,
                likes: post.likes,
              }}
            />
          ))
        ) : (
          <div className="text-center py-8 text-text font-[Press_Start_2P,monospace]">
            No posts match your filters
          </div>
        )}
      </NoteList>
    </div>
  )
}
