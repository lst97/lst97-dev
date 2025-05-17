'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { fetchWakaTimeStats, WakaTimeStats } from '@/frontend/utils/wakatime'
import { cvData } from '@/frontend/constants/data/cv'
import { timelineEvents } from '@/frontend/constants/data/timeline'
import { AnimatedScrollSections } from '@/frontend/components/about'
import { WindowSizeProvider } from '@/frontend/contexts/WindowContexts'
import { LoadingSpinner, PageLoading } from '@/frontend/components/common/loading/Loading'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { motion } from 'framer-motion'
import { softSkills } from '@/frontend/constants/data/about'
import dynamic from 'next/dynamic'

// Dynamically import Dashboard component with SSR disabled
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

// Helper functions for WakaTime data caching
const CACHE_KEY = 'wakatime_stats'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

const getCachedWakaTimeStats = () => {
  if (typeof window === 'undefined') return null

  const cached = localStorage.getItem(CACHE_KEY)
  if (!cached) return null

  const { data, timestamp } = JSON.parse(cached)
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY)
    return null
  }

  return data
}

const setCachedWakaTimeStats = (data: WakaTimeStats) => {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  )
}

// Loading component for inner content
function ContentLoading() {
  return <PageLoading message="Loading content..." />
}

// Main content component separated from navigation
const AboutContent = ({ wakaTimeStats }: { wakaTimeStats: WakaTimeStats | undefined }) => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 1 }}
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
      <main className="grow w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {wakaTimeStats ? (
          <AnimatedScrollSections
            wakaTimeStats={wakaTimeStats}
            timelineEvents={timelineEvents}
            cvData={cvData}
            softSkills={softSkills}
          />
        ) : (
          <ContentLoading />
        )}
      </main>
    </>
  )
}

// Main client component
export default function AboutClient() {
  const [wakaTimeStats, setWakaTimeStats] = useState<WakaTimeStats | undefined>()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Check cache first
        const cachedStats = getCachedWakaTimeStats()
        if (cachedStats) {
          setWakaTimeStats(cachedStats)
          return
        }

        // If no cache or expired, fetch new data
        const stats = await fetchWakaTimeStats()
        setWakaTimeStats(stats)
        setCachedWakaTimeStats(stats)
      } catch (error) {
        console.error('Failed to fetch WakaTime stats:', error)
      }
    }

    fetchStats()

    // Set up periodic refresh
    const refreshInterval = setInterval(fetchStats, CACHE_DURATION)
    return () => clearInterval(refreshInterval)
  }, [])

  return (
    <WindowSizeProvider>
      <DynamicDashboard>
        <Suspense fallback={<ContentLoading />}>
          <AboutContent wakaTimeStats={wakaTimeStats} />
        </Suspense>
      </DynamicDashboard>
    </WindowSizeProvider>
  )
}
