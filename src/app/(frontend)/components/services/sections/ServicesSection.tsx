'use client'

import React from 'react'
import { Service } from '../types'

/**
 * Props for the ServicesSection component.
 */
interface ServicesSectionProps {
  /** An array of service objects to display. */
  services: Service[]
}

/**
 * Section component displaying the services offered.
 * @param {ServicesSectionProps} props - The props for the component.
 */
const ServicesSection: React.FC<ServicesSectionProps> = ({ services }: ServicesSectionProps) => (
  <section className="mb-16" id="frontend">
    <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
      What I Offer
    </h2>
    <div className="grid grid-cols-1 gap-12 mb-16 max-w-[900px] mx-auto">
      {services.map((service: Service) => (
        <div
          key={service.id}
          className="border-4 border-border p-8 transition-all duration-300 relative shadow-[8px_8px_0_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--shadow-color)] bg-amber-50 before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-5 after:pointer-events-none"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-dashed border-border">
            <div className="text-[2rem] text-accent-color flex items-center justify-center w-16 h-16 border-[3px] border-border bg-amber-100 shadow-[4px_4px_0_var(--shadow-color)] transition-all duration-300 hover:scale-110 hover:rotate-3 pixel-icon-container pixel-shimmer-hover">
              <div className="absolute inset-0 pixel-pattern-3 opacity-20"></div>
              {service.icon}
            </div>
            <h3 className="font-['Press_Start_2P'] text-[1.5rem] text-text-color m-0">
              {service.title}
            </h3>
          </div>

          <span className="font-pixel text-md mb-8 leading-[1.8] whitespace-pre-line block p-4">
            {service.description}
          </span>

          <ul className="list-none mt-8 bg-amber-100 p-4 border-2 border-dashed border-border">
            {service.features.map((feature: string, index: number) => (
              <li
                key={index}
                className="font-pixel text-lg mb-4 pl-8 relative before:content-['→'] before:absolute before:left-0 before:text-accent-color"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
)

export default ServicesSection
