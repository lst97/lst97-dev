'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '@/frontend/components/main/Navbar'
import { fetchWakaTimeStats } from '@/frontend/utils/wakatime'
import { cvData } from '@/frontend/constants/data/cv'
import { timelineEvents } from '@/frontend/constants/data/timeline'
import {
  LanguageData,
  EditorData,
  OperatingSystemData,
  ActivityData,
} from '@/frontend/models/Wakatime'
import { AnimatedScrollSections } from '@/frontend/components/about'
import { WindowSizeProvider } from '@/frontend/contexts/WindowContexts'
import { ScrollProvider } from '@/frontend/contexts/ScrollContext'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { motion } from 'framer-motion'
import { softSkills } from '@/frontend/constants/data/about'

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

const setCachedWakaTimeStats = (data: any) => {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  )
}

export default function About() {
  const [wakaTimeStats, setWakaTimeStats] = useState<
    | {
        languages: LanguageData
        editors: EditorData
        operatingSystems: OperatingSystemData
        activity: ActivityData
      }
    | undefined
  >()
  const [shouldUpdate, setShouldUpdate] = useState(false)

  const memoizedValue = useMemo(
    () => ({ shouldUpdate, setShouldUpdate }),
    [shouldUpdate, setShouldUpdate],
  )

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
      <ScrollProvider>
        <div className="h-screen overflow-hidden no-scrollbar flex flex-col">
          <Navbar className="w-full" />
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
              <div className="flex flex-col items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            )}
          </main>
        </div>
      </ScrollProvider>
    </WindowSizeProvider>
  )
}
