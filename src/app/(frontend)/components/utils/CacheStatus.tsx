'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

type CacheStatusProps = {
  queryKey: unknown[]
  onClick?: () => void
}

export const CacheStatus = ({ queryKey, onClick }: CacheStatusProps) => {
  const queryClient = useQueryClient()
  const [isCached, setIsCached] = useState<boolean | null>(null)
  const [freshFetch, setFreshFetch] = useState(false)

  useEffect(() => {
    // Check if data exists in cache for this query key
    const cachedData = queryClient.getQueryData(queryKey)
    const initialCacheState = cachedData !== undefined
    setIsCached(initialCacheState)

    // If initially not in cache, show a notification
    if (!initialCacheState) {
      setFreshFetch(true)
      // Auto-hide the notification after 3 seconds
      const timer = setTimeout(() => {
        setFreshFetch(false)
      }, 3000)
      return () => clearTimeout(timer)
    }

    // Set up a listener for query cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const updatedCache = queryClient.getQueryData(queryKey)
      setIsCached(updatedCache !== undefined)
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient, queryKey])

  // Early return if cache status is unknown
  if (isCached === null) return null

  return (
    <div className="z-10">
      <div
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={onClick}
        title="Click for more information about caching"
      >
        <div className="pixel-borders inline-block bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] shadow-[4px_4px_0_var(--shadow)]">
          <div
            className={`px-2 py-1 ${isCached ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-primary)]'}`}
          >
            <span className="font-['Press_Start_2P'] text-xs text-[var(--color-text)] dark:text-[var(--color-text-light)]">
              {isCached ? 'cache' : 'fresh'}
            </span>
          </div>
        </div>
      </div>

      {freshFetch && (
        <div className="absolute top-full right-0 mt-2 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-2 rounded-md shadow-[4px_4px_0_var(--shadow)] whitespace-nowrap z-10 font-['Press_Start_2P'] text-xs text-[var(--color-text)] dark:text-[var(--color-text-light)] pixel-borders">
          <div className="bg-pixel-noise absolute inset-0 opacity-10"></div>
          Fresh data fetched!
        </div>
      )}
    </div>
  )
}
