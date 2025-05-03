import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface SoftSkill {
  id: string
  name: string
  level: number
  description: string
}

interface PersonalAttributesProps {
  softSkills: SoftSkill[]
}

const PersonalAttributes: React.FC<PersonalAttributesProps> = ({ softSkills }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-100px' })

  const containerVariants = {
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

  const skillVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  const dotVariants = {
    hidden: { scale: 0 },
    visible: (i: number) => ({
      scale: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 500,
        damping: 25,
      },
    }),
  }

  return (
    <motion.div
      ref={ref}
      className="relative bg-card dark:bg-card-dark border-4 border-border dark:border-border-dark p-8 my-4 shadow-[8px_8px_0] shadow-border dark:shadow-border-dark [image-rendering:pixelated] before:content-[''] before:absolute before:inset-[-4px] before:border-2 before:border-border dark:before:border-border-dark before:pointer-events-none cross-grid-pattern"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      <motion.div
        className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-border dark:border-border-dark"
        variants={skillVariants}
      >
        <h3 className="text-xl font-bold uppercase font-['Press_Start_2P'] text-text dark:text-text-light">
          Personal Attributes
        </h3>
      </motion.div>
      <motion.div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
        {softSkills.map((skill) => (
          <motion.div
            key={skill.id}
            className="bg-[rgba(44,44,44,0.05)] dark:bg-[rgba(255,255,255,0.05)] p-4 border-2 border-border dark:border-border-dark"
            data-level={skill.level}
            variants={skillVariants}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-['Press_Start_2P'] font-bold text-text dark:text-text-light">
                {skill.name}
              </h4>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    className={`w-3 h-3 border-2 border-border dark:border-border-dark rounded-full ${
                      i < skill.level ? 'bg-primary dark:bg-primary-dark' : ''
                    }`}
                    variants={dotVariants}
                    custom={i}
                  />
                ))}
              </div>
            </div>
            <p className="font-['Press_Start_2P'] text-xs text-text dark:text-text-light leading-relaxed">
              {skill.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default PersonalAttributes
