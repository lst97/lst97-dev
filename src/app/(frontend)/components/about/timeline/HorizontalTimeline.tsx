'use client'

import React from 'react'
import { TimelineEvent, formatDate, getPositionInYear, getTooltipPosition } from './types'
import { EventDetail } from './EventDetail'

interface HorizontalTimelineProps {
  yearRange: number[]
  eventsByYear: Map<number, TimelineEvent[]>
  currentYearProgress: number
  selectedEvent: TimelineEvent | null
  selectedEventRef: React.RefObject<HTMLDivElement>
  eventRefs: React.RefObject<Map<string | number, HTMLDivElement>>
  isAutoScrolling: boolean
  prefersReducedMotion: boolean
  backgroundImagePath: string
  toggleAutoScroll: () => void
  handleEventSelect: (event: TimelineEvent) => void
  timelineContainerRef: React.RefObject<HTMLDivElement>
}

export const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({
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
  return (
    <div
      className="w-full max-w-[800px] p-[clamp(1rem,3vw,2rem)] relative mx-auto timeline-container"
      ref={timelineContainerRef}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-no-repeat bg-[256px] opacity-5 pointer-events-none z-0"
        style={{ backgroundImage: `url('${backgroundImagePath}')` }}
        aria-hidden="true"
      ></div>

      {/* Auto-scroll control button */}
      <button
        onClick={toggleAutoScroll}
        className="absolute top-0 right-0 px-2 py-1 text-sm bg-[color:var(--color-border)] text-[color:var(--color-background)] rounded-[2px] z-10"
        aria-label={isAutoScrolling ? 'Pause auto-scroll' : 'Resume auto-scroll'}
      >
        {isAutoScrolling ? 'Pause' : 'Auto-scroll'}
      </button>

      {yearRange.map((year, yearIndex) => {
        const isReversed = yearIndex % 2 === 1
        const yearEvents = eventsByYear.get(year) || []
        const isCurrentYear = year === new Date().getFullYear()

        return (
          <div
            key={year}
            className="relative w-full h-[var(--line-spacing)] flex items-center gap-4"
          >
            <div
              className={`w-[var(--year-width)] font-mono text-[1.2rem] text-right flex-shrink-0 absolute font-semibold whitespace-nowrap ${
                isReversed
                  ? 'left-auto right-[-1rem] text-left transform translate-x-[100%] pr-0 pl-4'
                  : 'left-[-1rem] transform translate-x-[-100%] pr-4'
              } text-[color:var(--color-border)]`}
            >
              {year}
            </div>
            <div className="relative flex-grow h-full flex flex-col justify-center">
              <div className="relative w-full h-[var(--line-thickness)] bg-[color:var(--color-border)]">
                {yearEvents.map((event) => {
                  const position = getPositionInYear(event.date, isReversed)
                  const tooltipPosition = getTooltipPosition(position, isReversed)

                  return (
                    <div
                      key={event.id}
                      className={`absolute w-[20px] h-[20px] border-[3px] border-solid border-[color:var(--color-border)] rounded-full transform translate-x-[-50%] translate-y-[-50%] top-1/2 cursor-pointer z-[1] transition-all duration-300 ease-in-out hover:scale-[1.2] focus:scale-[1.2] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] group ${
                        selectedEvent?.id === event.id
                          ? 'w-[28px] h-[28px] bg-[color:var(--color-primary-dark)] border-4 ' +
                            (prefersReducedMotion
                              ? ''
                              : 'animate-[pulse_1.5s_ease-in-out_infinite]')
                          : 'bg-[color:var(--color-secondary-light)] hover:bg-[color:var(--color-secondary)] focus:bg-[color:var(--color-secondary)]'
                      }`}
                      style={{
                        left: `${position}%`,
                      }}
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
                      ref={(el) => {
                        if (el) eventRefs.current.set(event.id, el)
                      }}
                    >
                      {event.icon}
                      <div
                        className={`absolute bottom-full p-2 rounded-[2px] min-w-[var(--tooltip-min-width)] max-w-[90vw] opacity-0 invisible transition-all duration-200 ease pointer-events-none z-[3] group-hover:opacity-100 group-hover:visible group-hover:translate-y-[-8px] group-focus:opacity-100 group-focus:visible group-focus:translate-y-[-8px] bg-[#2c2c2c] border-solid border-[color:var(--color-border)] ${
                          tooltipPosition === 'left'
                            ? 'left-0 transform-none'
                            : tooltipPosition === 'right'
                              ? 'right-0 left-auto transform-none'
                              : 'left-1/2 transform -translate-x-1/2'
                        }`}
                        role="tooltip"
                      >
                        <div className="font-['Press_Start_2P'] text-[color:var(--color-secondary-light)] text-xs mb-1">
                          {event.title}
                        </div>
                        <div className="font-['Press_Start_2P'] text-white text-xs opacity-80 ">
                          {formatDate(event.date)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {isCurrentYear && (
                  <div
                    className="absolute w-4 h-4 bg-red-500 border-solid border-[color:var(--color-border)] rounded-full transform translate-x-[-50%] translate-y-[-50%] top-1/2 z-10 current-year-marker"
                    style={{
                      left: `${isReversed ? 100 - currentYearProgress : currentYearProgress}%`,
                    }}
                    aria-label={`Current time in ${new Date().getFullYear()}`}
                    aria-hidden="true"
                  ></div>
                )}
              </div>

              {/* Connectors */}
              {yearIndex % 2 === 0 && (
                <div className="absolute w-[var(--line-thickness)] h-[var(--connector-height)] right-0 top-1/2 bg-[color:var(--color-border)]"></div>
              )}
              {yearIndex % 2 === 1 && (
                <div className="absolute w-[var(--line-thickness)] h-[var(--connector-height)] right-0 bottom-1/2 bg-[color:var(--color-border)]"></div>
              )}
              {yearIndex % 2 === 1 && (
                <div className="absolute w-[var(--line-thickness)] h-[var(--connector-height)] left-0 top-1/2 bg-[color:var(--color-border)]"></div>
              )}
              {yearIndex % 2 === 0 && yearIndex > 0 && (
                <div className="absolute w-[var(--line-thickness)] h-[var(--connector-height)] left-0 bottom-1/2 bg-[color:var(--color-border)]"></div>
              )}
            </div>
          </div>
        )
      })}

      {/* Selected event details */}
      <EventDetail selectedEvent={selectedEvent} selectedEventRef={selectedEventRef} />
    </div>
  )
}
