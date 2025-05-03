import React, { useRef, useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

// ===== Constants for magic numbers =====
const SCROLL_AMOUNT = 200
const ANIMATION_X_OFFSET = 64
const ANIMATION_BLOCK_DURATION_MS = 300
const GRADIENT_SEGMENT_WIDTH = 4
const GRADIENT_SEGMENT_WIDTH_2X = GRADIENT_SEGMENT_WIDTH * 2
const SCROLL_THROTTLE_MS = 100
const RESIZE_THROTTLE_MS = 150

// ===== Tailwind class constants for readability =====
// Tab button base styles
const TAB_BUTTON_BASE = [
  'relative',
  'px-5',
  'py-3',
  'md:px-4',
  'md:py-2.5',
  'sm:px-3',
  'sm:py-2',
  'bg-[var(--color-card)]',
  'border-[3px]',
  'border-[var(--color-border)]',
  'cursor-pointer',
  'font-[var(--font-pixel)]',
  'text-[0.9rem]',
  'md:text-[0.8rem]',
  'sm:text-[0.75rem]',
  'text-[var(--color-text)]',
  'transition-all',
  'duration-200',
  'opacity-70',
  'shadow-[4px_4px_0_var(--shadow)]',
  'shrink-0',
  'hover:opacity-100',
  'hover:-translate-x-0.5',
  'hover:-translate-y-0.5',
  'hover:shadow-[6px_6px_0_var(--shadow)]',
  'hover:text-[var(--color-accent)]',
].join(' ')
// Tab button active styles
const TAB_BUTTON_ACTIVE = [
  'opacity-100',
  'bg-[var(--color-accent)]',
  'text-[var(--color-button-text)]',
  'border-[3px]',
  'border-[var(--color-border)]',
  'shadow-[4px_4px_0_var(--shadow)]',
].join(' ')
// Tab panel base styles
const TAB_PANEL_BASE = [
  'flex',
  'flex-col',
  'h-auto',
  'relative',
  'w-full',
  'z-20',
  'justify-between',
  'transition-none',
  'p-8',
  'md:p-6',
  'sm:p-4',
].join(' ')
// Tab indicator styles (used in style prop)
const TAB_INDICATOR_STYLE = `repeating-linear-gradient(to right, var(--color-accent) 0, var(--color-accent) ${GRADIENT_SEGMENT_WIDTH}px, transparent ${GRADIENT_SEGMENT_WIDTH}px, transparent ${GRADIENT_SEGMENT_WIDTH_2X}px)`

// ===== Simple throttle implementation =====
function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let lastCall = 0
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any[]
  const throttled = (...args: any[]) => {
    const now = Date.now()
    lastArgs = args
    if (now - lastCall >= wait) {
      lastCall = now
      fn(...args)
    } else if (!timeout) {
      timeout = setTimeout(
        () => {
          lastCall = Date.now()
          timeout = null
          fn(...lastArgs)
        },
        wait - (now - lastCall),
      )
    }
  }
  throttled.cancel = () => {
    if (timeout) clearTimeout(timeout)
    timeout = null
  }
  return throttled
}

// Smooth scroll animation for tab list
function animateScrollTo(element: HTMLElement, to: number, duration = 400, onDone?: () => void) {
  const start = element.scrollLeft
  const change = to - start
  const startTime = performance.now()
  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }
  function animate(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = easeInOutQuad(progress)
    element.scrollLeft = start + change * ease
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      if (onDone) onDone()
    }
  }
  requestAnimationFrame(animate)
}

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
  count?: number
  footer?: React.ReactNode
}

interface PixelTabPanelProps {
  tabs: Tab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
}

type AnimationDirection = 'left' | 'right'

const PixelTabPanel: React.FC<PixelTabPanelProps> = ({ tabs, defaultTab, onTabChange }) => {
  // Robust defaultTab fallback
  const initialTabId = useMemo(() => {
    if (defaultTab && tabs.some((tab) => tab.id === defaultTab)) {
      return defaultTab
    }
    return tabs[0]?.id || ''
  }, [tabs, defaultTab])

  const [selectedTab, setSelectedTab] = useState<string>(initialTabId)
  const [previousTab, setPreviousTab] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('right')
  const tabListRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Tab button refs for keyboard navigation
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Height animation state
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)

  // ===== Throttled scroll/resize handlers =====
  const checkScrollPosition = useCallback(() => {
    if (tabListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabListRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth)
    }
  }, [])
  const throttledCheckScrollPosition = useMemo(
    () => throttle(checkScrollPosition, SCROLL_THROTTLE_MS),
    [checkScrollPosition],
  )

  useEffect(() => {
    throttledCheckScrollPosition()
    const tabList = tabListRef.current
    if (tabList) {
      tabList.addEventListener('scroll', throttledCheckScrollPosition)
    }
    window.addEventListener('resize', throttledCheckScrollPosition)
    return () => {
      if (tabList) {
        tabList.removeEventListener('scroll', throttledCheckScrollPosition)
      }
      window.removeEventListener('resize', throttledCheckScrollPosition)
      throttledCheckScrollPosition.cancel && throttledCheckScrollPosition.cancel()
    }
  }, [throttledCheckScrollPosition])

  // ===== Throttled resize handler for height animation =====
  const updateContainerHeight = useCallback(() => {
    const currentPanel = selectedTab ? panelRefs.current[selectedTab] : null
    if (currentPanel) {
      setContainerHeight(currentPanel.offsetHeight)
    }
  }, [selectedTab])
  const throttledResizeHandler = useMemo(
    () => throttle(updateContainerHeight, RESIZE_THROTTLE_MS),
    [updateContainerHeight],
  )

  useLayoutEffect(() => {
    updateContainerHeight()
  }, [selectedTab, previousTab, tabs, updateContainerHeight])

  useEffect(() => {
    window.addEventListener('resize', throttledResizeHandler)
    return () => {
      window.removeEventListener('resize', throttledResizeHandler)
      throttledResizeHandler.cancel && throttledResizeHandler.cancel()
    }
  }, [throttledResizeHandler])

  const scroll = (direction: 'left' | 'right') => {
    if (tabListRef.current) {
      const newScrollLeft =
        tabListRef.current.scrollLeft + (direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT)
      animateScrollTo(tabListRef.current, newScrollLeft)
    }
  }

  const getTabIndex = (tabId: string) => {
    return tabs.findIndex((tab) => tab.id === tabId)
  }

  const handleTabChange = (tabId: string) => {
    if (tabId !== selectedTab && !isAnimating) {
      const currentIndex = getTabIndex(selectedTab)
      const newIndex = getTabIndex(tabId)
      const direction = newIndex > currentIndex ? 'right' : 'left'
      setIsAnimating(true)
      setPreviousTab(selectedTab)
      setSelectedTab(tabId)
      setAnimationDirection(direction)
      onTabChange?.(tabId)
      setTimeout(() => {
        setIsAnimating(false)
        setPreviousTab(null)
      }, 300)
    }
  }

  // Keyboard navigation handler
  const handleTabKeyDown = (event: React.KeyboardEvent, tabId: string, index: number) => {
    let nextIndex = index
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nextIndex = (index + 1) % tabs.length
      tabButtonRefs.current[nextIndex]?.focus()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nextIndex = (index - 1 + tabs.length) % tabs.length
      tabButtonRefs.current[nextIndex]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      nextIndex = 0
      tabButtonRefs.current[nextIndex]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      nextIndex = tabs.length - 1
      tabButtonRefs.current[nextIndex]?.focus()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleTabChange(tabId)
    }
  }

  // Framer Motion variants for sliding panels
  const getPanelVariants = (direction: AnimationDirection) => ({
    initial: {
      x: direction === 'right' ? ANIMATION_X_OFFSET : -ANIMATION_X_OFFSET,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 400, damping: 32 },
        opacity: { duration: 0.2 },
      },
    },
    exit: {
      x: direction === 'right' ? -ANIMATION_X_OFFSET : ANIMATION_X_OFFSET,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 400, damping: 32 },
        opacity: { duration: 0.2 },
      },
    },
  })

  // Center selected tab on change
  useEffect(() => {
    const idx = getTabIndex(selectedTab)
    const tabBtn = tabButtonRefs.current[idx]
    const tabList = tabListRef.current
    if (tabBtn && tabList) {
      const offset = tabBtn.offsetLeft + tabBtn.offsetWidth / 2 - tabList.clientWidth / 2
      animateScrollTo(tabList, offset)
    }
  }, [selectedTab])

  return (
    <div className="relative w-full">
      <div aria-hidden="true" />
      {/* Tab Bar */}
      <div className="relative w-full flex items-center gap-4 border-b-8 border-double border-[var(--color-border)] bg-[var(--color-hover)] shadow-[0_4px_0_var(--shadow)] z-20 px-8 py-4 md:px-4 md:py-3 sm:px-2 sm:py-3">
        {/* Left Scroll Button */}
        <div className="flex items-center justify-center shrink-0 z-20">
          <AnimatePresence initial={false}>
            {showLeftArrow && (
              <motion.button
                key="left-arrow"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-9 h-9 flex items-center justify-center bg-[var(--color-card)] border-[3px] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer transition-all duration-200 shadow-[4px_4px_0_var(--shadow)] p-0 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)] hover:text-[var(--color-accent)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--shadow)]"
                onClick={() => scroll('left')}
                aria-label="Scroll tabs left"
                type="button"
              >
                <FaChevronLeft className="w-4 h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        {/* Tab List */}
        <div className="flex-1 overflow-hidden relative">
          {/* Edge Gradients for Tab List only */}
          {showLeftArrow && (
            <div
              className="pointer-events-none absolute left-0 top-0 h-full w-8 z-30"
              style={{
                background: 'linear-gradient(to right, var(--color-hover) 60%, transparent 100%)',
              }}
            />
          )}
          {showRightArrow && (
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-8 z-30"
              style={{
                background: 'linear-gradient(to left, var(--color-hover) 60%, transparent 100%)',
              }}
            />
          )}
          <div
            className="font-['Press_Start_2P'] flex relative p-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap gap-2 pt-4"
            role="tablist"
            aria-label="Content tabs"
            ref={tabListRef}
            onScroll={checkScrollPosition}
          >
            {tabs.map((tab, idx) => (
              <div
                key={tab.id}
                className="relative inline-flex flex-col items-center max-w-[180px] md:max-w-[140px] sm:max-w-[110px]"
              >
                {/* Pixel-art counter badge above the tab */}
                {typeof tab.count === 'number' && (
                  <span
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center px-2 h-6 min-w-6 text-xs font-bold border-[3px] border-[var(--color-border)] bg-[var(--color-accent)] text-[var(--color-button-text)] shadow-[2px_2px_0_var(--shadow)] rounded-sm"
                    style={{
                      fontFamily: 'var(--font-pixel), monospace',
                      boxShadow: '2px 2px 0 var(--shadow)',
                    }}
                  >
                    {tab.count}
                    <span
                      className="ml-1 w-2 h-2 bg-[var(--color-border)] inline-block align-middle"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </span>
                )}
                <button
                  role="tab"
                  aria-selected={selectedTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                  tabIndex={selectedTab === tab.id ? 0 : -1}
                  ref={(el) => {
                    tabButtonRefs.current[idx] = el
                  }}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id, idx)}
                  className={`${TAB_BUTTON_BASE} ${selectedTab === tab.id ? TAB_BUTTON_ACTIVE : ''} w-full truncate`}
                  onClick={() => handleTabChange(tab.id)}
                  type="button"
                >
                  <div className="flex items-center gap-2 md:gap-2 sm:gap-1 whitespace-nowrap overflow-hidden">
                    {tab.icon && (
                      <span className="flex items-center text-[1.1rem] md:text-[1rem] sm:text-[0.9rem]">
                        {tab.icon}
                      </span>
                    )}
                    <span className="relative truncate block">{tab.label}</span>
                  </div>
                  {selectedTab === tab.id && (
                    <div
                      className="absolute left-0 w-full h-[3px] -bottom-[3px]"
                      style={{
                        background: TAB_INDICATOR_STYLE,
                      }}
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Right Scroll Button */}
        <div className="flex items-center justify-center shrink-0 z-20">
          <AnimatePresence initial={false}>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-9 h-9 flex items-center justify-center bg-[var(--color-card)] border-[3px] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer transition-all duration-200 shadow-[4px_4px_0_var(--shadow)] p-0 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)] hover:text-[var(--color-accent)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--shadow)]"
                onClick={() => scroll('right')}
                aria-label="Scroll tabs right"
                type="button"
              >
                <FaChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Tab Panels */}
      <motion.div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-[var(--color-card)]"
        animate={{ height: containerHeight || 'auto' }}
        transition={{ height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
        style={{ height: containerHeight }}
      >
        {/* Pixel art background pattern */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[400px] h-[400px] opacity-10 z-10"
          style={{
            backgroundImage: "url('/pig-on-file-pixel-art.svg')",
            backgroundSize: '400px 400px',
            transform: 'translate(-50%, -50%)',
          }}
          aria-hidden="true"
        />
        <AnimatePresence initial={false} custom={animationDirection}>
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab.id
            const isLeaving = previousTab === tab.id
            if (!isSelected && !isLeaving) return null
            const direction = isSelected
              ? animationDirection
              : animationDirection === 'right'
                ? 'left'
                : 'right'
            return (
              <motion.div
                key={tab.id}
                ref={(el) => {
                  panelRefs.current[tab.id] = el
                }}
                role="tabpanel"
                id={`${tab.id}-panel`}
                aria-labelledby={`${tab.id}-tab`}
                className={TAB_PANEL_BASE + (isLeaving ? ' absolute top-0 left-0 w-full' : '')}
                data-status={isSelected ? 'entering' : 'leaving'}
                data-direction={animationDirection}
                variants={getPanelVariants(direction as AnimationDirection)}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={direction}
              >
                {tab.content}
                {isSelected && tab.footer && (
                  <div className="mt-8 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text)] opacity-80">
                    {tab.footer}
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default PixelTabPanel
