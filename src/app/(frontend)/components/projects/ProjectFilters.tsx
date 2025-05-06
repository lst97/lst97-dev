import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  FaStar,
  FaCode,
  FaPause,
  FaArchive,
  FaFlask,
  FaBookOpen,
  FaGithub,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import { useThrottle } from '@/frontend/hooks/useThrottle'

interface ProjectFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'featured', label: 'Featured', icon: <FaStar /> },
  { id: 'current', label: 'Current', icon: <FaCode /> },
  { id: 'on-hold', label: 'On-Hold', icon: <FaPause /> },
  { id: 'deprecated', label: 'Deprecated', icon: <FaArchive /> },
  { id: 'open-source', label: 'Open-Source', icon: <FaGithub /> },
  { id: 'learning', label: 'Learning', icon: <FaFlask /> },
  { id: 'case-study', label: 'Case Study', icon: <FaBookOpen /> },
]
const SCROLL_AMOUNT = 200

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ selectedCategory, onCategoryChange }) => {
  const tabListRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const checkScrollPosition = useCallback(() => {
    if (tabListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabListRef.current
      const canScrollLeft = scrollLeft > 1
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1
      setShowLeftArrow((current) => (current !== canScrollLeft ? canScrollLeft : current))
      setShowRightArrow((current) => (current !== canScrollRight ? canScrollRight : current))
    }
  }, [])

  const throttledCheckScrollPosition = useThrottle(checkScrollPosition, 100)

  useEffect(() => {
    checkScrollPosition()
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
    }
  }, [throttledCheckScrollPosition, checkScrollPosition])

  useEffect(() => {
    const idx = CATEGORIES.findIndex((cat) => cat.id === selectedCategory)
    if (tabButtonRefs.current[idx]) {
      tabButtonRefs.current[idx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }, [selectedCategory])

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      let newIndex = null
      if (e.key === 'ArrowRight') {
        newIndex = (idx + 1) % CATEGORIES.length
      } else if (e.key === 'ArrowLeft') {
        newIndex = (idx - 1 + CATEGORIES.length) % CATEGORIES.length
      } else if (e.key === 'Home') {
        newIndex = 0
      } else if (e.key === 'End') {
        newIndex = CATEGORIES.length - 1
      }
      if (newIndex !== null) {
        e.preventDefault()
        setFocusedIndex(newIndex)
        tabButtonRefs.current[newIndex]?.focus()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onCategoryChange(CATEGORIES[idx].id)
      }
    },
    [onCategoryChange],
  )

  useEffect(() => {
    const idx = CATEGORIES.findIndex((cat) => cat.id === selectedCategory)
    setFocusedIndex(idx)
  }, [selectedCategory])

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      if (tabListRef.current) {
        const newScrollLeft =
          tabListRef.current.scrollLeft + (direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT)
        tabListRef.current.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth',
        })
        setTimeout(checkScrollPosition, 120)
      }
    },
    [checkScrollPosition],
  )

  return (
    <div className="relative w-full mb-16 px-8 py-4 bg-secondary border-4 border-yellow-900 shadow-[8px_8px_0_rgba(0,0,0,0.2)] flex items-center gap-4 md:px-4 md:py-3 sm:px-2 sm:py-3">
      <div className="flex items-center justify-center flex-shrink-0 z-20">
        {showLeftArrow && (
          <button
            className="w-9 h-9 flex items-center justify-center bg-yellow-50 border-4 border-yellow-900 text-yellow-900 cursor-pointer transition-all duration-200 shadow-[4px_4px_0_rgba(0,0,0,0.2)] p-0 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:text-yellow-600 active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_rgba(0,0,0,0.2)] md:w-8 md:h-8 sm:w-7 sm:h-7"
            onClick={() => scroll('left')}
            aria-label="Scroll tabs left"
            type="button"
          >
            <FaChevronLeft className="w-4 h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex relative py-2 overflow-x-auto scrollbar-hide scroll-smooth whitespace-nowrap gap-2"
          role="tablist"
          aria-label="Project categories"
          ref={tabListRef}
        >
          {CATEGORIES.map((category, idx) => (
            <button
              key={category.id}
              ref={(el) => {
                tabButtonRefs.current[idx] = el
              }}
              role="tab"
              aria-selected={selectedCategory === category.id}
              aria-controls={`${category.id}-panel`}
              id={`${category.id}-tab`}
              tabIndex={focusedIndex === idx ? 0 : -1}
              className={`relative px-5 py-3 bg-transparent border-none cursor-pointer font-['Press_Start_2P'] text-sm text-yellow-900 transition-all duration-200 opacity-70 border-4 border-transparent flex-shrink-0 md:px-4 md:py-2 md:text-xs sm:px-3 sm:py-2 sm:text-xs ${
                selectedCategory === category.id
                  ? 'opacity-100 bg-yellow-100 border-yellow-900 shadow-[4px_4px_0_rgba(0,0,0,0.2)]'
                  : ''
              } hover:opacity-100`}
              onClick={() => onCategoryChange(category.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              type="button"
            >
              <div className="flex items-center gap-2 md:gap-2 sm:gap-1.5 whitespace-nowrap">
                {category.icon && (
                  <span className="flex items-center text-base md:text-sm sm:text-xs">
                    {category.icon}
                  </span>
                )}
                <span className="relative">{category.label}</span>
              </div>
              {selectedCategory === category.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-transparent" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center flex-shrink-0 z-20">
        {showRightArrow && (
          <button
            className="w-9 h-9 flex items-center justify-center bg-yellow-50 border-4 border-yellow-900 text-yellow-900 cursor-pointer transition-all duration-200 shadow-[4px_4px_0_rgba(0,0,0,0.2)] p-0 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:text-yellow-600 active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_rgba(0,0,0,0.2)] md:w-8 md:h-8 sm:w-7 sm:h-7"
            onClick={() => scroll('right')}
            aria-label="Scroll tabs right"
            type="button"
          >
            <FaChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ProjectFilters
