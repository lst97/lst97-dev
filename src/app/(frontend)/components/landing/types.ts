import { RefObject, ReactNode } from 'react'

// Common section props
export interface BaseSectionProps {
  sectionRef: RefObject<HTMLDivElement | null>
  isMobileView: boolean
}

// Hero section props
export interface HeroSectionProps extends BaseSectionProps {
  prefersReducedMotion: boolean | null
  onScrollToNext: () => void
}

// Features section props
export interface FeaturesSectionProps extends BaseSectionProps {
  isInView: boolean
  onScrollToNext: () => void
}

// Tech stack section props
export interface TechStackSectionProps extends BaseSectionProps {
  isInView: boolean
  onScrollToNext: () => void
}

// CTA section props
export interface CtaSectionProps extends BaseSectionProps {
  isInView: boolean
}

// Feature data type
export interface SiteFeature {
  id: string
  title: string
  description: string
  details: string
  icon: ReactNode
  link: string
  color: string
  youtubeId?: string
}

// Floating element props
export interface FloatingElementProps {
  src: string
  alt: string
  width: number
  height: number
  className: string
  imageClassName?: string
  floatDuration?: number
  floatOffset?: number
  hoverScale?: number
}

// Cloud props
export interface CloudProps {
  className?: string
}
