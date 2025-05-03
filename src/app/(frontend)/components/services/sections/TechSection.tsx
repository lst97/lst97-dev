'use client'

import React from 'react'
import { Technology } from '../types'
import TechnologyCard from '../TechnologyCard'

/**
 * Props for the TechSection component.
 */
interface TechSectionProps {
  /** An array of technology objects to display. */
  technologies: Technology[]
}

/**
 * Section component showcasing the technologies used.
 * @param {TechSectionProps} props - The props for the component.
 */
const TechSection: React.FC<TechSectionProps> = ({ technologies }: TechSectionProps) => (
  <section
    className="bg-amber-50 mb-64 py-16 bg-card-background border-4 border-border shadow-[8px_8px_0_var(--shadow-color)] relative max-w-6xl mx-auto before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[linear-gradient(to_right,transparent_50%,var(--border-color)_50%),linear-gradient(to_bottom,transparent_50%,var(--border-color)_50%)] before:bg-[length:8px_8px] before:opacity-5 before:pointer-events-none"
    id="fullstack"
  >
    <h2 className="font-pixel text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
      Backed By
    </h2>

    <p className="font-pixel text-lg text-text-color text-center max-w-[800px] mx-auto mb-10 px-4">
      Hands-on development and problem-solving experience using the following technologies and
      frameworks
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 mt-12 max-w-[1200px] mx-auto px-8">
      {technologies.map((tech: Technology) => (
        <div key={tech.id} className="h-[300px] w-full flex items-center justify-center">
          <TechnologyCard icon={tech.icon} name={tech.name} />
        </div>
      ))}
    </div>

    <div className="text-center mt-16">
      <div className="inline-block px-4 sm:px-6 py-3 font-pixel text-sm sm:text-md border-4 border-border bg-amber-200 shadow-[4px_4px_0_var(--shadow-color)] relative hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
        <span className="text-text-color">⚡ Always covering new technologies ⚡</span>
      </div>
    </div>
  </section>
)

export default TechSection
