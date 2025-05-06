import { useCallback } from 'react'
import { Post } from '@/frontend/models/Post'
import { CMS_API_PATHS } from '@/frontend/constants/api-paths'
import { useQuery } from '@tanstack/react-query'

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000

interface UsePostsReturn {
  posts: Post[]
  post: Post | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

interface UsePostsOptions {
  id?: string
  slug?: string
}

export const usePosts = (options?: UsePostsOptions | string): UsePostsReturn => {
  // Handle string parameter for backward compatibility
  const opts = typeof options === 'string' ? { id: options } : options || {}

  const { id, slug } = opts

  // Fetch posts from API
  const fetchPosts = useCallback(async (): Promise<Post | Post[]> => {
    try {
      let endpoint = CMS_API_PATHS.POSTS.GET_ALL

      // Determine endpoint based on provided parameters
      if (slug) {
        endpoint = CMS_API_PATHS.POSTS.GET_BY_SLUG(slug)
      } else if (id) {
        endpoint = CMS_API_PATHS.POSTS.GET_BY_ID(id)
      }

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()

      // All custom API endpoints return data in a data property
      const data = responseData.data

      if (!data) {
        console.error('Unexpected response structure:', responseData)
        throw new Error('Unexpected API response structure')
      }

      // Process the posts
      if (Array.isArray(data) && data.length > 0) {
        return data.map((post: Post) => ({
          ...post,
          // For list view, content is empty and readtime is already calculated
          // If readtime doesn't exist, use a default value
          readtime: post.readtime || 5,
          slug: post.slug || '',
        }))
      } else if (data) {
        // Single post - ensure readtime is calculated if missing
        return {
          ...data,
          readtime:
            data.readtime ||
            (data.content && data.content.length > 0 ? calculateReadTime(data.content) : 5),
          slug: data.slug || '',
        }
      }

      return []
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  }, [id, slug])

  // Use React Query for data fetching and caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', id, slug],
    queryFn: fetchPosts,
    staleTime: CACHE_EXPIRATION, // Use cache expiration as stale time
  })

  const isSinglePostRequest = id !== undefined || slug !== undefined

  // Return the processed data in the expected format
  return {
    posts: isSinglePostRequest ? [] : Array.isArray(data) ? data : [],
    post: isSinglePostRequest ? (Array.isArray(data) ? null : data) || null : null,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

// Helper function to calculate read time from rich text content
// Assumes 200 words per minute reading speed
function calculateReadTime(content: any[]): number {
  if (!content || !Array.isArray(content)) return 1

  let wordCount = 0

  // Process rich text to count words
  content.forEach((node) => {
    if (node.children) {
      node.children.forEach((child: any) => {
        if (typeof child.text === 'string') {
          wordCount += child.text.split(/\s+/).filter(Boolean).length || 0
        }
      })
    }
  })

  // Calculate read time - minimum 1 minute
  return Math.max(1, Math.ceil(wordCount / 200))
}
