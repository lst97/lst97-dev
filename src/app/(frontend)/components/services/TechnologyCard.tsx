'use client'

import React from 'react'

/**
 * Props for the TechnologyCard component.
 */
interface TechnologyCardProps {
  /** The icon representing the technology. */
  icon: React.ReactNode
  /** The name of the technology. */
  name: string
}

/**
 * A card component to display a technology with a flip effect.
 * @param {TechnologyCardProps} props - The props for the component.
 */
const TechnologyCard: React.FC<TechnologyCardProps> = ({ icon, name }: TechnologyCardProps) => (
  <div className="group perspective-500 transform-gpu h-[260px] w-full max-w-[280px]">
    <div className="relative w-full h-full transition-all duration-500 preserve-3d group-hover:rotate-y-180">
      {/* Front of the card */}
      <div className="absolute inset-0 p-6 border-4 border-border bg-amber-50 shadow-[8px_8px_0_var(--shadow-color)] backface-hidden flex flex-col items-center justify-center">
        {/* Tech icon container */}
        <div className="relative w-[90px] h-[90px] mb-6 flex items-center justify-center border-4 border-border border-dashed bg-amber-100 shadow-[4px_4px_0_var(--shadow-color)] pixel-icon-container">
          {/* Icon */}
          <div className="relative z-10 scale-100 transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce-mini">
            {icon}
          </div>
        </div>

        {/* Tech name */}
        <h3 className="font-['Press_Start_2P'] text-[1rem] text-text-color text-center drop-shadow-[2px_2px_0_var(--text-shadow-color)]">
          {name}
        </h3>

        {/* Pixelated progress bar */}
        <div className="w-full h-3 mt-4 bg-amber-200 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-accent-color animate-progress-bar"
            style={{ width: '0%' }}
          ></div>
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute top-0 w-3 h-3 bg-border"
              style={{ left: `${i * 12.5}%`, opacity: i % 2 === 0 ? 0.3 : 0.6 }}
            ></span>
          ))}
        </div>
      </div>

      {/* Back of the card */}
      <div className="absolute inset-0 p-4 border-4 border-border bg-amber-100 shadow-[8px_8px_0_var(--shadow-color)] backface-hidden rotate-y-180 flex flex-col items-center justify-center">
        <div className="text-center px-2 flex flex-col items-center justify-between h-full">
          <h3 className="font-['Press_Start_2P'] text-sm text-text-color mb-3">{name}</h3>
          <div className="font-pixel text-sm">{getTechnology(name)}</div>
        </div>
      </div>
    </div>
  </div>
)

/**
 * Helper function to get technology descriptions.
 * @param {string} tech - The name of the technology.
 * @returns {string} - A description for the technology.
 */
const getTechnology = (tech: string): string => {
  const levels: { [key: string]: string } = {
    React: 'Building interactive user interfaces',
    'Next.js': 'Exploring the realm of server components',
    TypeScript: 'Adopting type safety for clearer code',
    'Node.js': 'Navigating the backend landscape',
    'Tailwind CSS': 'Mastering utility-first styling battles',
    Firebase: 'Questing with databases and user authentication',
  }

  return levels[tech] || 'On the learning path!'
}

export default TechnologyCard
