import React from 'react'
import TypingAnimation from '@/frontend/components/animation/TypingAnimation'

/**
 * Props for the HeroSection component.
 */
interface HeroSectionProps {
  /** The main title text for the hero section. */
  titleText: string
}

/**
 * Hero section component with a typing animation title for the Guest Book page.
 * @param {HeroSectionProps} props - The props for the component.
 */
const HeroSection: React.FC<HeroSectionProps> = ({ titleText }: HeroSectionProps) => (
  <section className="text-center mb-16 py-16 bg-card-background relative mt-[50vh] h-96">
    <div className="relative px-8">
      <TypingAnimation text={titleText} />
      <div className="mt-8 max-w-4xl mx-auto">
        <p className="font-pixel text-lg text-text-color leading-relaxed">
          Welcome to my digital guest book! Leave a message, share your thoughts, or just say hello.
          Your words will be part of this site&apos;s story.
        </p>
      </div>
    </div>
  </section>
)

export default HeroSection
