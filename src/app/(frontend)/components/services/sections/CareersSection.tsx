'use client'

import React from 'react'
import { FaBriefcase } from 'react-icons/fa'

/**
 * Section component indicating availability for full-time positions.
 */
const CareersSection: React.FC = () => (
  <section className="px-8 mb-24 py-16 bg-amber-50 border-4 border-border shadow-[8px_8px_0_var(--shadow-color)] relative max-w-6xl mx-auto before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] before:bg-[length:16px_16px] before:opacity-5 before:pointer-events-none">
    <div className="text-center max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
        <div className="relative w-32 h-20 mb-6 flex items-center justify-center border-4 border-border border-dashed bg-amber-100 shadow-[4px_4px_0_var(--shadow-color)] pixel-icon-container">
          {/* Icon */}
          <div className="relative z-10 scale-100 transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce-mini">
            <FaBriefcase size={32} />
          </div>
        </div>

        <h3 className="font-['Press_Start_2P'] text-[2.5rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] leading-12">
          Available for Full-Time Positions
        </h3>
      </div>
      <p className="font-pixel text-md text-text-color leading-10">
        While I enjoy freelance work, I&apos;m also{' '}
        <span className="pixel-underline">open to full-time opportunities</span> with companies that
        value innovation and creative problem-solving. If you&apos;re looking for a dedicated
        developer to join your team, let&apos;s connect!
      </p>
    </div>
  </section>
)

export default CareersSection
