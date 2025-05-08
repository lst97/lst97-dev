import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CVData, CVPage } from '@/frontend/models/CV'
import { CVLeftSection } from './CVLeftSection'
import { CVRightSection } from './CVRightSection'
import { Marker } from './Marker'
import { CVHeader } from './CVHeader'
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'

interface CVProps {
  data: CVData
  inView?: boolean
  onHandleNextSection?: () => void
  onHandlePreviousSection?: () => void
  isMainScrolling?: boolean
}

// Animation states for the CV component
type AnimationStatus =
  | 'idle'
  | 'flipping-left'
  | 'flipping-right'
  | 'fading-out-up'
  | 'fading-out-down'

// Animation variants for consistent animations
const pageVariants = {
  enter: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? '-100%' : '100%',
    opacity: 1,
  }),
}

const fadeVariants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 20 },
  exitUp: { opacity: 0, y: '-100vh' },
  exitDown: { opacity: 0, y: '100vh' },
}

export const CV = React.memo<React.FC<CVProps>>(
  ({
    data,
    inView = false,
    onHandleNextSection,
    onHandlePreviousSection,
    isMainScrolling = false,
  }: CVProps) => {
    const [currentPage, setCurrentPage] = useState(0)
    const [isCVFocused, setIsCVFocused] = useState(false)
    const [, setIsHovering] = useState(false)
    const cvContainerRef = useRef<HTMLDivElement>(null)
    const totalPages = data.pages.length
    const fadeControls = useAnimationControls()

    // State machine for animations
    const [animationStatus, setAnimationStatus] = useState<AnimationStatus>('idle')
    const [direction, setDirection] = useState<'left' | 'right'>('left')

    // Wrap page data in useMemo to prevent unnecessary prop changes
    const memoizedPages = React.useMemo(() => data.pages, [data.pages])

    // Reset current page when main section changes
    useEffect(() => {
      if (isMainScrolling) {
        setCurrentPage(0)
      }
    }, [isMainScrolling])

    // Detect CV section activation with higher precision
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => setIsCVFocused(entry.isIntersecting), {
        threshold: [0.9, 1],
      })

      if (cvContainerRef.current) {
        observer.observe(cvContainerRef.current)
      }

      return () => observer.disconnect()
    }, [])

    // Handle section transitions (separate from page flip)
    const handleSectionTransition = useCallback(
      async (direction: 'up' | 'down') => {
        setAnimationStatus(direction === 'down' ? 'fading-out-down' : 'fading-out-up')

        await fadeControls.start(direction === 'down' ? 'exitDown' : 'exitUp')

        if (direction === 'down') {
          onHandlePreviousSection?.()
        } else {
          onHandleNextSection?.()
        }

        fadeControls.set('visible')
        setAnimationStatus('idle')
      },
      [fadeControls, onHandleNextSection, onHandlePreviousSection],
    )

    // Handle page flip within CV
    const handlePageFlip = useCallback(
      async (flipDirection: 'left' | 'right') => {
        if (animationStatus !== 'idle' || isMainScrolling) return

        setAnimationStatus(flipDirection === 'left' ? 'flipping-left' : 'flipping-right')
        setDirection(flipDirection)

        const newPage =
          flipDirection === 'left'
            ? Math.min(currentPage + 1, totalPages - 1)
            : Math.max(currentPage - 1, 0)

        // If we're at the edge and trying to go beyond
        if (newPage === currentPage) {
          if (flipDirection === 'left' && newPage === totalPages - 1) {
            await handleSectionTransition('up')
          } else if (flipDirection === 'right' && newPage === 0) {
            await handleSectionTransition('down')
          }
          return
        }

        // Otherwise just update the page
        setCurrentPage(newPage)

        // Reset animation status after transition duration
        setTimeout(() => {
          setAnimationStatus('idle')
        }, 400) // Match the animation duration
      },
      [animationStatus, currentPage, totalPages, handleSectionTransition, isMainScrolling],
    )

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (!isCVFocused || isMainScrolling || animationStatus !== 'idle') return

        // Arrow keys for navigation
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          handlePageFlip('left') // Next page
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePageFlip('right') // Previous page
        }
      },
      [isCVFocused, isMainScrolling, animationStatus, handlePageFlip],
    )

    // Only attach event listeners for keyboard navigation when CV is focused
    useEffect(() => {
      if (!cvContainerRef.current) return

      if (isCVFocused && !isMainScrolling) {
        // Keyboard events can be targeted to the CV element directly
        const cvElement = cvContainerRef.current
        cvElement.addEventListener('keydown', handleKeyDown as EventListener)
        // Make the element focusable for keyboard events
        cvElement.setAttribute('tabindex', '0')

        return () => {
          cvElement.removeEventListener('keydown', handleKeyDown as EventListener)
          cvElement.removeAttribute('tabindex')
        }
      }
    }, [isCVFocused, handleKeyDown, isMainScrolling])

    // In view animation
    useEffect(() => {
      fadeControls.start(inView ? 'visible' : 'hidden')
    }, [inView, fadeControls])

    return (
      <motion.div
        ref={cvContainerRef}
        className="w-full max-w-[1200px] mx-auto flex flex-col p-3 sm:p-5 overflow-hidden font-['Press_Start_2P'] text-base leading-tight text-[#333] border-4 border-[#333] bg-[#fff3c4] shadow-[4px_4px_0px_0px_gray] relative h-auto min-h-[800px] md:h-[800px] lg:h-[1000px] xl:h-[1200px] [image-rendering:pixelated]"
        style={{ perspective: 1000 }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        animate={fadeControls}
        initial="hidden"
        variants={fadeVariants}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        aria-label="CV Document with multiple pages"
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            className="w-full h-full absolute top-0 left-0 bg-[#fff3c4] shadow-[-5px_0_15px_rgba(0,0,0,0.1)] [backface-visibility:hidden] overflow-y-auto no-scrollbar"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              zIndex: 2,
              transformOrigin: direction === 'left' ? 'right center' : 'left center',
            }}
          >
            <PageContent page={memoizedPages[currentPage]} inView={inView} />
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        {totalPages > 1 && (
          <>
            {/* Previous page button */}
            <button
              onClick={() => handlePageFlip('right')}
              disabled={currentPage === 0 && animationStatus !== 'idle'}
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-[#2c2c2c] border-2 border-[#4a4a4a] text-[#fff3c4] py-2 px-2 sm:py-3 sm:px-3 font-['Press_Start_2P'] text-xs transition-all duration-200 hover:bg-[#4a4a4a] hover:border-[#fff3c4] ${
                currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-label="Previous page"
            >
              ◀
            </button>

            {/* Next page button */}
            <button
              onClick={() => handlePageFlip('left')}
              disabled={currentPage === totalPages - 1 && animationStatus !== 'idle'}
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-[#2c2c2c] border-2 border-[#4a4a4a] text-[#fff3c4] py-2 px-2 sm:py-3 sm:px-3 font-['Press_Start_2P'] text-xs transition-all duration-200 hover:bg-[#4a4a4a] hover:border-[#fff3c4] ${
                currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-label="Next page"
            >
              ▶
            </button>
          </>
        )}

        {/* Page indicators */}
        {totalPages > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${currentPage === index ? 'bg-[#b58900]' : 'bg-gray-400'}`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Accessibility instructions */}
        <div className="sr-only">
          Use left and right arrow keys or the navigation buttons to navigate between pages.
          Currently on page {currentPage + 1} of {totalPages}.
        </div>
      </motion.div>
    )
  },
)

CV.displayName = 'CV'

const PageContent = React.memo(({ page, inView }: { page: CVPage; inView: boolean }) => (
  <div className="p-2 sm:p-5 h-full box-border">
    {page.header && (
      <CVHeader
        name={page.header.name}
        jobTitle={page.header.jobTitle}
        location={page.header.location}
        phone={page.header.phone}
        email={page.header.email}
        imageUrl={page.header.imageUrl}
      />
    )}
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:flex-1 p-2 px-8 sm:p-8 md:max-w-[300px]">
        {page.leftSections.map((section) => (
          <CVLeftSection key={section.id} section={section} inView={inView} />
        ))}
      </div>
      <div className="w-full md:flex-2 p-2 sm:p-8 md:pl-9 relative max-h-full md:max-h-[900px] overflow-y-auto no-scrollbar">
        <div
          className="absolute left-2 md:left-6 top-0 h-full w-0.5 bg-[#b58900] z-[1] hidden md:block"
          style={{ minHeight: '100%' }}
        >
          <Marker className="top-0 left-[1px] -translate-x-1/2 -translate-y-1/2 bg-[#b58900] border-none w-4 h-4" />
        </div>
        <div className="relative">
          {page.rightSections.map((section) => (
            <CVRightSection key={section.id} section={section} inView={inView} />
          ))}
        </div>
      </div>
    </div>
  </div>
))

PageContent.displayName = 'PageContent'
