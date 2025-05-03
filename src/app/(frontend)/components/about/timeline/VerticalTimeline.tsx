'use client'

import React, { useRef, useEffect, useState } from 'react'
import { TimelineEvent, formatDate } from './types'
import { EventDetail } from './EventDetail'

interface VerticalTimelineProps {
  yearRange: number[]
  eventsByYear: Map<number, TimelineEvent[]>
  currentYearProgress: number
  selectedEvent: TimelineEvent | null
  selectedEventRef: React.RefObject<HTMLDivElement>
  eventRefs: React.MutableRefObject<Map<string | number, HTMLDivElement>>
  isAutoScrolling: boolean
  prefersReducedMotion: boolean
  backgroundImagePath: string
  toggleAutoScroll: () => void
  handleEventSelect: (event: TimelineEvent) => void
  timelineContainerRef: React.RefObject<HTMLDivElement>
}

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  yearRange,
  eventsByYear,
  currentYearProgress,
  selectedEvent,
  selectedEventRef,
  eventRefs,
  isAutoScrolling,
  prefersReducedMotion,
  backgroundImagePath,
  toggleAutoScroll,
  handleEventSelect,
  timelineContainerRef,
}) => {
  const timelineEndRef = useRef<HTMLDivElement>(null)
  const [isDetailSticky, setIsDetailSticky] = useState(true)

  // Observer for detecting when user reaches the end of the timeline
  useEffect(() => {
    if (!timelineEndRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        // When the end marker is visible, unstick the details
        if (entries[0].isIntersecting) {
          setIsDetailSticky(false)
        } else {
          setIsDetailSticky(true)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(timelineEndRef.current)
    return () => observer.disconnect()
  }, [])

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number = 80) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full relative mx-auto">
      {/* Main timeline scrollable area */}
      <div
        className="bg-card w-full md:w-3/5 max-w-[1000px] pt-0 px-[clamp(1rem,3vw,2rem)] pb-[clamp(1rem,3vw,2rem)] relative mx-auto timeline-vertical timeline-container overflow-auto max-h-[80vh] overflow-x-hidden"
        ref={timelineContainerRef}
      >
        {/* Background image */}
        <div
          className="fixed inset-0 bg-no-repeat bg-[256px] opacity-5 pointer-events-none z-0"
          style={{
            backgroundImage: `url('${backgroundImagePath}')`,
            backgroundPosition: 'right 10%',
          }}
          aria-hidden="true"
        ></div>

        {/* Vertical timeline line */}
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-[var(--line-thickness)] bg-[color:var(--color-border)] "></div>

          {yearRange.map((year) => {
            const yearEvents = eventsByYear.get(year) || []

            return (
              <div key={year} className="relative ">
                {/* Year label */}
                <div className=" font-['Press_Start_2P'] text-border mb-2 sticky top-0 sticky-year">
                  <div className="bg-card h-full w-full z-20">{year}</div>
                </div>

                {/* Year events */}
                <div className="space-y-3">
                  {yearEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`relative py-2 rounded transition-colors duration-200 ${
                        selectedEvent?.id === event.id ? 'bg-secondary' : ''
                      }`}
                      ref={(el) => {
                        if (el) eventRefs.current.set(event.id, el)
                      }}
                    >
                      {/* Event marker and content in a flex container for alignment */}
                      <div className="flex items-center gap-4">
                        {/* Left dot container with centered dot */}
                        <div className="flex items-center justify-center w-12 relative">
                          {/* Event marker */}
                          <div
                            className={`min-w-[20px] h-[20px] border-[3px] border-solid border-[color:var(--color-border)] rounded-full cursor-pointer z-10 transition-all duration-300 ease-in-out hover:scale-[1.2] focus:scale-[1.2] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] timeline-marker ${
                              selectedEvent?.id === event.id
                                ? 'bg-[color:var(--color-primary)] border-4 ' +
                                  (prefersReducedMotion
                                    ? ''
                                    : 'animate-[pulse_1.5s_ease-in-out_infinite]')
                                : 'bg-[color:var(--color-secondary)]'
                            }`}
                            onClick={() => handleEventSelect(event)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleEventSelect(event)
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`${event.title}, ${formatDate(event.date)}`}
                          >
                            {event.icon}
                          </div>
                        </div>

                        {/* Event content */}
                        <div className="flex-1 pr-2 w-full overflow-hidden">
                          <div className="flex flex-col w-full">
                            <div className="text-[1rem] font-mono font-bold text-[color:var(--color-primary)] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {event.title}
                            </div>
                            <div className="text-[0.8rem] font-mono opacity-80 text-[color:var(--color-text)]">
                              {formatDate(event.date)}
                            </div>
                          </div>
                          {event.description && (
                            <div className="text-[0.85rem] mt-1 font-mono opacity-80 max-w-prose line-clamp-1 text-ellipsis overflow-hidden text-[color:var(--color-text)]">
                              {truncateText(event.description)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Timeline end marker for intersection observer */}
          <div ref={timelineEndRef} className="h-4 w-full" aria-hidden="true"></div>
        </div>
      </div>

      {/* Selected event details - now sticky until end of timeline */}
      <div className={`md:w-2/5 ${isDetailSticky ? 'md:sticky md:top-4' : ''}`}>
        <EventDetail selectedEvent={selectedEvent} selectedEventRef={selectedEventRef} />
      </div>
    </div>
  )
}
