import React from 'react'

/**
 * Props for the TypingAnimation component.
 */
export interface TypingAnimationProps {
  /** The text to be displayed with a typing animation. */
  text: string
}

/**
 * Service interface for the service section
 */
export interface Service {
  id: number
  title: string
  icon: React.ReactNode
  description: string
  features: string[]
}

/**
 * FreelancerAdvantage interface for the freelancer section
 */
export interface FreelancerAdvantage {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  bgClass?: string
}

/**
 * Technology interface for the technology section
 */
export interface Technology {
  id: number
  name: string
  icon: React.ReactNode
}

/**
 * Project process step interface
 */
export interface ProjectProcessStep {
  title: string
  description: string
  icon: string
}

/**
 * Project idea interface
 */
export interface ProjectIdea {
  title: string
  content: string
}

/**
 * Project color palette interface
 */
export interface ProjectColorPalette {
  lightTheme: string[]
  darkTheme: string[]
}

/**
 * Project technology interface
 */
export interface ProjectTechnology {
  title: string
  icon: string
}

/**
 * Project data type from the services project showcase
 */
export interface ProjectData {
  id: number
  title: string
  bannerText: string
  description: string
  image: string
  logoUrl: string
  logoDescription: string
  process: ProjectProcessStep[]
  presentation: string
  background: string
  ideas: ProjectIdea[]
  client: string
  industry: string
  services: string[]
  websiteUrl: string
  technologies: ProjectTechnology[]
  colorPalette: ProjectColorPalette
  features: string[]
  liveUrl: string
  githubUrl: string
}
