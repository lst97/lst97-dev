'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { CloseIconButton } from '@/frontend/components/ui/Buttons'
import { AsciiTextGenerator } from '@/frontend/components/common/generators/Ascii'
import { motion } from 'framer-motion'
import { useScroll as useScrollContext } from '@/frontend/contexts/ScrollContext'
import { routes } from '@/frontend/constants/routes'
import '@/frontend/styles/blinking-triangle.css'
import { ReleaseNote } from '@/frontend/components/dialog/ReleaseNote'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'
import { NavigationLink } from '@/frontend/components/ui/Links'

// Shared style constants
const navLinkClass =
  "border-4 border-gray-800 bg-amber-50 text-center w-full font-['Press_Start_2P'] text-gray-800 uppercase text-xl p-5 transition-colors duration-200 hover:bg-amber-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"

const desktopNavLinkBaseClass = classNames(
  "font-['Press_Start_2P'] text-gray-800 uppercase transition-colors text-xl px-4",
  'relative text-center h-full flex items-center justify-center',
  'border-r border-gray-800 bg-amber-50 w-full',
  'hover:bg-amber-100',
  'transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md',
  'active:translate-y-0 active:shadow-none',
)

const tabletNavLinkBaseClass = classNames(
  "font-['Press_Start_2P'] text-gray-800 uppercase transition-colors text-xs sm:text-sm px-1",
  'relative text-center h-full flex items-center justify-center',
  'border-r border-gray-800 bg-amber-50 w-full',
  'hover:bg-amber-100',
  'transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md',
  'active:translate-y-0 active:shadow-none',
)

const socialIconLinkClass = classNames(
  'p-2 border border-transparent flex items-center justify-center h-10 w-10',
  'hover:border-gray-800 hover:bg-amber-100',
  'transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md',
  'active:translate-y-0 active:shadow-none',
)

// Type definitions
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface NavbarProps {
  className?: string
}

// Custom style to hide scrollbars
const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

// MobileMenu component
const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Animation variants for the menu
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  }

  // Effect to disable scrolling when the menu is open
  useEffect(() => {
    if (isOpen) {
      // Disable scrolling
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      document.documentElement.style.overflow = 'hidden'

      // Focus the first link when menu opens
      firstLinkRef.current?.focus()

      // Handle Escape key press
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => {
        // Re-enable scrolling when menu closes
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
        document.documentElement.style.overflow = ''
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Inject no-scrollbar styles */}
      <style>{noScrollbarStyle}</style>

      <motion.div
        ref={menuRef}
        id="mobile-menu"
        className="fixed inset-0 z-51 bg-amber-50 border-8 border-gray-800 p-5 overflow-hidden w-screen no-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        style={{ maxHeight: '100vh' }}
      >
        {/* Circular pattern background */}
        <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[70vw] h-[70vw] opacity-10">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="pixelFade" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#fffbec" stopOpacity="0" />
                  <stop offset="70%" stopColor="#fffbec" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#fffbec" stopOpacity="1" />
                </radialGradient>
                <pattern
                  id="pixelPattern"
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(45)"
                >
                  <rect width="5" height="5" fill="#b58900" />
                  <rect x="5" y="5" width="5" height="5" fill="#b58900" />
                </pattern>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#pixelPattern)" />
              <circle cx="50" cy="50" r="50" fill="url(#pixelFade)" />
            </svg>
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <CloseIconButton
            onClick={onClose}
            className="w-12 h-12 border-double border-4 border-gray-800 bg-amber-100 hover:bg-amber-200 rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
          />
        </div>

        <div className="md:h-full flex flex-col items-center justify-center relative z-10 no-scrollbar">
          <div className="mb-10">
            <AsciiTextGenerator text="MENU" />
          </div>

          <div className="flex flex-col gap-6 w-full max-w-md">
            <motion.div variants={itemVariants}>
              <NavigationLink
                href={routes.home}
                ref={firstLinkRef}
                className={navLinkClass}
                onClick={onClose}
              >
                HOME
              </NavigationLink>
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavigationLink href={routes.resources} className={navLinkClass} onClick={onClose}>
                RESOURCES
              </NavigationLink>
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavigationLink href={routes.projects} className={navLinkClass} onClick={onClose}>
                PROJECTS
              </NavigationLink>
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavigationLink href={routes.about} className={navLinkClass} onClick={onClose}>
                ABOUT
              </NavigationLink>
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavigationLink href={routes.services} className={navLinkClass} onClick={onClose}>
                SERVICES
              </NavigationLink>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-10 flex gap-6">
            <NavigationLink
              href="https://github.com/lst97"
              className="p-4 border-4 border-gray-800 bg-amber-100 hover:bg-amber-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
              aria-label="GitHub Profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/github-pixel-art-icon.svg" alt="" width={32} height={32} />
            </NavigationLink>

            <NavigationLink
              href="https://www.linkedin.com/in/lst97/"
              className="p-4 border-4 border-gray-800 bg-amber-100 hover:bg-amber-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
              aria-label="LinkedIn Profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/linkedin-pixel-art-icon.svg" alt="" width={32} height={32} />
            </NavigationLink>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

// ReleaseNoteButton component
const ReleaseNoteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      className={classNames(
        'w-full bg-amber-100 py-3 px-6 text-center border-r border-gray-800',
        "font-['Press_Start_2P'] md:text-sm text-xs text-gray-800 cursor-pointer h-full",
        'transition-all duration-200 hover:bg-amber-200 ',
        'hover:-translate-y-[1px] hover:shadow active:translate-y-0 active:shadow-none',
        'hover:border-b-amber-600',
        'focus:outline-none focus:ring-2 focus:ring-amber-500',
      )}
      onClick={onClick}
    >
      Check out the lst97.dev alpha release
    </button>
  )
}

// NavbarLogo component
const NavbarLogo = () => {
  return (
    <div className="md:h-full p-10 flex items-center justify-center border-r border-gray-800 overflow-hidden cursor-pointer transition-colors hover:bg-amber-100">
      <NavigationLink
        href={routes.welcome}
        className="w-full h-full flex items-center justify-center no-underline text-gray-800"
        aria-label="LST97 Home"
      >
        <span className="font-press-start text-xl sm:hidden">LST97</span>
        <span className="hidden sm:block md:hidden scale-75 origin-center">
          <AsciiTextGenerator text="LST97" />
        </span>
        <span className="hidden md:block">
          <AsciiTextGenerator text="LST97" />
        </span>
      </NavigationLink>
    </div>
  )
}

// MobileNavToggle component
const MobileNavToggle = ({
  isOpen,
  onToggle,
  buttonRef,
}: {
  isOpen: boolean
  onToggle: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}) => {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="hover:bg-amber-200 p-2 rounded-md border-2 border-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:ring-2 focus:ring-amber-500"
      onClick={onToggle}
      aria-label="Open menu"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <Image src="/hamburger-pixel-art.png" alt="" width={24} height={24} />
    </button>
  )
}

// TabletNavLinks component
const TabletNavLinks = ({ currentPath }: { currentPath: string }) => {
  const navLinks = [
    { href: routes.resources, label: 'RESOURCES' },
    { href: routes.projects, label: 'PROJECTS' },
    { href: '/pages/services', label: 'SERVICES' },
    { href: routes.about, label: 'ABOUT' },
    { href: '/pages/test-navigation', label: 'TEST' },
  ]

  return (
    <nav>
      <div className="flex flex-row items-stretch h-full border-r border-gray-800">
        {navLinks.map((link) => {
          const isActive = currentPath === link.href
          return (
            <NavigationLink
              key={link.href}
              href={link.href}
              className={classNames(tabletNavLinkBaseClass, isActive && 'bg-amber-100 shadow-md')}
            >
              {link.label}
            </NavigationLink>
          )
        })}
      </div>
    </nav>
  )
}

// DesktopNavLinks component
const DesktopNavLinks = ({ currentPath }: { currentPath: string }) => {
  const navLinks = [
    { href: routes.resources, label: 'RESOURCES' },
    { href: routes.projects, label: 'PROJECTS' },
    { href: '/pages/services', label: 'SERVICES' },
    { href: routes.about, label: 'ABOUT' },
  ]

  return (
    <nav>
      <div className="flex flex-row items-stretch h-full border-r border-gray-800">
        {navLinks.map((link) => {
          const isActive = currentPath === link.href
          return (
            <NavigationLink
              key={link.href}
              href={link.href}
              className={classNames(desktopNavLinkBaseClass, isActive && 'bg-amber-100 shadow-md')}
            >
              {link.label}
            </NavigationLink>
          )
        })}
      </div>
    </nav>
  )
}

// SocialLinks component
const SocialLinks = () => {
  return (
    <div className="flex">
      <NavigationLink
        href="https://github.com/lst97"
        className={classNames(socialIconLinkClass, 'sm:h-8 sm:w-8 md:h-10 md:w-10')}
        aria-label="GitHub Profile"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/github-pixel-art-icon.svg"
          alt=""
          width={24}
          height={24}
          className="hover:brightness-200 sm:w-5 sm:h-5 md:w-6 md:h-6"
        />
      </NavigationLink>
      <NavigationLink
        href="https://www.linkedin.com/in/lst97/"
        className={classNames(socialIconLinkClass, 'sm:h-8 sm:w-8 md:h-10 md:w-10')}
        aria-label="LinkedIn Profile"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/linkedin-pixel-art-icon.svg"
          alt=""
          width={24}
          height={24}
          className="hover:brightness-200 sm:w-5 sm:h-5 md:w-6 md:h-6"
        />
      </NavigationLink>
    </div>
  )
}

// GetStartedButton component
const GetStartedButton = () => {
  return (
    <NavigationLink
      href={routes.home}
      className={classNames(
        'border border-gray-800 bg-amber-500 text-amber-50',
        'py-2 sm:py-3 px-2 sm:px-3 md:px-6 flex items-center justify-center font-bold text-sm',
        'sm:ml-2 md:ml-4',
        'hover:bg-amber-100 hover:text-gray-800',
        'transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md',
        'active:translate-y-0 active:shadow-none',
        'text-xs sm:text-sm whitespace-nowrap',
      )}
    >
      GET STARTED →
    </NavigationLink>
  )
}

// Main Navbar component
function Navbar({ className }: Readonly<NavbarProps>) {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false)
  const { isNavbarVisible } = useScrollContext()
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false)
  const pathname = usePathname()
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null)

  // Return focus to hamburger button after menu closes
  useEffect(() => {
    if (!isHamburgerMenuOpen) {
      hamburgerButtonRef.current?.focus()
    }
  }, [isHamburgerMenuOpen])

  return (
    <>
      <ReleaseNote
        open={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
        title="lst97.dev - Alpha Release Notes"
      />

      <MobileMenu isOpen={isHamburgerMenuOpen} onClose={() => setIsHamburgerMenuOpen(false)} />

      <motion.nav
        className={classNames('w-screen bg-amber-50 flex flex-col h-24', 'z-50', className)}
        style={{ position: 'relative', zIndex: 50 }}
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isNavbarVisible ? 0 : -100,
          opacity: isNavbarVisible ? 1 : 0,
        }}
      >
        <div className="grid grid-cols-[1fr_4fr] sm:grid-cols-[2fr_8fr] items-stretch border-b border-gray-800 bg-amber-50 h-24">
          <NavbarLogo />

          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between h-full">
              <ReleaseNoteButton onClick={() => setIsReleaseNotesOpen(true)} />
              <div className="sm:hidden px-4">
                <MobileNavToggle
                  isOpen={isHamburgerMenuOpen}
                  onToggle={() => setIsHamburgerMenuOpen(true)}
                  buttonRef={hamburgerButtonRef}
                />
              </div>
            </div>

            {/* Tablet Navigation (sm but not md) */}
            <div className="hidden sm:grid md:hidden sm:grid-cols-[7fr_3fr] flex-1 items-stretch">
              <TabletNavLinks currentPath={pathname} />

              <div className="flex items-center justify-end gap-1 px-1 sm:px-2 h-full">
                <SocialLinks />
                <GetStartedButton />
              </div>
            </div>

            {/* Desktop Navigation (md and above) */}
            <div className="hidden md:grid md:grid-cols-[7fr_3fr] flex-1 items-stretch">
              <DesktopNavLinks currentPath={pathname} />

              <div className="flex items-center justify-end gap-4 px-6 h-full">
                <SocialLinks />
                <GetStartedButton />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  )
}

export default Navbar
