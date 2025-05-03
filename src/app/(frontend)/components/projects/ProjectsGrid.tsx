import React from 'react'
import { Project, ProjectCard } from './ProjectCard'
import { motion } from 'framer-motion'

interface ProjectsGridProps {
  projects: Project[]
  onOpenCaseStudy?: (project: Project) => void
}

// Staggered animation for grid items
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects, onOpenCaseStudy }) => {
  return (
    <motion.div className="relative" variants={container} initial="hidden" animate="show">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12  relative z-10">
        {projects.map((project) => (
          <motion.div key={project.id} variants={item}>
            <ProjectCard project={project} onOpenCaseStudy={onOpenCaseStudy} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
