import React from 'react'
import { CVRightSideSection } from '@/frontend/models/CV'
import { Marker } from './Marker'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Reusable component for title with marker
const TitleMarker: React.FC<{
  icon?: string
  title: string
  subtitle?: string
  startDate?: string
  endDate?: string
  isSection?: boolean
}> = ({ icon, title, subtitle, startDate, endDate, isSection = false }) => (
  <motion.div
    className="relative mb-2 md:mb-4 pl-3 md:pl-4 min-h-6 flex items-center border-l-2 md:border-l-0 border-[color:var(--color-primary)] md:border-transparent"
    variants={titleAnimationVariants}
  >
    <Marker icon={icon} variant={isSection ? 'section' : 'item'} className="hidden md:block" />
    <div className="w-2 h-2 bg-[color:var(--color-primary)] rounded-full absolute left-[-4px] top-1/2 transform -translate-y-1/2 md:hidden"></div>
    <div>
      {isSection ? (
        <h2 className="text-sm md:text-lg font-bold uppercase">{title}</h2>
      ) : (
        <>
          <h3 className="font-bold mb-1 md:mb-2 text-xs md:text-base">{title}</h3>
          {startDate && endDate && (
            <div className="text-gray-600 text-[10px] md:text-xs mb-1 md:mb-2">
              {startDate} — {endDate}
            </div>
          )}
        </>
      )}
      {subtitle && <p className="text-xs md:text-base">{subtitle}</p>}
    </div>
  </motion.div>
)

interface CVRightSectionProps {
  section: CVRightSideSection
  inView?: boolean
}

// Animation variants with more descriptive names
const sectionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.2,
      duration: 0.3,
    },
  },
}

const sectionItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
    },
  }),
}

const bulletPointVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.05,
    },
  }),
}

const titleAnimationVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

export const CVRightSection = React.memo<CVRightSectionProps>(({ section, inView = false }) => {
  return (
    <motion.div
      className="mb-4 md:mb-8 relative"
      variants={sectionContainerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      aria-label={`CV section: ${section.title}`}
    >
      <TitleMarker icon={section.icon} title={section.title} isSection={true} />

      {section.description && (
        <motion.div
          className="pl-3 md:pl-4 mb-3 md:mb-6 relative"
          variants={sectionItemVariants}
          custom={0}
        >
          <p className="text-xs md:text-base">{section.description}</p>
        </motion.div>
      )}

      <motion.div variants={sectionContainerVariants} initial={false}>
        {section.items.map((project, index) => (
          <motion.div
            key={project.id}
            className="mb-4 md:mb-8 relative"
            variants={sectionItemVariants}
            custom={index}
          >
            <TitleMarker
              icon={project.icon}
              title={project.title}
              startDate={project.startDate}
              endDate={project.endDate}
            />

            <motion.ul
              className="list-disc pl-5 md:pl-10 mt-2 mb-4 md:mb-8 ml-3 md:ml-0 border-l-2 md:border-l-0 border-[color:var(--color-primary)] md:border-transparent"
              variants={sectionContainerVariants}
              initial={false}
              aria-label={`Points about ${project.title}`}
            >
              {project.bulletPoints.map((bullet, bulletIndex) => (
                <motion.li
                  key={bullet.id}
                  className="mb-1 pb-1 md:pb-2 text-[10px] md:text-xs"
                  variants={bulletPointVariants}
                  custom={bulletIndex}
                >
                  {bullet.text}
                </motion.li>
              ))}
            </motion.ul>

            {project.action && (
              <motion.div
                className="flex flex-row justify-end"
                variants={sectionItemVariants}
                custom={project.bulletPoints.length}
              >
                <Link
                  href={project.action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] md:text-xs"
                  aria-label={`${project.action.title} for ${project.title}`}
                >
                  {project.action.title}
                </Link>
              </motion.div>
            )}

            {index < section.items.length - 1 && (
              <div className="w-full h-0.5 my-5 md:my-8 border-t-2 border-dashed border-[color:var(--color-primary)] opacity-40"></div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {section.action && (
        <motion.div variants={sectionItemVariants} custom={section.items.length}>
          <Link
            href={section.action.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-1 md:py-2 px-2 md:px-4 bg-[color:var(--color-button)] border-2 border-[#4a4a4a] text-[color:var(--color-button-text)] font-mono text-[10px] md:text-xs no-underline transition-all duration-200 mt-2 md:mt-4 ml-2 md:ml-4 min-h-6 cursor-pointer hover:bg-[#4a4a4a] hover:border-[color:var(--color-hover)] hover:translate-y-[-2px]"
            aria-label={section.action.title}
          >
            {section.action.title}
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
})

CVRightSection.displayName = 'CVRightSection'
