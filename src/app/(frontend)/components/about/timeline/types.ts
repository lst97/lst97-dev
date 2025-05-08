// Types
export interface TimelineEvent {
  id: string | number
  date: Date | string
  title: string
  description?: string
  icon?: React.ReactNode
}

export interface TimelineProps {
  events: TimelineEvent[]
  startYear?: number
  endYear?: number
  className?: string
  style?: React.CSSProperties
  onEventClick?: (event: TimelineEvent) => void
  backgroundImagePath?: string
  useVerticalLayoutOnMobile?: boolean
  disableAutoScroll?: boolean
  onAutoScroll?: (isAutoScrolling: boolean) => void
}

// Constants
export const AUTO_SCROLL_INTERVAL = 5000 // 5 seconds
export const TOOLTIP_MIN_WIDTH = '200px'

// Helper functions
export const isLeapYear = (year: number): boolean => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export const getDaysInYear = (year: number): number => {
  return isLeapYear(year) ? 366 : 365
}

export const isValidDate = (date: string | Date): boolean => {
  const d = new Date(date)
  return !Number.isNaN(d.getTime())
}

export const formatDate = (date: Date | string) => {
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

export const getPositionInYear = (date: Date | string, isReversed: boolean) => {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()

  // Use the exact number of days for the year
  const daysInYear = getDaysInYear(d.getFullYear())
  const oneYear = 1000 * 60 * 60 * 24 * daysInYear

  const position = (diff / oneYear) * 100
  return isReversed ? 100 - position : position
}

// Calculate tooltip position to avoid edge overflow
export const getTooltipPosition = (position: number): 'left' | 'center' | 'right' => {
  // Determine if the tooltip should be left/center/right aligned based on position
  if (position < 20) return 'left'
  if (position > 80) return 'right'
  return 'center'
}
