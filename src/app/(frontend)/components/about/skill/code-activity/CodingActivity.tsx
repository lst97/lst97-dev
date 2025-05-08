'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CodingActivityProps } from './types'
import { SECONDS_TO_HOURS, CONTAINER_CLASS } from './constants'
import ProgrammingPilotComparisonTable from './ProgrammingTable'
import GitHubStatsCard from './GitHubStatsCard'
import CalendarView from './CalendarView'
import ActivityChart from './ActivityChart'
import { ActivityData, Day } from '@/frontend/models/Wakatime'

const CodingActivity: React.FC<CodingActivityProps> = ({
  activity,
  inView = false,
  variant = 'Front',
  style,
  isLoading = false,
  error,
}) => {
  // Safely access activity data with proper null/undefined checks
  const activityData = useMemo(() => {
    if (!activity) return null
    // If activity has a data property, use it, otherwise use activity directly
    // This handles the new API response structure where data is nested
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return ((activity as any).data as ActivityData) || (activity as ActivityData)
  }, [activity])

  // Calculate total hours with useMemo to avoid recalculation on each render
  const totalHours = useMemo(() => {
    if (!activityData || !activityData.days || !Array.isArray(activityData.days)) return 0
    return Math.round(
      activityData.days.reduce((total: number, day: Day) => total + day.total, 0) /
        SECONDS_TO_HOURS,
    )
  }, [activityData])

  // Get unique years from activity data for calendar view (desktop)
  const years = useMemo(() => {
    if (!activityData || !activityData.days || !Array.isArray(activityData.days)) return []
    return Array.from(
      new Set(activityData.days.map((day: Day) => new Date(day.date).getFullYear())),
    ).sort((a: number, b: number) => b - a)
  }, [activityData])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  // Render loading state
  if (isLoading) {
    return (
      <motion.div className={CONTAINER_CLASS} style={style}>
        <div className="flex justify-center items-center h-full py-20">
          <div
            className="animate-pulse flex flex-col items-center"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="w-20 h-20 bg-[rgba(44,44,44,0.2)] rounded mb-4"></div>
            <div className="h-6 w-40 bg-[rgba(44,44,44,0.2)] rounded"></div>
            <p className="sr-only">Loading coding activity data...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Render error state
  if (error) {
    return (
      <motion.div className={CONTAINER_CLASS} style={style}>
        <div
          className="flex flex-col justify-center items-center h-full py-20"
          aria-live="assertive"
        >
          <div className="text-red-500 font-['Press_Start_2P'] text-lg mb-4">
            ⚠️ Error loading data
          </div>
          <p className="text-[#2c2c2c] font-['Press_Start_2P'] text-center max-w-md">{error}</p>
        </div>
      </motion.div>
    )
  }

  // Render empty state
  if (!activityData || !activityData.days) {
    return (
      <motion.div className={CONTAINER_CLASS} style={style}>
        <div className="flex flex-col justify-center items-center h-full py-20">
          <div className="font-['Press_Start_2P'] text-lg text-[#2c2c2c] text-center max-w-md">
            No coding activity data available
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'Back') {
    return (
      <motion.div
        className={CONTAINER_CLASS}
        style={{
          ...style,
          color: '#fff7e0',
        }}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-[#2c2c2c]">
          <h3 className="text-xl font-bold uppercase font-['Press_Start_2P'] text-[#2c2c2c]">
            What does this mean?
          </h3>
        </div>
        <div className="w-full">
          <p className="font-['Press_Start_2P'] text-[#2c2c2c] leading-relaxed mb-8 p-4 sm:p-8 bg-[rgba(44,44,44,0.05)] border-2 border-[#2c2c2c] rounded shadow-[1px_1px_0px_rgba(255,255,255,0.5)] text-xs sm:text-sm md:text-lg">
            Nelson has moved beyond solo flights and is now confidently flying with passengers.
            He&apos;s not yet an airline captain, but he has solid skills and is{' '}
            <span className="pixel-underline">ready for more complex journeys</span>. Similarly, as
            a programmer, he transitioned from a novice to someone capable of building real
            applications and contributing meaningfully to software projects.
          </p>
          <ProgrammingPilotComparisonTable totalHours={totalHours} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={CONTAINER_CLASS}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={style}
      role="region"
      aria-label="Coding activity calendar"
    >
      <motion.div
        className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-[#2c2c2c]"
        variants={itemVariants}
      >
        <h3 className="text-xl font-bold uppercase font-['Press_Start_2P'] text-[#2c2c2c]">
          Coding Activity
        </h3>
      </motion.div>
      <motion.div className="w-full" variants={itemVariants}>
        <div className="w-full">
          <motion.div
            className="font-['Press_Start_2P'] text-4xl font-bold text-[#2c2c2c] text-center mb-6 p-2"
            variants={itemVariants}
          >
            {totalHours} hours total
          </motion.div>

          {/* Mobile view - GitHub-style activity chart */}
          {inView && activityData && activityData.days && activityData.days.length > 0 && (
            <motion.div className="block md:hidden" variants={itemVariants}>
              <ActivityChart days={activityData.days} inView={inView} />

              {/* GitHub Stats Card - Pixel Art Style */}
              <div className="mb-6">
                <GitHubStatsCard />
              </div>
            </motion.div>
          )}

          {/* Desktop view - Calendar view */}
          <div className="hidden md:block">
            {years.map((year) => (
              <motion.div key={`year-${year}`} variants={itemVariants}>
                {inView && activityData && activityData.days && (
                  <CalendarView year={year} days={activityData.days} inView={inView} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CodingActivity
