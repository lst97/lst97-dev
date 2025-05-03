'use client'

import React from 'react'
import { TimelineEvent, formatDate } from './types'

interface EventDetailProps {
  selectedEvent: TimelineEvent | null
  selectedEventRef: React.RefObject<HTMLDivElement>
}

export const EventDetail: React.FC<EventDetailProps> = ({ selectedEvent, selectedEventRef }) => {
  if (!selectedEvent) {
    return (
      <div className="mt-4 md:mt-0 p-4 text-center text-[color:var(--color-border)] font-mono opacity-70 bg-[color:var(--background-color)] border border-[color:var(--color-border)] rounded-[2px]">
        Select an event on the timeline to view details
      </div>
    )
  }

  return (
    <div
      ref={selectedEventRef}
      className="mt-4 md:mt-0 relative bg-[#2c2c2c] border-solid border-[color:var(--color-border)] shadow-md overflow-hidden pixel-container rounded-[2px]"
      aria-live="polite"
    >
      {/* Terminal header */}
      <div className="h-5 bg-[color:var(--color-border)] flex items-center px-2 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#ff6b6b]"></div>
        <div className="w-2 h-2 rounded-full bg-[#feca57]"></div>
        <div className="w-2 h-2 rounded-full bg-[#1dd1a1]"></div>
      </div>

      {/* Content area */}
      <div className="p-4 bg-[#2c2c2c] relative overflow-hidden retro-content">
        <div className="font-['Press_Start_2P'] text-md font-semibold mb-2 text-[color:var(--color-secondary-light)]">
          {selectedEvent.title}
        </div>
        <div className="font-['Press_Start_2P'] mt-2 text-md opacity-80 text-white">
          {formatDate(selectedEvent.date)}
        </div>
        {selectedEvent.description && (
          <div className="font-['Press_Start_2P'] mt-2 text-xs opacity-80 text-white">
            {selectedEvent.description}
          </div>
        )}
      </div>

      {/* Speech bubble notch - only show on mobile */}
      <div className="absolute -top-2 left-5 w-[var(--pixel-notch-size)] h-[var(--pixel-notch-size)] bg-[#2c2c2c] border-solid border-[color:var(--color-border)] rotate-45 pixel-notch md:hidden"></div>
    </div>
  )
}
