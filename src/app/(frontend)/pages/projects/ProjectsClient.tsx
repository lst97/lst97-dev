'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Dialog } from '@/frontend/components/common/Dialog'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { Button } from '@/frontend/components/ui/Buttons'
import { Project } from '@/frontend/components/projects/ProjectCard'
import { ProjectExplorer } from '@/frontend/components/projects'
import { NavigationLink } from '@/frontend/components/ui/Links'
import { routes } from '@/frontend/constants/routes'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import dynamic from 'next/dynamic'

// Dynamically import the Dashboard component to prevent useSearchParams issues
const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading dashboard...</div>
      </div>
    ),
  },
)

// Sample project data
const projects: Project[] = [
  {
    id: 1,
    title: 'Personal Portfolio',
    description:
      'A modern portfolio website built with Next.js and TypeScript, featuring a unique retro gaming theme.',
    category: 'featured',
    imageUrl: '/chat-pixel-art-icon.svg',
    demoUrl: 'https://lst97.dev',
    repoUrl: 'https://github.com/lst97/lst97.dev',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
  },
  // Add more projects here
]

// Sample testimonials data
const testimonials = [
  {
    quote:
      'Exceptional work! The attention to detail and pixel-perfect implementation exceeded our expectations.',
    author: 'John Doe, Tech Lead at Company X',
  },
  // Add more testimonials here
]

// --- TestimonialsSection Component ---
interface TestimonialsSectionProps {
  testimonials: { quote: string; author: string }[]
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  if (testimonials.length === 0) return null
  return (
    <section
      className="mb-8 sm:mb-12 md:mb-20 px-2 sm:px-4 md:px-8 py-4 sm:py-8 md:py-12 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[8px_8px_0_var(--shadow)] relative overflow-hidden pixel-border  pixel-scanlines"
      style={{ zIndex: 1 }}
    >
      {/* Pixel noise overlay */}
      <div className="bg-pixel-noise absolute inset-0 pointer-events-none z-0" aria-hidden="true" />
      {/* Horizontal lines overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-10 bg-horizontal-lines"
        aria-hidden="true"
      />
      <h2 className="font-['Press_Start_2P'] text-lg sm:text-2xl md:text-3xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-8 text-center relative inline-block">
        <span className="relative inline-block after:block after:h-1 after:w-full after:bg-[var(--color-accent)] after:mt-2">
          What Others Say
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-[var(--color-hover)] dark:bg-[var(--color-hover-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-3 sm:p-4 md:p-8 shadow-[8px_8px_0_var(--shadow)] relative transition-all duration-300 transform-gpu hover:translate-y-[-4px] hover:translate-x-[-4px] hover:scale-[1.02] hover:shadow-[12px_12px_0_var(--shadow)] pixel-border  pixel-scanlines"
          >
            <p className="font-['Press_Start_2P'] text-xs sm:text-sm md:text-base text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-6 leading-relaxed relative pl-1 sm:pl-4">
              {testimonial.quote}
            </p>
            <div className="flex items-center justify-end mt-2 gap-2">
              {/* Pixel-art avatar */}
              <Image
                src="/chat-pixel-art-icon.svg"
                alt="Pixel Art Avatar"
                width={20}
                height={20}
                className="image-pixelated border-2 border-[var(--color-border)] bg-[var(--color-card)] rounded-sm pixel-border"
              />
              <span className="font-['Press_Start_2P'] text-xs sm:text-base md:text-lg text-[var(--color-text)] dark:text-[var(--color-text-light)] bg-[var(--color-accent)] dark:bg-[var(--color-accent-dark)] border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] px-2 sm:px-3 py-1 rounded-sm pixel-border shadow-[2px_2px_0_var(--shadow)] relative inline-block after:block after:h-1 after:w-full after:bg-[var(--color-border)] after:mt-1">
                {testimonial.author}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// --- ContactSection Component ---
const ContactSection: React.FC = () => (
  <section className="relative text-center py-8 sm:py-16 md:py-20 px-2 sm:px-6 md:px-8 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[12px_12px_0_var(--shadow)] mb-8 sm:mb-12 md:mb-20 overflow-hidden flex flex-col items-center">
    <div
      className="pointer-events-none absolute inset-0 opacity-10  bg-grid-lines"
      aria-hidden="true"
    />
    <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-2 sm:mb-4 relative ">
      Let&apos;s Build Something Together
    </h2>
    <p className="font-['Press_Start_2P'] text-base sm:text-xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-8 relative ">
      Have a project in mind? I&apos;d love to help bring your ideas to life.
    </p>
    <Button asChild variant="pixel" className="z-1">
      <NavigationLink href={routes.contact}>Get in Touch</NavigationLink>
    </Button>
    {/* Images at the bottom left and right for mobile, flex for sm+ */}
    <div className="w-full h-16 sm:h-auto relative flex-none">
      {/* Mobile: absolutely position images at bottom left/right, small size */}
      <Image
        src="/construction-working-person-pixel-art.svg"
        alt="Construction Working Person Pixel Art"
        width={100}
        height={100}
        className="block sm:hidden absolute left-0 bottom-0 z-10"
      />
      <Image
        src="/construction-van-pixel-art.svg"
        alt="Construction Van Pixel Art"
        width={100}
        height={100}
        className="block sm:hidden absolute right-0 bottom-0 z-10"
      />
      {/* Desktop/tablet: flex row, larger images */}
      <div className="hidden sm:flex justify-between items-end w-full absolute bottom-0 left-0 px-2 sm:px-0">
        <Image
          src="/construction-working-person-pixel-art.svg"
          alt="Construction Working Person Pixel Art"
          width={200}
          height={200}
          className="mx-auto sm:mx-0"
        />
        <Image
          src="/construction-van-pixel-art.svg"
          alt="Construction Van Pixel Art"
          width={200}
          height={200}
          className="mx-auto sm:mx-0"
        />
      </div>
    </div>
  </section>
)

// The main content component that doesn't use navigation hooks
const ProjectsContent = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen w-full flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] overflow-x-hidden"
    >
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 1 }}
        >
          <PixelArtAnimation
            opacity={0.3}
            numSquares={10}
            sizeRange={[50, 200]}
            interactionDistance={200}
            colors={['#ffe580']}
            debug={true}
            className="w-full h-screen"
          />
        </motion.div>
      </div>

      <div className="border-4 border-border relative w-full min-h-screen flex flex-col bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] px-2 sm:px-8 md:px-16 lg:px-32 py-4 sm:py-8 shadow-[12px_12px_0_var(--shadow)] bg-[radial-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),radial-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px] bg-[position:0_0,_10px_10px]">
        <section className="relative text-center mb-8 sm:mb-16 md:mb-20 pt-8 sm:pt-16 md:pt-20 pb-8 sm:pb-16 md:pb-20 px-2 sm:px-8 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[12px_12px_0_var(--shadow)] transform-gpu perspective-[1000px] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-20 bg-diagonal-lines"
            aria-hidden="true"
          />
          <h1 className="font-['Press_Start_2P'] text-2xl sm:text-4xl md:text-5xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-8 relative  tracking-tighter transform translate-z-[20px]">
            My Projects
          </h1>
          <p className="font-['Press_Start_2P'] text-base sm:text-lg md:text-xl text-[var(--color-text)] dark:text-[var(--color-text-light)] opacity-90 relative  leading-relaxed">
            Exploring the intersection of creativity and technology
          </p>
        </section>
        <div className="flex justify-center sm:justify-end mb-4 sm:mb-0">
          <Image
            src="/worker-climbing-pixel-art.png"
            alt="Worker Climbing Pixel Art"
            width={240}
            height={240}
            className="mx-auto sm:mx-0"
          />
        </div>

        <ProjectExplorer projects={projects} onOpenCaseStudy={setSelectedProject} />

        <TestimonialsSection testimonials={testimonials} />

        <ContactSection />
      </div>

      {selectedProject && (
        <Dialog onClose={() => setSelectedProject(null)}>
          <div className="p-4 sm:p-8 max-w-full sm:max-w-[800px] w-full">
            <h2 className="font-['Press_Start_2P'] text-lg sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-8 shadow-[2px_2px_0_var(--text-shadow)]">
              {selectedProject.title}
            </h2>
            <div className="font-['Press_Start_2P'] text-base sm:text-xl text-[var(--color-text)] dark:text-[var(--color-text-light)] leading-relaxed">
              {selectedProject.casestudy?.content}
            </div>
          </div>
        </Dialog>
      )}
    </motion.div>
  )
}

// Main client component
export default function ProjectsClient() {
  return (
    <DynamicDashboard>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12 mt-32">
            <LoadingSpinner />
            <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
              Loading projects...
            </div>
          </div>
        }
      >
        <ProjectsContent />
      </Suspense>
    </DynamicDashboard>
  )
}
