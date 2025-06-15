'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ArrowDownIcon from '@heroicons/react/16/solid/ArrowDownIcon'
import { TechStackSectionProps } from './types'
import {
  techStackLanguages,
  frontendTechIcons,
  backendTechIcons,
  databaseTechIcons,
  cloudTechIcons,
  mobileTechIcons,
  toolsTechIcons,
} from '@/frontend/constants/data/tech-icons'

const techIconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.05 * i,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
}

export const TechStackSection: React.FC<TechStackSectionProps> = ({
  sectionRef,
  isInView,
  onScrollToNext,
  isMobileView,
}) => {
  const commonAnimate = isInView || isMobileView ? 'visible' : 'hidden'
  const titleAnimate = isInView || isMobileView ? { opacity: 1, y: 0 } : {}
  const subTitleAnimate = (delay = 0) =>
    isInView || isMobileView
      ? { opacity: 1, x: 0, transition: { duration: 0.5, delay } }
      : { opacity: 0 }

  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen w-full py-8 sm:py-20 bg-[var(--color-background)] relative z-10 section-snap-align"
      style={{
        height: isMobileView ? 'auto' : '100vh',
        width: '100%',
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={titleAnimate}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="font-pixel text-xl sm:text-3xl md:text-4xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-2 sm:mb-4"
            style={{ textShadow: '3px 3px 0px var(--shadow)' }}
          >
            TECH STACK & EXPERTISE
          </h2>
          <div className="font-pixel text-xs sm:text-sm md:text-base text-[var(--color-text)] dark:text-[var(--color-text-light)] max-w-3xl mx-auto">
            <p className="mb-2">Full-stack developer with over 1,000 hours in TypeScript</p>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6  gap-y-4 sm:gap-3 text-center mt-3 sm:mt-4  mx-auto">
              {techStackLanguages.map((lang, index) => (
                <motion.div
                  key={lang.name}
                  custom={index}
                  variants={techIconVariants}
                  initial="hidden"
                  animate={commonAnimate}
                  className="text-center group"
                >
                  <div
                    className={`
                      font-pixel text-2xs xs:text-xs sm:text-xs min-w-28
                      p-2 xs:p-2.5
                      bg-[var(--color-card)]
                      border-2 border-[var(--color-border)]
                      shadow-[3px_3px_0px_var(--shadow)] dark:shadow-[3px_3px_0px_var(--shadow-dark)]
                      group-hover:shadow-[1px_1px_0px_var(--shadow)] dark:group-hover:shadow-[1px_1px_0px_var(--shadow-dark)]
                      group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                      transition-all duration-150
                    `}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <div
                      className={`py-0.5 px-1 ${lang.color} ${lang.textColor} font-bold truncate mb-0.5 text-2xs xs:text-xs`}
                    >
                      {lang.hours}
                    </div>
                    <div className="truncate text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                      {lang.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Frontend Development Section */}
        <div className="mb-12 sm:mb-16">
          <motion.h3
            className="font-pixel text-lg sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-6 relative inline-block"
            initial={{ opacity: 0, x: -20 }}
            animate={subTitleAnimate()}
          >
            <span className="relative inline-block after:block after:h-[2px] sm:after:h-[3px] after:w-full after:bg-[var(--color-accent)] after:mt-1 sm:after:mt-1.5">
              Frontend Development
            </span>
          </motion.h3>
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:flex sm:flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-6">
            {frontendTechIcons.map((tech, index) => (
              <motion.div
                key={tech.name}
                custom={index}
                variants={techIconVariants}
                initial="hidden"
                animate={commonAnimate}
                className="flex flex-col items-center group"
              >
                <div
                  className={`
                    w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 p-2.5 xs:p-3
                    bg-[var(--color-card)]
                    border-2 sm:border-[3px] border-[var(--color-border)]
                    shadow-[4px_4px_0px_var(--shadow)] dark:shadow-[4px_4px_0px_var(--shadow-dark)]
                    group-hover:shadow-[2px_2px_0px_var(--shadow)] dark:group-hover:shadow-[2px_2px_0px_var(--shadow-dark)]
                    group-hover:translate-x-[2px] group-hover:translate-y-[2px]
                    transition-all duration-200
                    flex items-center justify-center
                  `}
                  style={{ imageRendering: 'pixelated' }}
                >
                  <Image
                    src={tech.src}
                    alt={tech.alt}
                    width={isMobileView ? 32 : 48}
                    height={isMobileView ? 32 : 48}
                    className="image-pixelated object-contain"
                  />
                </div>
                <span className="mt-2 font-pixel text-xs xs:text-sm sm:text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Backend Development Section */}
        <div className="mb-12 sm:mb-16">
          <motion.h3
            className="font-pixel text-lg sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-6 relative inline-block"
            initial={{ opacity: 0, x: 20 }}
            animate={subTitleAnimate(0.1)}
          >
            <span className="relative inline-block after:block after:h-[2px] sm:after:h-[3px] after:w-full after:bg-[var(--color-accent)] after:mt-1 sm:after:mt-1.5">
              Backend Development & Runtimes
            </span>
          </motion.h3>
          <div className="grid grid-cols-2 xs:grid-cols-4 sm:flex sm:flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-6">
            {backendTechIcons.map((tech, index) => (
              <motion.div
                key={tech.name}
                custom={index}
                variants={techIconVariants}
                initial="hidden"
                animate={commonAnimate}
                className="flex flex-col items-center group"
              >
                <div
                  className={`
                    w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 p-2.5 xs:p-3
                    bg-[var(--color-card)]
                    border-2 sm:border-[3px] border-[var(--color-border)]
                    shadow-[4px_4px_0px_var(--shadow)] dark:shadow-[4px_4px_0px_var(--shadow-dark)]
                    group-hover:shadow-[2px_2px_0px_var(--shadow)] dark:group-hover:shadow-[2px_2px_0px_var(--shadow-dark)]
                    group-hover:translate-x-[2px] group-hover:translate-y-[2px]
                    transition-all duration-200
                    flex items-center justify-center
                  `}
                  style={{ imageRendering: 'pixelated' }}
                >
                  <Image
                    src={tech.src}
                    alt={tech.alt}
                    width={isMobileView ? 32 : 48}
                    height={isMobileView ? 32 : 48}
                    className="image-pixelated object-contain"
                  />
                </div>
                <span className="mt-2 font-pixel text-xs xs:text-sm sm:text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Databases and Cloud Infrastructure in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 mb-12 sm:mb-16">
          {/* Databases Section */}
          <div>
            <motion.h3
              className="font-pixel text-base sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-6 relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={subTitleAnimate(0.2)}
            >
              <span className="relative inline-block after:block after:h-[2px] sm:after:h-[3px] after:w-full after:bg-[var(--color-accent)] after:mt-1 sm:after:mt-1.5">
                Databases
              </span>
            </motion.h3>
            <div className="grid grid-cols-3 xs:grid-cols-4 gap-x-4 gap-y-6 sm:flex sm:flex-wrap justify-center sm:gap-4 pt-4">
              {databaseTechIcons.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  custom={index}
                  variants={techIconVariants}
                  initial="hidden"
                  animate={commonAnimate}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`
                      w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 p-2 xs:p-2.5 sm:p-2
                      bg-[var(--color-card)]
                      border-2 sm:border-[3px] border-[var(--color-border)]
                      shadow-[3px_3px_0px_var(--shadow)] dark:shadow-[3px_3px_0px_var(--shadow-dark)]
                      group-hover:shadow-[1px_1px_0px_var(--shadow)] dark:group-hover:shadow-[1px_1px_0px_var(--shadow-dark)]
                      group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                      transition-all duration-200
                      flex items-center justify-center
                    `}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <Image
                      src={tech.src}
                      alt={tech.alt}
                      width={isMobileView ? 24 : 36}
                      height={isMobileView ? 24 : 36}
                      className="image-pixelated object-contain"
                    />
                  </div>
                  <span className="mt-2 font-pixel text-xs xs:text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cloud & Infrastructure Section */}
          <div>
            <motion.h3
              className="font-pixel text-base sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-6 relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={subTitleAnimate(0.3)}
            >
              <span className="relative inline-block after:block after:h-[2px] sm:after:h-[3px] after:w-full after:bg-[var(--color-accent)] after:mt-1 sm:after:mt-1.5">
                Cloud & Infrastructure
              </span>
            </motion.h3>
            <div className="grid grid-cols-3 xs:grid-cols-4 gap-x-4 gap-y-6 sm:flex sm:flex-wrap justify-center sm:gap-4 pt-4">
              {cloudTechIcons.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  custom={index}
                  variants={techIconVariants}
                  initial="hidden"
                  animate={commonAnimate}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`
                      w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 p-2 xs:p-2.5 sm:p-2
                      bg-[var(--color-card)]
                      border-2 sm:border-[3px] border-[var(--color-border)]
                      shadow-[3px_3px_0px_var(--shadow)] dark:shadow-[3px_3px_0px_var(--shadow-dark)]
                      group-hover:shadow-[1px_1px_0px_var(--shadow)] dark:group-hover:shadow-[1px_1px_0px_var(--shadow-dark)]
                      group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                      transition-all duration-200
                      flex items-center justify-center
                    `}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <Image
                      src={tech.src}
                      alt={tech.alt}
                      width={isMobileView ? 24 : 36}
                      height={isMobileView ? 24 : 36}
                      className="image-pixelated object-contain"
                    />
                  </div>
                  <span className="mt-2 font-pixel text-xs xs:text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Development and Tools in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12">
          {/* Mobile Development Section */}
          <div>
            <motion.h3
              className="font-pixel text-base sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-6 relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={subTitleAnimate(0.4)}
            >
              <span className="relative inline-block after:block after:h-[2px] sm:after:h-[3px] after:w-full after:bg-[var(--color-accent)] after:mt-1 sm:after:mt-1.5">
                Mobile Development
              </span>
            </motion.h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-x-4 gap-y-6 sm:flex sm:flex-wrap justify-center sm:gap-4 pt-4">
              {mobileTechIcons.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  custom={index}
                  variants={techIconVariants}
                  initial="hidden"
                  animate={commonAnimate}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`
                      w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 p-2 xs:p-2.5 sm:p-2
                      bg-[var(--color-card)]
                      border-2 sm:border-[3px] border-[var(--color-border)]
                      shadow-[3px_3px_0px_var(--shadow)] dark:shadow-[3px_3px_0px_var(--shadow-dark)]
                      group-hover:shadow-[1px_1px_0px_var(--shadow)] dark:group-hover:shadow-[1px_1px_0px_var(--shadow-dark)]
                      group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                      transition-all duration-200
                      flex items-center justify-center
                    `}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <Image
                      src={tech.src}
                      alt={tech.alt}
                      width={isMobileView ? 24 : 36}
                      height={isMobileView ? 24 : 36}
                      className="image-pixelated object-contain"
                    />
                  </div>
                  <span className="mt-2 font-pixel text-xs xs:text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tools & Collaboration Section */}
          <div>
            <motion.h3
              className="font-pixel text-base sm:text-2xl text-[var(--color-text)] dark:text-[var(--color-text-light)] mb-4 sm:mb-6 relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={subTitleAnimate(0.5)}
            >
              <span className="relative inline-block after:block after:h-[2px] sm:after:h-[3px] after:w-full after:bg-[var(--color-accent)] after:mt-1 sm:after:mt-1.5">
                Tools & Collaboration
              </span>
            </motion.h3>
            <div className="grid grid-cols-3 xs:grid-cols-4 gap-x-4 gap-y-6 sm:flex sm:flex-wrap justify-center sm:gap-4 pt-4">
              {toolsTechIcons.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  custom={index}
                  variants={techIconVariants}
                  initial="hidden"
                  animate={commonAnimate}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`
                      w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 p-2 xs:p-2.5 sm:p-2
                      bg-[var(--color-card)]
                      border-2 sm:border-[3px] border-[var(--color-border)]
                      shadow-[3px_3px_0px_var(--shadow)] dark:shadow-[3px_3px_0px_var(--shadow-dark)]
                      group-hover:shadow-[1px_1px_0px_var(--shadow)] dark:group-hover:shadow-[1px_1px_0px_var(--shadow-dark)]
                      group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                      transition-all duration-200
                      flex items-center justify-center
                    `}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <Image
                      src={tech.src}
                      alt={tech.alt}
                      width={isMobileView ? 24 : 36}
                      height={isMobileView ? 24 : 36}
                      className="image-pixelated object-contain"
                    />
                  </div>
                  <span className="mt-2 font-pixel text-xs xs:text-sm text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {!isMobileView && (
          <motion.button
            onClick={onScrollToNext}
            className="font-pixel text-[var(--color-text)] dark:text-[var(--color-text-light)] flex flex-col items-center mt-12 sm:mt-20 mx-auto animate-bounce"
            whileHover={{ scale: 1.1 }}
          >
            <span className="mb-1 sm:mb-2 text-sm sm:text-base">Learn More</span>
            <ArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </div>
    </motion.section>
  )
}
