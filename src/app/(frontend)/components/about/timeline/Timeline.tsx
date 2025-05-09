'use client'

import { useState, useMemo, useEffect, FC, useRef } from 'react'
import {
  TimelineProps,
  TimelineEvent,
  isValidDate,
  AUTO_SCROLL_INTERVAL,
  getDaysInYear,
} from './types'
import { VerticalTimeline } from './VerticalTimeline'
import { HorizontalTimeline } from './HorizontalTimeline'

// Import CSS
import './style.css'

export type { TimelineEvent } from './types'

export const Timeline: FC<TimelineProps> = ({
  events,
  startYear,
  endYear,
  onEventClick,
  backgroundImagePath = '/pixel-art-calender.png',
  useVerticalLayoutOnMobile = true,
  disableAutoScroll = false,
  onAutoScroll,
}) => {
  // Filter out events with invalid dates
  const validEvents = useMemo(() => events.filter((event) => isValidDate(event.date)), [events])

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isVerticalLayout, setIsVerticalLayout] = useState(false)
  const selectedEventRef = useRef<HTMLDivElement>(null)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const eventRefs = useRef<Map<string | number, HTMLDivElement>>(new Map())

  // Update auto-scrolling when disableAutoScroll changes
  useEffect(() => {
    if (disableAutoScroll) {
      setIsAutoScrolling(false)
    } else {
      // Only enable auto-scrolling if not disabled
      setIsAutoScrolling(!disableAutoScroll)
    }
  }, [disableAutoScroll])

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Check screen size for responsive layout
  useEffect(() => {
    if (!useVerticalLayoutOnMobile) return

    const checkScreenSize = () => {
      setIsVerticalLayout(window.innerWidth < 640)
    }

    // Initial check
    checkScreenSize()

    // Add listener for resize
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [useVerticalLayoutOnMobile])

  // Calculate year range
  const { yearRange, currentYearProgress } = useMemo(() => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const defaultStartYear = currentYear - 4
    const start = startYear || defaultStartYear
    const end = endYear || currentYear

    // Calculate current year progress (0-100) using correct days for current year
    const startOfYear = new Date(currentYear, 0, 1)
    const daysInCurrentYear = getDaysInYear(currentYear)
    const progress =
      ((currentDate.getTime() - startOfYear.getTime()) /
        (1000 * 60 * 60 * 24 * daysInCurrentYear)) *
      100

    // Generate array of years
    const years = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return {
      yearRange: years,
      currentYearProgress: progress,
    }
  }, [startYear, endYear])

  // Group events by year
  const eventsByYear = useMemo(() => {
    const grouped = new Map<number, TimelineEvent[]>()

    yearRange.forEach((year) => {
      grouped.set(year, [])
    })

    validEvents.forEach((event) => {
      // We know this is a valid date because of validEvents filter
      const year = new Date(event.date).getFullYear()
      if (grouped.has(year)) {
        grouped.get(year)?.push(event)
      }
    })

    // Sort events within each year by date
    grouped.forEach((yearEvents) => {
      yearEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    return grouped
  }, [validEvents, yearRange])

  // Clean up eventRefs when events change
  useEffect(() => {
    const currentEventIds = new Set(validEvents.map((e) => e.id))
    const storedEventIds = Array.from(eventRefs.current.keys())

    // Remove refs to events that no longer exist
    storedEventIds.forEach((id) => {
      if (!currentEventIds.has(id)) {
        eventRefs.current.delete(id)
      }
    })
  }, [validEvents])

  // Function to animate the detail container
  const animateDetailContainer = () => {
    if (selectedEventRef.current) {
      // Add animation class
      selectedEventRef.current.classList.add('terminal-update')

      // Remove class after animation completes to allow it to be triggered again
      setTimeout(() => {
        if (selectedEventRef.current) {
          selectedEventRef.current.classList.remove('terminal-update')
        }
      }, 1000)
    }
  }

  const handleEventSelect = (event: TimelineEvent) => {
    // Only animate if selecting a different event
    const shouldAnimate = selectedEvent?.id !== event.id

    setSelectedEvent(event)
    setIsAutoScrolling(false) // Stop auto-scrolling when user selects an event
    onEventClick?.(event)

    // Use requestAnimationFrame for more reliable DOM updates
    requestAnimationFrame(() => {
      if (selectedEventRef.current) {
        selectedEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

        // Add animation if selecting a new event
        if (shouldAnimate) {
          animateDetailContainer()
        }
      }
    })
  }

  // Toggle auto-scrolling
  const toggleAutoScroll = () => {
    setIsAutoScrolling((prev) => !prev)
  }

  // Scroll event into view
  const scrollEventIntoView = (eventId: string | number) => {
    requestAnimationFrame(() => {
      const eventElement = eventRefs.current.get(eventId)
      if (eventElement) {
        eventElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || validEvents.length === 0 || disableAutoScroll) return

    const interval = setInterval(() => {
      // Check if we should auto-scroll
      if (disableAutoScroll) {
        // If disabled during interval execution, clear it and return
        clearInterval(interval)
        setIsAutoScrolling(false)
        return
      }

      // Using a callback function inside setCurrentEventIndex to avoid state updates during render
      const nextIndex = (currentEventIndex + 1) % validEvents.length
      const nextEvent = validEvents[nextIndex]

      setCurrentEventIndex(nextIndex)
      setSelectedEvent(nextEvent)

      // Notify parent component about auto-scrolling
      if (onAutoScroll) {
        onAutoScroll(true)
      }

      // Only scroll if auto-scrolling is not disabled
      if (!disableAutoScroll) {
        // Use requestAnimationFrame for more reliable DOM updates
        scrollEventIntoView(nextEvent.id)

        // Animate the detail container during auto-scrolling
        setTimeout(() => {
          animateDetailContainer()
        }, 300) // Small delay to let the scrolling start
      }
    }, AUTO_SCROLL_INTERVAL)

    return () => clearInterval(interval)
  }, [isAutoScrolling, validEvents, onAutoScroll, currentEventIndex, disableAutoScroll])

  // Start auto-scrolling only when component mounts and auto-scroll is not disabled
  useEffect(() => {
    if (validEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(validEvents[0])
    }
  }, [validEvents, selectedEvent])

  // Shared props for both timeline views
  const timelineProps = {
    yearRange,
    eventsByYear,
    currentYearProgress,
    selectedEvent,
    selectedEventRef: selectedEventRef as React.RefObject<HTMLDivElement>,
    eventRefs,
    isAutoScrolling,
    prefersReducedMotion,
    backgroundImagePath,
    toggleAutoScroll,
    handleEventSelect,
    timelineContainerRef: timelineContainerRef as React.RefObject<HTMLDivElement>,
  }

  return isVerticalLayout ? (
    <VerticalTimeline {...timelineProps} />
  ) : (
    <HorizontalTimeline {...timelineProps} />
  )
}
