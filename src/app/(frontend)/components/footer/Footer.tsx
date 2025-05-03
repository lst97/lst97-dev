'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaCode,
  FaReact,
  FaNodeJs,
  FaTools,
  FaUserClock,
  FaPuzzlePiece,
  FaBriefcase,
  FaBuilding,
  FaComments,
  FaDollarSign,
} from 'react-icons/fa'
import { routes } from '@/frontend/constants/routes'
import { contact } from '@/frontend/constants/data/contact'

const navLinks = [
  { href: routes.home, icon: FaCode, text: 'Home' },
  { href: routes.resources, icon: FaPuzzlePiece, text: 'Resources' },
  { href: routes.projects, icon: FaBriefcase, text: 'Projects' },
  { href: routes.about, icon: FaBuilding, text: 'About' },
]

const serviceLinks = [
  { href: '#frontend', icon: FaReact, text: 'Frontend Development' },
  { href: '#fullstack', icon: FaNodeJs, text: 'Full-Stack Solutions' },
  { href: '#consulting', icon: FaTools, text: 'Technical Consulting' },
  { href: '#career', icon: FaUserClock, text: 'Career Opportunities' },
]

const connectLinks = [
  { href: `mailto:${contact.email}`, icon: FaComments, text: 'Get in Touch' },
  { href: '#pricing', icon: FaDollarSign, text: 'Pricing' },
]

export const Footer = () => (
  <footer className="relative w-screen bg-background px-8 py-24 mt-24 border-t-4 border-border overflow-hidden left-1/2 -translate-x-1/2 box-border">
    {/* Decorative background grid pattern */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 footer-grid-pattern"
    />
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
      {/* Navigation */}
      <div className="flex flex-col gap-8">
        <h3 className="font-['Press_Start_2P',monospace] text-2xl text-text mb-8 drop-shadow-[2px_2px_0_var(--text-shadow-color)]">
          Navigation
        </h3>
        <div className="flex flex-col gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="press-start-2p-regular text-sm text-text no-underline transition-all flex items-center gap-4 hover:text-accent hover:translate-x-1"
            >
              <link.icon /> {link.text}
            </Link>
          ))}
        </div>
      </div>
      {/* Services */}
      <div className="flex flex-col gap-8">
        <h3 className="font-['Press_Start_2P',monospace] text-2xl text-[var(--text-color)] mb-8 drop-shadow-[2px_2px_0_var(--text-shadow-color)]">
          Services
        </h3>
        <div className="flex flex-col gap-8">
          {serviceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="press-start-2p-regular text-sm text-text no-underline transition-all flex items-center gap-4 hover:text-accent hover:translate-x-1"
            >
              <link.icon /> {link.text}
            </Link>
          ))}
        </div>
      </div>
      {/* Connect */}
      <div className="flex flex-col gap-8">
        <h3 className="font-['Press_Start_2P',monospace] text-2xl text-[var(--text-color)] mb-8 drop-shadow-[2px_2px_0_var(--text-shadow-color)]">
          Connect
        </h3>
        <div className="flex flex-col gap-8">
          {connectLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="press-start-2p-regular text-sm text-text no-underline transition-all flex items-center gap-4 hover:text-accent hover:translate-x-1"
            >
              <link.icon /> {link.text}
            </Link>
          ))}
        </div>
        <div className="flex gap-8 mt-8">
          <Link href="https://github.com/lst97" target="_blank" rel="noopener noreferrer">
            <Image
              src="/github-pixel-art-icon.svg"
              alt="GitHub"
              width={32}
              height={32}
              className="transition-all hover:scale-110"
            />
          </Link>
          <Link href="https://www.linkedin.com/in/lst97/" target="_blank" rel="noopener noreferrer">
            <Image
              src="/linkedin-pixel-art-icon.svg"
              alt="LinkedIn"
              width={32}
              height={32}
              className="transition-all hover:scale-110"
            />
          </Link>
        </div>
      </div>
    </div>
    <div className="mt-16 pt-8 border-t-2 border-dashed border-[var(--color-border)] text-center font-mono text-base text-[var(--text-color)] relative z-10">
      <p>© {new Date().getFullYear()} lst97.dev | All rights reserved</p>
    </div>
  </footer>
)

export default Footer
