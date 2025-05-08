import React from 'react'
import { ProjectsGrid } from './ProjectsGrid'
import { Project } from './ProjectCard'
import { FaStar, FaCode, FaPause, FaArchive, FaGithub, FaFlask, FaBookOpen } from 'react-icons/fa'
import PixelTabPanel from '@/frontend/components/ui/Tabs'
import Image from 'next/image'
export interface ProjectExplorerProps {
  projects: Project[]
  onOpenCaseStudy: (project: Project) => void
}

// Styled description box component with pixel art styling
const DescriptionBox = ({ children }: { children: React.ReactNode }) => (
  <div
    className="
    font-['Press_Start_2P'] 
    text-base 
    text-text dark:text-[var(--color-text-light)] 
    mb-12 leading-relaxed 
    p-8 
    bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] 
    border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] 
    shadow-[8px_8px_0_var(--shadow)] 
    relative
    overflow-hidden
  "
  >
    <div className="relative z-10">{children}</div>
  </div>
)

// Empty state with pixel art styling
const EmptyState = () => (
  <div className="relative p-16 text-center border-4 border-dashed border-[var(--color-border)] dark:border-[var(--color-border-dark)] my-12">
    <p className="font-['Press_Start_2P'] text-2xl text-text dark:text-[var(--color-text-light)] mb-8 leading-relaxed w-full text-center">
      404 - Nothing to show here yet.
    </p>
    <div className="w-24 h-24 mx-auto mb-8">
      <Image
        src="/pixel-error.svg"
        alt="Pixel art character"
        className="w-full h-full image-pixelated"
        width={96}
        height={96}
        onError={(e) => {
          e.currentTarget.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E"
          e.currentTarget.style.filter = 'brightness(0.8) sepia(1) hue-rotate(0deg) saturate(5)'
        }}
      />
    </div>
    <p className="font-['Press_Start_2P'] text-sm text-text dark:text-[var(--color-text-light)]">
      Stay tuned for updates!
    </p>
  </div>
)

const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ projects, onOpenCaseStudy }) => {
  const tabs = [
    {
      id: 'all',
      label: 'All',
      content: (
        <>
          <DescriptionBox>
            <p>
              Explore my diverse range of projects, from cutting-edge apps to valuable learning
              experiences. Each project reflects my passion for innovation and commitment to
              excellence.
            </p>
          </DescriptionBox>
          {projects.length > 0 ? (
            <ProjectsGrid projects={projects} onOpenCaseStudy={onOpenCaseStudy} />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.length,
    },
    {
      id: 'featured',
      label: 'Featured',
      icon: <FaStar />,
      content: (
        <>
          <DescriptionBox>
            <p>
              Check out my most outstanding projects, showcasing top-tier development and design.
              These are significant achievements I&apos;m particularly proud of.
            </p>
          </DescriptionBox>
          {projects.filter((p) => p.category === 'featured').length > 0 ? (
            <ProjectsGrid
              projects={projects.filter((p) => p.category === 'featured')}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.filter((p) => p.category === 'featured').length,
    },
    {
      id: 'current',
      label: 'Current',
      icon: <FaCode />,
      content: (
        <>
          <DescriptionBox>
            <p>
              Here&apos;s what I&apos;m currently working on. These projects are actively under
              development, and I&apos;m excited to share their progress.
            </p>
          </DescriptionBox>
          {projects.filter((p) => p.category === 'current').length > 0 ? (
            <ProjectsGrid
              projects={projects.filter((p) => p.category === 'current')}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.filter((p) => p.category === 'current').length,
    },
    {
      id: 'on-hold',
      label: 'On-Hold',
      icon: <FaPause />,
      content: (
        <>
          <DescriptionBox>
            <p>
              These projects are currently on pause but represent valuable ideas I hope to revisit
              in the future.
            </p>
          </DescriptionBox>
          {projects.filter((p) => p.category === 'on-hold').length > 0 ? (
            <ProjectsGrid
              projects={projects.filter((p) => p.category === 'on-hold')}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.filter((p) => p.category === 'on-hold').length,
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      icon: <FaArchive />,
      content: (
        <>
          <DescriptionBox>
            <p>
              These projects are no longer actively maintained but were significant learning
              experiences that contributed to my growth.
            </p>
          </DescriptionBox>
          {projects.filter((p) => p.category === 'deprecated').length > 0 ? (
            <ProjectsGrid
              projects={projects.filter((p) => p.category === 'deprecated')}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.filter((p) => p.category === 'deprecated').length,
    },
    {
      id: 'open-source',
      label: 'Open-Source',
      icon: <FaGithub />,
      content: (
        <>
          <DescriptionBox>
            <p>
              I&apos;m passionate about open-source! These projects are publicly available for
              collaboration and contribution.
            </p>
          </DescriptionBox>
          {projects.filter((p) => p.category === 'open-source').length > 0 ? (
            <ProjectsGrid
              projects={projects.filter((p) => p.category === 'open-source')}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.filter((p) => p.category === 'open-source').length,
    },
    {
      id: 'learning',
      label: 'Learning',
      icon: <FaFlask />,
      content: (
        <>
          <DescriptionBox>
            <p>
              Every project is a learning opportunity. These are focused on experimentation and
              skill development.
            </p>
          </DescriptionBox>
          {projects.filter((p) => p.category === 'learning').length > 0 ? (
            <ProjectsGrid
              projects={projects.filter((p) => p.category === 'learning')}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.filter((p) => p.category === 'learning').length,
    },
    {
      id: 'case-study',
      label: 'Case Study',
      icon: <FaBookOpen />,
      content: (
        <>
          <DescriptionBox>
            <p>Dive deeper into the development process with these in-depth case studies.</p>
          </DescriptionBox>
          {projects.filter((p) => p.category === 'case-study').length > 0 ? (
            <ProjectsGrid
              projects={projects.filter((p) => p.category === 'case-study')}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ),
      count: projects.filter((p) => p.category === 'case-study').length,
    },
  ]
  return (
    <div className="relative border-8 border-double border-border dark:border-border-dark shadow-[8px_8px_0_var(--shadow)] mb-24">
      <PixelTabPanel tabs={tabs} defaultTab="all" />
    </div>
  )
}

export default ProjectExplorer
