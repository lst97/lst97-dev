import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/frontend/components/ui/Buttons'
import { Tags } from '@/frontend/components/ui/Tags'
import { NavigationLink } from '@/frontend/components/ui/Links'
import { FaBookOpen, FaExternalLinkAlt, FaGithub } from 'react-icons/fa'

export interface Project {
  id: number
  title: string
  description: string
  category:
    | 'featured'
    | 'current'
    | 'on-hold'
    | 'deprecated'
    | 'open-source'
    | 'learning'
    | 'case-study'
  imageUrl: string
  demoUrl?: string
  repoUrl?: string
  technologies: string[]
  testimonial?: {
    quote: string
    author: string
  }
  casestudy?: {
    content: string
  }
}

interface ProjectCardProps {
  project: Project
  onOpenCaseStudy?: (project: Project) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenCaseStudy }) => {
  return (
    <motion.div
      className="relative bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] overflow-hidden transition-all duration-300 image-pixelated"
      style={{
        boxShadow: '8px 8px 0 var(--shadow)',
      }}
      whileHover={{
        scale: 1.02,
        x: -2,
        y: -2,
        transition: { duration: 0.2 },
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(
            45deg,
            var(--color-card) 25%,
            var(--color-card-accent, rgba(255, 255, 255, 0.2)) 25%,
            var(--color-card-accent, rgba(255, 255, 255, 0.2)) 50%,
            var(--color-card) 50%,
            var(--color-card) 75%,
            var(--color-card-accent, rgba(255, 255, 255, 0.2)) 75%,
            var(--color-card-accent, rgba(255, 255, 255, 0.2)) 100%
          )`,
          backgroundSize: '10px 10px',
        }}
      />

      <div className="relative w-full h-[200px] border-b-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        />
        {/* Scanline overlay effect for retro CRT look */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background:
              'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)',
            backgroundSize: '100% 4px',
          }}
        />
      </div>

      <div className="relative p-6 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] z-10">
        <h3 className="font-['Press_Start_2P'] text-[1.6rem] text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4">
          {project.title}
        </h3>
        <p className="font-['Press_Start_2P'] text-[1rem] text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-6 leading-relaxed">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-3 mb-6">
          <Tags tags={project.technologies} />
        </div>
        <div className="flex flex-wrap justify-between gap-4">
          {project.demoUrl && (
            <Button asChild variant="pixel">
              <NavigationLink href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center">
                  <FaExternalLinkAlt className="mr-2" /> <div>Demo</div>
                </div>
              </NavigationLink>
            </Button>
          )}
          {project.repoUrl && (
            <Button asChild variant="pixel">
              <NavigationLink href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center">
                  <FaGithub className="mr-2" /> <div>Code</div>
                </div>
              </NavigationLink>
            </Button>
          )}
          {project.category === 'case-study' && onOpenCaseStudy && (
            <Button asChild variant="pixel">
              <button onClick={() => onOpenCaseStudy(project)}>
                <div className="flex items-center">
                  <FaBookOpen className="mr-2" /> <div>Case Study</div>
                </div>
              </button>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export { ProjectsGrid } from './ProjectsGrid'
