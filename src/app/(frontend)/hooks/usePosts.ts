import { useState, useEffect, useCallback } from 'react'
import { Post } from '@/frontend/models/Post'
import { httpClient } from '@/frontend/api/Api'
import { CMS_API_PATHS } from '@/frontend/constants/ApiPaths'

interface UsePostsReturn {
  posts: Post[]
  post: Post | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isCached: boolean
}

interface ApiResponse {
  data: Post | Post[]
}

interface PostsCache {
  [documentId: string]: {
    data: Post
    timestamp: number
  }
}

// Cache utility functions
const CACHE_EXPIRATION = 30 * 60 * 1000 // 30 minutes
const POSTS_CACHE_KEY = 'posts_cache'

const getCache = (): PostsCache => {
  try {
    const cache = localStorage.getItem(POSTS_CACHE_KEY)
    return cache ? JSON.parse(cache) : {}
  } catch (error) {
    console.error('Error reading from cache:', error)
    return {}
  }
}

const setInCache = (posts: Post | Post[]): void => {
  try {
    const cache = getCache()
    const timestamp = Date.now()

    if (Array.isArray(posts)) {
      posts.forEach((post) => {
        cache[post.documentId] = { data: post, timestamp }
      })
    } else {
      cache[posts.documentId] = { data: posts, timestamp }
    }

    localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}

const getFromCache = (documentId?: string): { data: Post | Post[]; timestamp: number } | null => {
  try {
    const cache = getCache()

    if (documentId) {
      const entry = cache[documentId]
      return entry && isValidCache(entry.timestamp) ? entry : null
    }

    // For all posts, check if any exist and are valid
    const validEntries = Object.values(cache).filter((entry) => isValidCache(entry.timestamp))
    return validEntries.length > 0
      ? {
          data: validEntries.map((entry) => entry.data),
          timestamp: Math.min(...validEntries.map((e) => e.timestamp)),
        }
      : null
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

const isValidCache = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_EXPIRATION
}

export const usePosts = (slug?: string): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([])
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isCached, setIsCached] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to get from cache first
      const cachedEntry = getFromCache(slug)

      if (cachedEntry) {
        if (slug) {
          setPost(cachedEntry.data as Post)
          setPosts([])
        } else {
          setPosts(cachedEntry.data as Post[])
          setPost(null)
        }
        setIsCached(true)
        setIsLoading(false)
        return
      }

      setIsCached(false)

      // Fetch from API if not in cache or cache expired
      const { data } = await httpClient.cms_authenticated.get<ApiResponse>(
        slug ? CMS_API_PATHS.POSTS.GET_BY_ID(slug) : CMS_API_PATHS.POSTS.GET_ALL,
      )

      if (slug) {
        const postData = data.data as Post
        setPost(postData)
        setPosts([])
        setInCache(postData)
      } else {
        const postsData = data.data as Post[]
        setPosts(postsData)
        setPost(null)
        setInCache(postsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'))
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { posts, post, isLoading, error, refetch: fetchData, isCached }
}
