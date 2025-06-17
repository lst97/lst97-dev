import React from 'react'
import { Gear } from '../types'

/**
 * Props for the GearSection component.
 */
interface GearSectionProps {
  /** An array of gear objects to display. */
  gear: Gear[]
}

/**
 * Section component displaying delivery gear and equipment.
 * @param {GearSectionProps} props - The props for the component.
 */
const GearSection: React.FC<GearSectionProps> = ({ gear }: GearSectionProps) => (
  <section className="mb-16" id="gear">
    <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
      Professional Gear
    </h2>
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <p className="font-pixel text-lg text-text-color leading-relaxed max-w-4xl mx-auto">
          I invest in popper equipment to ensure every delivery meets the highest standards.
          Here&apos;s the gear that helps me keep your food hot and secure during transport.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
        {gear.map((item: Gear) => (
          <div
            key={item.id}
            className="border-4 flex flex-col border-border p-6 transition-all duration-300 relative shadow-[8px_8px_0_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--shadow-color)] bg-amber-50 before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-5 after:pointer-events-none"
          >
            <div className="flex-1">
              {/* Gear Image */}
              <div className="mb-6 relative">
                <div className="aspect-video w-full border-2 border-dashed border-border bg-amber-100 flex items-center justify-center relative overflow-hidden">
                  {/* Placeholder for now - you can replace with actual images */}
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="font-pixel text-sm text-text-color">Image Upload Area</p>
                    <p className="font-pixel text-xs text-text-color opacity-70 mt-1">
                      {item.name}
                    </p>
                  </div>
                  {/* Future: Replace with actual image upload functionality */}
                  {/* <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                /> */}
                </div>
              </div>

              {/* Gear Info */}
              <div className="mb-4">
                <h3 className="font-['Press_Start_2P'] text-[1.2rem] text-text-color mb-3">
                  {item.name}
                </h3>
                <p className="font-pixel text-sm text-text-color leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-amber-100 p-4 border-2 border-dashed border-border md:min-h-64">
              <h4 className="font-['Press_Start_2P'] text-sm text-accent-color mb-3">
                Key Features:
              </h4>
              <ul className="list-none">
                {item.features.map((feature: string, index: number) => (
                  <li
                    key={index}
                    className="font-pixel text-sm mb-2 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-accent-color before:font-bold"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Instructions */}
      <div className="border-4 border-border p-8 bg-card-background shadow-[8px_8px_0_var(--shadow-color)] max-w-4xl mx-auto bg-card">
        <h3 className="font-['Press_Start_2P'] text-[1.5rem] text-text-color mb-4 text-center ">
          Gear Image Upload
        </h3>
        <p className="font-pixel text-md text-text-color leading-relaxed text-center mb-4">
          I&apos;ll be adding actual photos of my professional delivery gear soon. Each piece of
          equipment is carefully selected to ensure your food arrives in perfect condition.
        </p>
        <div className="text-center">
          <div className="inline-block border-2 border-dashed border-accent-color p-4 bg-amber-100">
            <p className="font-pixel text-sm text-accent-color">
              📸 Coming Soon: Real gear photos and detailed specifications
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default GearSection
