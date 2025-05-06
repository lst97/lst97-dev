// Constants for animation and scroll behavior
const SCROLL_ANIMATION_DURATION = 1000
const NAVBAR_HIDE_DELAY = 150
const IN_VIEW_VERTICAL_MARGIN = '-30% 0px -30% 0px' // Increased from -45% for earlier animation trigger
const SCROLL_POSITION_THRESHOLD = 100
const PROGRESS_BAR_STIFFNESS = 50
const PROGRESS_BAR_DAMPING = 20
const PROGRESS_BAR_REST_DELTA = 0.001

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, useScroll, useSpring, useInView, useReducedMotion } from 'framer-motion'
import { useScroll as useScrollContext } from '@/frontend/contexts/ScrollContext'
import { SectionConfig, AnimatedSectionsProps } from './types'
import {
  Timeline,
  CV,
  SectionNav,
  CodingActivity,
  TechnicalSkills,
  OtherExperience,
  ValuesAndPassions,
  Recognition,
  Connect,
} from '@/frontend/components/about'

import PersonalAttributes from '@/frontend/components/about/skill/PersonalAttributes'

import { FlipCardAnimation } from '@/frontend/components/animation/FlipCardAnimation'

/**
 * Wrapper component for each scrollable section
 * Handles animation entry/exit and accessibility attributes
 */
const AnimatedScrollSectionWrapper: React.FC<{
  section: SectionConfig
  isActive: boolean
  sectionProps: Record<string, unknown>
  onNavigateSection?: (direction: 1 | -1) => void
  isMainScrolling: boolean
  handleTimelineAutoScroll?: (isScrolling: boolean) => void
}> = ({
  section,
  isActive,
  sectionProps,
  onNavigateSection,
  isMainScrolling,
  handleTimelineAutoScroll,
}) => {
  const sectionRef = useRef(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(sectionRef, {
    margin: IN_VIEW_VERTICAL_MARGIN,
    once: false,
  })

  useEffect(() => {
    if (isInView && !hasAnimated) setHasAnimated(true)
  }, [isInView, hasAnimated])

  // Create modified props based on section type
  let modifiedProps: Record<string, unknown> = { ...sectionProps, inView: isInView }

  // Special case for Timeline component
  if (section.id === 'timeline' && handleTimelineAutoScroll) {
    modifiedProps = {
      ...modifiedProps,
      onAutoScroll: handleTimelineAutoScroll,
    }
  }

  // Special case for CV component
  if (section.id === 'cv') {
    modifiedProps = {
      ...modifiedProps,
      onHandleNextSection: () => onNavigateSection?.(1),
      onHandlePreviousSection: () => onNavigateSection?.(-1),
      isMainScrolling,
    }
  }

  // Respect user's prefers-reduced-motion setting
  const initialAnimation = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }

  const activeAnimation = prefersReducedMotion
    ? { opacity: isInView || hasAnimated ? 1 : 0 }
    : {
        opacity: isInView || hasAnimated ? 1 : 0,
        y: isInView || hasAnimated ? 0 : 20,
      }

  return (
    <motion.div
      ref={sectionRef}
      initial={initialAnimation}
      animate={activeAnimation}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: 'easeOut' }}
      className={`min-h-screen w-full flex flex-col justify-center items-center snap-start snap-always relative ${
        isActive ? 'z-10' : 'z-0'
      }`}
      aria-hidden={!isActive}
    >
      <div className="w-full max-w-7xl mx-auto">
        <section.Component {...modifiedProps} />
      </div>
    </motion.div>
  )
}

const AnimatedScrollSections: React.FC<AnimatedSectionsProps> = ({
  wakaTimeStats,
  timelineEvents,
  cvData,
  softSkills,
}) => {
  const { setIsNavbarVisible } = useScrollContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [isMainScrolling, setIsMainScrolling] = useState(false)
  const [isTimelineAutoScrolling, setIsTimelineAutoScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const isProgrammaticScrolling = useRef(false)
  const prefersReducedMotion = useReducedMotion()
  // State for ARIA progress value with more consistent updates
  const [progressValue, setProgressValue] = useState(0)

  // Progress bar implementation
  const { scrollYProgress } = useScroll({
    container: containerRef,
  })
  const progressBarScaleX = useSpring(scrollYProgress, {
    stiffness: PROGRESS_BAR_STIFFNESS,
    damping: PROGRESS_BAR_DAMPING,
    restDelta: PROGRESS_BAR_REST_DELTA,
  })

  // Update progress value state for ARIA properties
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      // Round to nearest percent for screen readers
      setProgressValue(Math.round(value * 100))
    })
    return unsubscribe
  }, [scrollYProgress])

  const sections: SectionConfig[] = useMemo(
    () => [
      {
        id: 'timeline',
        label: 'Timeline',
        Component: Timeline,
        props: {
          events: timelineEvents,
          disableAutoScroll: activeSection !== 0 || isMainScrolling, // Also disable during main scrolling
        },
      },
      { id: 'cv', label: 'CV', Component: CV, props: { data: cvData } },
      {
        id: 'technical-skills',
        label: 'Tech Skills',
        Component: TechnicalSkills,
        props: {
          languages: wakaTimeStats?.languages,
          editors: wakaTimeStats?.editors,
          operatingSystems: wakaTimeStats?.operatingSystems,
          isLoading:
            !wakaTimeStats?.languages ||
            !wakaTimeStats?.editors ||
            !wakaTimeStats?.operatingSystems,
        },
      },
      {
        id: 'coding-activity',
        label: 'Coding',
        Component: FlipCardAnimation(CodingActivity),
        props: {
          activity: wakaTimeStats?.activity,
          width: '100%',
          height: '850px', // Slightly taller to accommodate the flip animation
          isLoading: !wakaTimeStats?.activity,
          error: wakaTimeStats?.activity ? undefined : 'Failed to load activity data',
        },
      },
      {
        id: 'other-experience',
        label: 'Exp.',
        Component: OtherExperience,
        props: {},
      },
      {
        id: 'personal-attributes',
        label: 'Attr.',
        Component: PersonalAttributes,
        props: { softSkills },
      },
      { id: 'values', label: 'Values', Component: ValuesAndPassions },
      { id: 'recognition', label: 'Recogn.', Component: Recognition },
      { id: 'connect', label: 'Connect', Component: Connect },
    ],
    [cvData, softSkills, wakaTimeStats, timelineEvents, activeSection, isMainScrolling],
  )

  // Handle the timeline auto-scrolling
  const handleTimelineAutoScroll = useCallback(
    (isScrolling: boolean) => {
      // Only update if we're on the timeline section
      if (activeSection === 0) {
        setIsTimelineAutoScrolling(isScrolling)
      } else {
        // Force to false if not on timeline section
        setIsTimelineAutoScrolling(false)
      }
    },
    [activeSection],
  )

  // Define scrollToSection first
  const scrollToSection = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container || isProgrammaticScrolling.current) return

      // If moving away from timeline section, ensure timeline auto-scroll is stopped
      if (activeSection === 0 && index !== 0) {
        setIsTimelineAutoScrolling(false)
      }

      isProgrammaticScrolling.current = true
      setIsMainScrolling(true)
      setIsAnimating(true)
      setActiveSection(index)

      const sectionElements = container.querySelectorAll('.snap-start')
      const targetSection = sectionElements[index] as HTMLElement

      if (targetSection) {
        const scrollPosition = targetSection.offsetTop

        container.scrollTo({
          top: scrollPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        })
      }

      // Reset flags after animation
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Use shorter duration for reduced motion
      const animationDuration = prefersReducedMotion ? 300 : SCROLL_ANIMATION_DURATION

      scrollTimeoutRef.current = setTimeout(() => {
        setIsMainScrolling(false)
        setIsAnimating(false)
        isProgrammaticScrolling.current = false
      }, animationDuration)
    },
    [prefersReducedMotion],
  )

  // Then define handleSectionNavigation
  const handleSectionNavigation = useCallback(
    (direction: 1 | -1) => {
      const newSection = activeSection + direction
      if (newSection >= 0 && newSection < sections.length) {
        scrollToSection(newSection)
      }
    },
    [activeSection, sections.length, scrollToSection],
  )

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || isMainScrolling || isProgrammaticScrolling.current) return

    const scrollPosition = container.scrollTop
    const sectionElements = container.querySelectorAll('.snap-start')
    const windowHeight = window.innerHeight

    // Find the current section based on scroll position
    let newSectionIndex = 0
    sectionElements.forEach((section, index) => {
      const sectionTop = (section as HTMLElement).offsetTop
      const sectionHeight = (section as HTMLElement).offsetHeight

      // Check if the section's center is in view
      if (
        scrollPosition + windowHeight / 2 >= sectionTop &&
        scrollPosition + windowHeight / 2 <= sectionTop + sectionHeight
      ) {
        newSectionIndex = index
      }
    })

    // Only update the active section if we're not auto-scrolling within the timeline
    if (!isProgrammaticScrolling.current && !isTimelineAutoScrolling) {
      setActiveSection(Math.min(Math.max(0, newSectionIndex), sections.length - 1))
    }

    // Navbar visibility logic
    const scrollDirection = scrollPosition > lastScrollY.current ? 'down' : 'up'
    lastScrollY.current = scrollPosition

    if (scrollDirection === 'up') {
      setIsNavbarVisible(true)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    } else {
      if (scrollPosition > SCROLL_POSITION_THRESHOLD) {
        scrollTimeout.current = setTimeout(() => setIsNavbarVisible(false), NAVBAR_HIDE_DELAY)
      }
    }
  }, [setIsNavbarVisible, sections.length, isMainScrolling, isTimelineAutoScrolling])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <>
      <div
        className="fixed right-8 top-1/2 -translate-y-1/2 z-[10] xl:right-8 lg:right-4 md:right-2 hidden sm:block"
        style={{ width: '80px' }}
        role="navigation"
        aria-label="Section navigation"
      >
        <SectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      </div>

      <div
        ref={containerRef}
        className={`relative h-screen w-full ${isAnimating ? 'overflow-hidden' : 'overflow-auto'} snap-y snap-mandatory no-scrollbar pt-0`}
        role="region"
        aria-label="Scrollable content"
      >
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-1 bg-[#b58900] origin-left z-[50]"
          style={{ scaleX: progressBarScaleX }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressValue}
          aria-label={`Scroll progress: ${progressValue}%`}
        />

        {sections.map((section, index) => (
          <AnimatedScrollSectionWrapper
            key={section.id}
            section={section}
            isActive={index === activeSection}
            sectionProps={section.props || {}}
            onNavigateSection={handleSectionNavigation}
            isMainScrolling={isMainScrolling}
            handleTimelineAutoScroll={
              section.id === 'timeline' ? handleTimelineAutoScroll : undefined
            }
          />
        ))}
      </div>
    </>
  )
}

export default AnimatedScrollSections
