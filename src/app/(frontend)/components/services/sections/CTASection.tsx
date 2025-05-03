'use client'

import React from 'react'
import Link from 'next/link'
import { routes } from '@/frontend/constants/routes'
/**
 * Props for the CTASection component.
 */
interface CTASectionProps {}

/**
 * Call to Action section component.
 */
const CTASection: React.FC<CTASectionProps> = () => (
  <section className="text-center py-12 sm:py-16 md:py-20 mt-12 sm:mt-16 md:mt-24 relative">
    {/* Decorative pixel elements */}
    <div className="absolute top-[-12px] sm:top-[-16px] md:top-[-20px] left-0 w-full h-3 sm:h-4 bg-[repeating-linear-gradient(90deg,var(--color-border)_0,var(--color-border)_4px,transparent_2px,transparent_24px)]"></div>
    <div className="absolute bottom-[-12px] sm:bottom-[-16px] md:bottom-[-20px] left-0 w-full h-3 sm:h-4 bg-[repeating-linear-gradient(90deg,var(--color-border)_0,var(--color-border)_4px,transparent_2px,transparent_24px)]"></div>

    {/* Main container */}
    <div className="max-w-[95%] sm:max-w-[90%] md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative w-full">
      <div
        className="relative bg-card-background border-2 sm:border-3 md:border-4 border-border shadow-[6px_6px_0_var(--shadow-color)] sm:shadow-[8px_8px_0_var(--shadow-color)] md:shadow-[12px_12px_0_var(--shadow-color)] p-4 sm:p-6 md:p-10 overflow-hidden
                    before:content-[''] before:absolute before:inset-0 before:border-1 sm:before:border-2 before:border-border before:pointer-events-none 
                    after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-10 after:pointer-events-none bg-card"
      >
        {/* Pixel art decorations - Responsive sizing and visibility */}
        <div className="hidden sm:block absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-r-3 border-b-3 sm:border-r-4 sm:border-b-4 md:border-r-6 md:border-b-6 border-l-1 border-t-1 sm:border-l-2 sm:border-t-2 border-border bg-primary"></div>
        <div className="hidden sm:block absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-l-3 border-b-3 sm:border-l-4 sm:border-b-4 md:border-l-6 md:border-b-6 border-r-1 border-t-1 sm:border-r-2 sm:border-t-2 border-border bg-primary"></div>
        <div className="hidden sm:block absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-r-3 border-t-3 sm:border-r-4 sm:border-t-4 md:border-r-6 md:border-t-6 border-l-1 border-b-1 sm:border-l-2 sm:border-b-2 border-border bg-primary"></div>
        <div className="hidden sm:block absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-l-3 border-t-3 sm:border-l-4 sm:border-t-4 md:border-l-6 md:border-t-6 border-r-1 border-b-1 sm:border-r-2 sm:border-b-2 border-border bg-primary"></div>

        {/* Diagonal pattern background */}
        <div className="absolute inset-0 bg-diagonal-lines opacity-5 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col items-center justify-center">
            <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] text-text-color mb-4 sm:mb-6 md:mb-8">
              Ready to Build
              <br />
              Something Amazing?
            </h2>

            <div className="bg-amber-100 border-dashed border-1 sm:border-2 border-border p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 md:mb-10 inline-block">
              <p className="font-['Press_Start_2P'] text-xs sm:text-sm md:text-base text-accent-color">
                Let's work together to bring your ideas to life
              </p>
            </div>

            <div className="relative inline-block animate-bounce-mini bg-secondary">
              <Link
                href={routes.contact}
                className="inline-block px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-['Press_Start_2P'] text-sm sm:text-base md:text-[1.2rem] text-button-text-color bg-button-background border-8 border-border 
                       cursor-pointer no-underline transition-all duration-200 shadow-[3px_3px_0_var(--shadow-color)] sm:shadow-[4px_4px_0_var(--shadow-color)] md:shadow-[6px_6px_0_var(--shadow-color)] 
                       w-full max-w-[200px] sm:max-w-[240px] md:max-w-xs relative z-10
                       hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0_var(--shadow-color)] sm:hover:shadow-[6px_6px_0_var(--shadow-color)] md:hover:shadow-[8px_8px_0_var(--shadow-color)] hover:bg-accent-color"
              >
                <span className="relative z-10 inline-flex items-center">
                  Start a Project
                  <span className="ml-2 inline-block">→</span>
                </span>
              </Link>

              {/* Pixel button glow effect */}
              <div className="absolute -inset-1 bg-accent-color/30 blur-sm -z-10 pixel-shimmer-hover"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default CTASection
