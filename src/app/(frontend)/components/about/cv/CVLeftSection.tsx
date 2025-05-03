import React from 'react'
import { CVLeftSideSection } from '@/frontend/models/CV'
import { motion } from 'framer-motion'

interface CVLeftSectionProps {
  section: CVLeftSideSection
  inView?: boolean
}

export const CVLeftSection = React.memo<CVLeftSectionProps>(({ section, inView = false }) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  const progressVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.5, delay: 0.2 },
    },
  }

  return (
    <motion.div
      className="mb-4 md:mb-8 relative max-w-[300px] md:max-w-full mx-auto"
      variants={itemVariants}
    >
      <h2 className="text-xs md:text-md font-bold uppercase text-center relative my-2 md:my-4 before:content-['—'] before:mx-1 md:before:mx-2 after:content-['—'] after:mx-1 md:after:mx-2">
        {section.title}
      </h2>
      <ul className="list-none p-0 text-center">
        {section.items.map((item) => (
          <motion.li key={item.id} className="mb-1 md:mb-2" variants={itemVariants}>
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b58900] no-underline hover:underline text-[10px] md:text-xs"
              >
                {item.text}
              </a>
            ) : (
              <span className="text-[10px] md:text-xs">{item.text}</span>
            )}
            {item.progress !== undefined && (
              <motion.div className="w-full h-1 bg-[#ffe580] rounded-sm mt-1">
                <motion.div
                  className="h-full bg-[#b58900] rounded-sm transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                  variants={progressVariants}
                />
              </motion.div>
            )}

            {item.text === '' && (
              <div className="w-full h-0.5 my-2 md:my-4 rounded-sm border-2 border-dotted border-[#b58900]" />
            )}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
})

CVLeftSection.displayName = 'CVLeftSection'
