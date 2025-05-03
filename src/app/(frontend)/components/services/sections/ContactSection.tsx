'use client'

import React from 'react'

/**
 * Props for the ContactSection component.
 */
interface ContactSectionProps {
  /** Child elements to render within the contact section. */
  children: React.ReactNode
}

/**
 * Section component containing the contact form.
 * @param {ContactSectionProps} props - The props for the component.
 */
const ContactSection: React.FC<ContactSectionProps> = ({ children }: ContactSectionProps) => (
  <section
    className="mb-24 py-16 bg-amber-50 border-4 border-border shadow-[8px_8px_0_var(--shadow-color)] relative max-w-6xl mx-auto before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] before:bg-[length:16px_16px] before:opacity-5 before:pointer-events-none"
    id="consulting"
  >
    <h2 className="leading-16 font-pixel text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
      Get in Touch
    </h2>
    {children}
  </section>
)

export default ContactSection
