import React from 'react'
import { FaUber } from 'react-icons/fa'

/**
 * Call-to-action section component for the Uber page.
 */
const CTASection: React.FC = () => (
  <section className="mb-16" id="cta">
    <div className="max-w-7xl mx-auto text-center bg-card">
      <div className="border-4 border-border p-12 bg-card-background shadow-[8px_8px_0_var(--shadow-color)] relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-5 after:pointer-events-none">
        <div className="mb-8">
          <div className="font-['Press_Start_2P'] text-[2.5rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-6 leading-tight">
            Ready for Delivery?
          </div>
          <p className="font-pixel text-lg text-text-color leading-relaxed max-w-2xl mx-auto mb-8">
            When you order through Uber Eats, you might just get me as your driver! I&apos;m
            committed to treating every delivery with the same level of care and professionalism.
          </p>
        </div>

        {/* Stats Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-amber-100 p-4 border-2 border-dashed border-border">
            <div className="font-['Press_Start_2P'] text-[1.5rem] text-accent-color mb-2">
              2000+
            </div>
            <p className="font-pixel text-sm text-text-color">Happy Customers</p>
          </div>
          <div className="bg-amber-100 p-4 border-2 border-dashed border-border">
            <div className="font-['Press_Start_2P'] text-[1.5rem] text-accent-color mb-2">98%</div>
            <p className="font-pixel text-sm text-text-color">Satisfaction Rate</p>
          </div>
          <div className="bg-amber-100 p-4 border-2 border-dashed border-border">
            <div className="font-['Press_Start_2P'] text-[1.5rem] text-accent-color mb-2">0%</div>
            <p className="font-pixel text-sm text-text-color">Cancellation Rate</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a
            href="https://www.ubereats.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group  bg-border inline-flex items-center gap-3 bg-accent-color text-white px-8 py-4 border-4 border-border shadow-[4px_4px_0_var(--shadow-color)] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--shadow-color)] font-['Press_Start_2P'] text-sm"
          >
            <FaUber className="text-xl" />
            Order on Uber Eats
          </a>
        </div>

        {/* Professional Note */}
        <div className="border-t-2 border-dashed border-border pt-6">
          <p className="font-pixel text-sm text-text-color leading-relaxed">
            💼 <strong>Professional Service Guarantee:</strong> Every order is handled with care,
            using popper equipment to ensure your food arrives hot, fresh, and exactly as intended.
          </p>
        </div>
      </div>
    </div>
  </section>
)

export default CTASection
