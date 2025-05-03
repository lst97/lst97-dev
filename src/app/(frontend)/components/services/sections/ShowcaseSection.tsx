'use client'

import React from 'react'
import { ProjectData } from '../types'
import { ProjectShowcaseCard } from '@/app/(frontend)/components/services/ProjectShowcaseCard'

/**
 * Props for the ShowcaseSection component.
 */
interface ShowcaseSectionProps {
  /** An array of project data objects to display. */
  projectsData: ProjectData[]
  /** Function to set the state of the project showcase dialog visibility. */
  setIsProjectShowcaseOpen: (isOpen: boolean) => void
  /** Function to set the currently selected project data. */
  setSelectedProject: (project: ProjectData | null) => void
}

/**
 * Section component displaying the project showcase cards.
 * @param {ShowcaseSectionProps} props - The props for the component.
 */
const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
  projectsData,
  setIsProjectShowcaseOpen,
  setSelectedProject,
}: ShowcaseSectionProps) => (
  <section className="mb-16">
    <h2 className="leading-16 font-pixel text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
      Project Showcase
    </h2>
    <div className="flex flex-col gap-12 justify-center items-center mt-12">
      {projectsData.map((project: ProjectData) => (
        <ProjectShowcaseCard
          key={project.id}
          title={project.title}
          description={project.description}
          image={project.image}
          onExplore={() => {
            setIsProjectShowcaseOpen(true)
            setSelectedProject(project)
          }}
        />
      ))}
    </div>
  </section>
)

export default ShowcaseSection
