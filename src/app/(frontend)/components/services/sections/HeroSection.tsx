'use client'

import React from 'react'
import { TypingAnimationProps } from '@/frontend/components/services/types'

/**
 * Props for the HeroSection component.
 */
interface HeroSectionProps {
  /** The main title text for the hero section. */
  titleText: string
  /** The TypingAnimation component to be used for the title. */
  TypingAnimation: React.FC<TypingAnimationProps>
}

/**
 * Hero section component with a typing animation title.
 * @param {HeroSectionProps} props - The props for the component.
 */
const HeroSection: React.FC<HeroSectionProps> = ({
  titleText,
  TypingAnimation,
}: HeroSectionProps) => (
  <section className="text-center mb-16 py-16 bg-card-background relative mt-[50vh] h-96">
    <div className="relative px-8">
      <TypingAnimation text={titleText} />
    </div>
  </section>
)

export default HeroSection
