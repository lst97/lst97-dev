'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import SchemaOrg from './components/common/SchemaOrg'
import { HeroSection, FeaturesSection, TechStackSection, CtaSection } from './components/landing' // Import from the new index.ts

const NUM_SECTIONS = 4 // Total number of sections
const ANIMATION_DURATION = 700 // ms, should match your Framer Motion transition duration
const SCROLL_DEBOUNCE_TIME = ANIMATION_DURATION + 100 // Buffer for scroll events
const MOBILE_BREAKPOINT = 768 // px, for switching to normal scroll

export default function LandingClient() {
  const prefersReducedMotion = useReducedMotion()
  const [currentSection, setCurrentSection] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const lastScrollTimeRef = useRef(0)

  // Refs are kept for potential direct access or specific section logic if needed,P
  // but primary navigation is via currentSection state.
  const sectionRef0 = useRef<HTMLDivElement>(null)
  const sectionRef1 = useRef<HTMLDivElement>(null)
  const sectionRef2 = useRef<HTMLDivElement>(null)
  const sectionRef3 = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sectionRefs = [sectionRef0, sectionRef1, sectionRef2, sectionRef3]

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkMobileView() // Initial check
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  const navigateToSection = useCallback(
    (targetSection: number) => {
      if (isMobileView) {
        // Mobile: use smooth scroll into view
        if (sectionRefs[targetSection]?.current) {
          sectionRefs[targetSection].current?.scrollIntoView({ behavior: 'smooth' })
          // Optionally update currentSection if needed for other logic, though not for scroll itself
          setCurrentSection(targetSection)
        }
        return
      }

      // Desktop: PowerPoint style scroll
      if (isAnimating) {
        return
      }
      if (targetSection >= 0 && targetSection < NUM_SECTIONS && targetSection !== currentSection) {
        setIsAnimating(true)
        setCurrentSection(targetSection)
        lastScrollTimeRef.current = Date.now()
        setTimeout(() => {
          setIsAnimating(false)
        }, ANIMATION_DURATION)
      }
    },
    [isAnimating, currentSection, isMobileView, sectionRefs], // sectionRefs added
  )

  useEffect(() => {
    if (isMobileView) return // Don't attach wheel/keyboard listeners on mobile

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const now = Date.now()
      if (isAnimating || now - lastScrollTimeRef.current < SCROLL_DEBOUNCE_TIME) {
        return
      }
      if (event.deltaY > 0) {
        navigateToSection(currentSection + 1)
      } else if (event.deltaY < 0) {
        navigateToSection(currentSection - 1)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      const now = Date.now()
      if (isAnimating || now - lastScrollTimeRef.current < SCROLL_DEBOUNCE_TIME) {
        if (isAnimating) return
        if (now - lastScrollTimeRef.current < SCROLL_DEBOUNCE_TIME) return
      }
      if (event.key === 'ArrowDown') {
        navigateToSection(currentSection + 1)
      } else if (event.key === 'ArrowUp') {
        navigateToSection(currentSection - 1)
      }
    }

    const container = document.getElementById('fullpage-scroll-container')
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSection, isAnimating, navigateToSection, isMobileView])

  return (
    <>
      {/* Add Person structured data for better representation in search results */}
      <SchemaOrg
        type="Person"
        title="Nelson Lai - Full-Stack Developer & Software Engineer"
        description="Personal website of Nelson Lai (LST97) - Full-Stack Developer specializing in React, Next.js, and modern web development."
      />

      <div
        id="fullpage-scroll-container"
        style={{
          height: isMobileView ? 'auto' : '100vh',
          overflow: isMobileView ? 'auto' : 'hidden',
          position: 'relative',
        }}
      >
        <motion.div
          className="flex flex-col" // Sections are stacked vertically
          animate={!isMobileView ? { y: `-${currentSection * 100}vh` } : { y: 0 }}
          transition={
            !isMobileView
              ? { duration: ANIMATION_DURATION / 1000, ease: 'easeInOut' }
              : { duration: 0 }
          }
          style={{
            width: '100%',
            height: isMobileView ? 'auto' : `${NUM_SECTIONS * 100}vh`,
          }} // Container for all sections
        >
          <HeroSection
            sectionRef={sectionRefs[0]}
            prefersReducedMotion={prefersReducedMotion}
            // titleY is removed as global scroll-based parallax is not compatible
            onScrollToNext={() => navigateToSection(1)}
            isMobileView={isMobileView}
          />
          <FeaturesSection
            sectionRef={sectionRefs[1]}
            isInView={currentSection === 1}
            onScrollToNext={() => navigateToSection(2)}
            isMobileView={isMobileView}
          />
          <TechStackSection
            sectionRef={sectionRefs[2]}
            isInView={currentSection === 2}
            onScrollToNext={() => navigateToSection(3)}
            isMobileView={isMobileView}
          />
          <CtaSection
            sectionRef={sectionRefs[3]}
            isInView={currentSection === 3}
            isMobileView={isMobileView}
          />
        </motion.div>
      </div>
    </>
  )
}
