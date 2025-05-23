'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { routes } from '@/frontend/constants/routes'
import ArrowDownIcon from '@heroicons/react/16/solid/ArrowDownIcon'
import WrenchIcon from '@heroicons/react/24/outline/WrenchIcon'
import CpuChipIcon from '@heroicons/react/24/outline/CpuChipIcon'
import CodeBracketIcon from '@heroicons/react/24/outline/CodeBracketIcon'
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon'
import PauseIcon from '@heroicons/react/24/outline/PauseIcon'
import PlayIcon from '@heroicons/react/24/outline/PlayIcon'
import { FeaturesSectionProps, SiteFeature } from '../types'
import { FeatureCard, ExpandedFeatureCard } from './index'

// Feature cards data
const siteFeatures = [
  {
    id: 'tools',
    title: 'Tools',
    description:
      'Interactive tools for file type detection, image background removal, and format conversion',
    details:
      'Analyze files, remove image backgrounds, convert between formats – all running locally in your browser with AI-powered tools.',
    icon: <WrenchIcon className="w-8 h-8" />,
    link: routes.tools,
    color: 'from-yellow-300 to-amber-500',
    youtubeId: 'k0sZzHBF7u4',
  },
  {
    id: 'services',
    title: 'Services',
    description: 'Professional web development and software engineering services',
    details:
      'Full-stack software development, cloud infrastructure, and consulting services with pixel-perfect attention to detail.',
    icon: <CpuChipIcon className="w-8 h-8" />,
    link: routes.services,
    color: 'from-blue-300 to-indigo-500',
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Showcase of personal and client projects with detailed case studies',
    details:
      'Browse through my portfolio of completed projects spanning web applications, mobile apps, and specialized tools.',
    icon: <CodeBracketIcon className="w-8 h-8" />,
    link: routes.projects,
    color: 'from-green-300 to-emerald-500',
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Articles, tutorials, and resources for developers',
    details:
      'Dive into technical articles, guides, and code snippets covering modern web development best practices.',
    icon: <DocumentTextIcon className="w-8 h-8" />,
    link: routes.resources,
    color: 'from-purple-300 to-fuchsia-500',
  },
]

// Duration in ms for auto rotation
const AUTO_ROTATE_INTERVAL = 8000

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  sectionRef,
  isInView,
  onScrollToNext,
  isMobileView,
}) => {
  const [activeFeature, setActiveFeature] = useState<SiteFeature | null>(null)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleCardClick = (feature: SiteFeature) => {
    // If clicking the already active feature, deactivate it
    if (activeFeature && activeFeature.id === feature.id) {
      setActiveFeature(null)
      return
    }

    // Stop auto-rotation when manually selecting a card
    setIsAutoRotating(false)
    setActiveFeature(feature)
  }

  const toggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev)
    if (!isAutoRotating && !activeFeature) {
      // If turning on auto-rotate and no card is active, activate the first one
      setActiveFeature(siteFeatures[0])
    }
  }

  // Auto-rotate feature cards when in view
  useEffect(() => {
    if (!isInView || !isAutoRotating) {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current)
        autoRotateTimerRef.current = null
      }
      return
    }

    // Start the auto-rotation
    autoRotateTimerRef.current = setInterval(() => {
      setActiveFeature((current) => {
        if (!current) {
          // If no card is active, activate the first one
          return siteFeatures[0]
        } else {
          // Find the index of the current active feature
          const currentIndex = siteFeatures.findIndex((feature) => feature.id === current.id)
          // Move to the next feature, or back to the first if at the end
          const nextIndex = (currentIndex + 1) % siteFeatures.length
          return siteFeatures[nextIndex]
        }
      })
    }, AUTO_ROTATE_INTERVAL)

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current)
        autoRotateTimerRef.current = null
      }
    }
  }, [isInView, isAutoRotating])

  // Start with the first feature when the section comes into view
  useEffect(() => {
    if (isInView && !activeFeature && isAutoRotating) {
      // Small delay before showing the first feature
      const timer = setTimeout(() => {
        setActiveFeature(siteFeatures[0])
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isInView, activeFeature, isAutoRotating])

  // Filter out active feature to display only the remaining 3 cards
  const displayedFeatures = activeFeature
    ? siteFeatures.filter((feature) => feature.id !== activeFeature.id)
    : siteFeatures

  // YouTube player options for background
  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      showinfo: 0, // showinfo is deprecated but keep as 0 for legacy
      modestbranding: 1,
      loop: 1,
      mute: 1,
      playlist: 'k0sZzHBF7u4', // Needed for looping
      rel: 0,
      fs: 0,
      disablekb: 1,
      iv_load_policy: 3,
      playsinline: 1,
    } as const,
  }

  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen w-full py-12 sm:py-20 bg-[var(--color-background)] relative z-10 section-snap-align"
      style={{
        height: isMobileView ? 'auto' : '100vh',
        width: '100%',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView || isMobileView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="font-pixel text-2xl sm:text-3xl md:text-4xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-3 sm:mb-4"
            style={{ textShadow: '3px 3px 0px var(--shadow)' }}
          >
            SITE FEATURES
          </h2>
          <p className="font-pixel text-xs sm:text-sm md:text-base text-[var(--color-text)] dark:text-[var(--color-text-light)] opacity-90 max-w-3xl mx-auto">
            Explore interactive tools, professional services, showcased projects, and developer
            resources
          </p>
        </motion.div>

        {/* Auto-rotate toggle button */}
        <motion.button
          onClick={toggleAutoRotate}
          className="absolute top-0 right-4 sm:right-6 font-pixel text-xs sm:text-sm inline-flex items-center bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] p-2 rounded-b-md border-2 border-t-0 border-[var(--color-border)] dark:border-[var(--color-border-dark)] text-[var(--color-text)] dark:text-[var(--color-text-light)] z-10"
          whileHover={{ y: 2 }}
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          {isAutoRotating ? (
            <>
              <PauseIcon className="w-4 h-4 mr-1" /> Pause
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4 mr-1" /> Auto
            </>
          )}
        </motion.button>

        {/* Feature Cards Section */}
        <div className="space-y-8">
          {/* Grid of small feature cards - only 3 cards max */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 justify-center">
            {displayedFeatures.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} onClick={handleCardClick} />
            ))}
          </div>

          {/* Expanded feature card with 16:9 aspect ratio */}
          <AnimatePresence mode="wait">
            {activeFeature && (
              <ExpandedFeatureCard activeFeature={activeFeature} youtubeOpts={youtubeOpts} />
            )}
          </AnimatePresence>
        </div>

        {!isMobileView && (
          <motion.button
            onClick={onScrollToNext}
            className="font-pixel text-[var(--color-text)] dark:text-[var(--color-text-light)] flex flex-col items-center mx-auto animate-bounce mt-8"
            whileHover={{ scale: 1.1 }}
          >
            <span className="mb-1 sm:mb-2 text-sm sm:text-base">View Tech Stack</span>
            <ArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </div>
    </motion.section>
  )
}
