import React from 'react'
import { Stat } from '../types'

/**
 * Props for the StatsSection component.
 */
interface StatsSectionProps {
  /** An array of stat objects to display. */
  stats: Stat[]
}

/**
 * Section component displaying delivery statistics.
 * @param {StatsSectionProps} props - The props for the component.
 */
const StatsSection: React.FC<StatsSectionProps> = ({ stats }: StatsSectionProps) => (
  <section className="mb-16" id="stats">
    <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
      My Track Record
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 max-w-[1200px] mx-auto">
      {stats.map((stat: Stat, index: number) => (
        <div
          key={index}
          className="border-4 border-border p-6 transition-all duration-300 relative shadow-[8px_8px_0_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--shadow-color)] bg-amber-50 before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-5 after:pointer-events-none text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="text-[2rem] text-accent-color flex items-center justify-center w-16 h-16 border-[3px] border-border bg-amber-100 shadow-[4px_4px_0_var(--shadow-color)] transition-all duration-300 hover:scale-110 hover:rotate-3 pixel-icon-container pixel-shimmer-hover">
              <div className="absolute inset-0 pixel-pattern-3 opacity-20"></div>
              {stat.icon}
            </div>
          </div>

          <div className="font-['Press_Start_2P'] text-[2rem] text-accent-color mb-2">
            {stat.number}
          </div>

          <h3 className="font-['Press_Start_2P'] text-[1rem] text-text-color mb-4">{stat.label}</h3>

          <p className="font-pixel text-sm text-text-color leading-relaxed">{stat.description}</p>
        </div>
      ))}
    </div>
  </section>
)

export default StatsSection
