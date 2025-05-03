'use client'

import React from 'react'

/**
 * Props for the FreelancerAdvantageCard component.
 */
interface FreelancerAdvantageCardProps {
  /** The icon to display at the top of the card. */
  icon: React.ReactNode
  /** The title of the advantage. */
  title: string
  /** The description of the advantage, can include React nodes for formatting. */
  description: React.ReactNode
}

/**
 * A card component to display a freelancer advantage.
 * @param {FreelancerAdvantageCardProps} props - The props for the component.
 */
const FreelancerAdvantageCard: React.FC<FreelancerAdvantageCardProps> = ({
  icon,
  title,
  description,
}: FreelancerAdvantageCardProps) => (
  <div className="bg-amber-100 border-4 border-border p-4 sm:p-6 md:p-8 transition-all duration-300 relative shadow-[8px_8px_0_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--shadow-color)] before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-grid-lines after:opacity-5 after:pointer-events-none md:w-auto w-full">
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 mb-6 md:mb-8">
      <div className="min-w-16 min-h-16 sm:min-w-20 sm:min-h-20 border-dashed text-[2.5rem] sm:text-[3rem] text-accent-color flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border-[3px] border-border bg-amber-100 shadow-[4px_4px_0_var(--shadow-color)] transition-all duration-300 m-0 hover:scale-110 hover:rotate-3 pixel-icon-container pixel-shimmer-hover pixel-border-animated">
        <div className="absolute inset-0 pixel-pattern-1 opacity-20"></div>
        {icon}
      </div>
      <h3 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-[2rem] text-text-color m-0 drop-shadow-[3px_3px_0_var(--text-shadow-color)] text-center sm:text-left break-words hyphens-auto">
        {title}
      </h3>
    </div>
    <p className="font-pixel text-md sm:text-lg text-text-color leading-[1.8] p-3 sm:p-4 md:p-6 border-border">
      {description}
    </p>
  </div>
)

export default FreelancerAdvantageCard
