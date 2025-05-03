'use client'

import React from 'react'
import { FreelancerAdvantage } from '../types'
import FreelancerAdvantageCard from '../FreelancerAdvantageCard'

/**
 * Props for the FreelancerSection component.
 */
interface FreelancerSectionProps {
  /** An array of freelancer advantage objects to display. */
  freelancerAdvantages: FreelancerAdvantage[]
}

/**
 * Section component highlighting the advantages of hiring a freelancer.
 * @param {FreelancerSectionProps} props - The props for the component.
 */
const FreelancerSection: React.FC<FreelancerSectionProps> = ({
  freelancerAdvantages,
}: FreelancerSectionProps) => (
  <section
    className="mb-24 py-16 bg-card border-4 border-border shadow-[8px_8px_0_var(--shadow-color)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[linear-gradient(45deg,transparent_45%,var(--border-color)_45%,var(--border-color)_55%,transparent_55%)] before:bg-[length:16px_16px] before:opacity-5 before:pointer-events-none"
    id="career"
  >
    <h2 className="leading-16 font-pixel text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
      The Freelancer
    </h2>
    <p className="font-pixel text-[1.2rem] md:text-[1.8rem] text-text-color leading-[2] text-center max-w-[1400px] mx-auto mb-24 px-24">
      Choosing a freelance web developer like myself means partnering with a{' '}
      <span className="pixel-underline">dedicated professional</span> who is as invested in your
      project's success as you are. Here's what sets the freelance experience apart:
    </p>
    <div className="flex flex-col gap-24 max-w-6xl mx-auto px-8 md:px-32">
      {freelancerAdvantages.map((adv: FreelancerAdvantage, i: number) => (
        <FreelancerAdvantageCard key={i} {...adv} />
      ))}
    </div>
  </section>
)

export default FreelancerSection
