'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

interface NextNavigationProgressBarProps {
  height?: number
  className?: string
}

export default function NextNavigationProgressBar({
  height = 6,
  className = '',
}: NextNavigationProgressBarProps) {
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Force initial progress to test visibility
  useEffect(() => {
    // Test progress - will show briefly and then disappear
    setProgress(20)
    const timer = setTimeout(() => {
      setProgress(50)
      const timer2 = setTimeout(() => {
        setProgress(100)
        const timer3 = setTimeout(() => {
          setProgress(0)
        }, 500)
        return () => clearTimeout(timer3)
      }, 500)
      return () => clearTimeout(timer2)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // When the pathname or search params change, the navigation is complete
  useEffect(() => {
    // Navigation is done, set progress to 100 and then reset
    if (!isPending && progress > 0) {
      setProgress(100)
      const timer = setTimeout(() => {
        setProgress(0)
      }, 500) // Longer delay to ensure visibility
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams, isPending, progress])

  // Track navigation pending state to control progress
  useEffect(() => {
    if (isPending) {
      // Start progress when navigation begins
      setProgress(20)
      const timer1 = setTimeout(() => isPending && setProgress(50), 300)
      const timer2 = setTimeout(() => isPending && setProgress(80), 600)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isPending])

  // Override router methods to track navigation with transitions
  useEffect(() => {
    // Store original push method
    const originalPush = router.push.bind(router)
    // Override push with our transition-wrapped version
    router.push = (href, options) => {
      startTransition(() => {
        originalPush(href, options)
      })
    }

    // Add listener for back/forward navigation
    const handlePopState = () => {
      startTransition(() => {
        // This empty transition will trigger isPending to become true
      })
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      // Restore original method and remove listeners on cleanup
      router.push = originalPush
      window.removeEventListener('popstate', handlePopState)
    }
  }, [router, startTransition])

  // Calculate blocks for pixel art style
  const progressBlocks = Math.ceil((progress / 100) * 25) // 25 blocks total

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-opacity duration-300 ${
        progress > 0 ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="relative h-full bg-black/10 w-full">
        {/* Pixel art progress blocks */}
        <div className="absolute top-0 left-0 h-full flex w-full">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="transition-all duration-150 image-pixelated flex-1"
              style={{
                height: '100%',
                backgroundColor: i < progressBlocks ? '#d3ba55' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
