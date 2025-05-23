'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { routes } from '@/frontend/constants/routes'
import CloudBackground from '@/frontend/components/landing/CloudBackground'
import BackgroundFloatingElements from '@/frontend/components/landing/BackgroundFloatingElements'
import ArrowRightIcon from '@heroicons/react/16/solid/ArrowRightIcon'
import ArrowDownIcon from '@heroicons/react/16/solid/ArrowDownIcon'
import { NavigationLink } from '@/frontend/components/ui/Links'
import { HeroSectionProps } from './types'

export const HeroSection: React.FC<HeroSectionProps> = ({
  sectionRef,
  prefersReducedMotion,
  onScrollToNext,
  isMobileView,
}) => {
  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen w-full flex flex-col justify-center items-center landing-gradient relative overflow-hidden section-snap-align"
      style={{
        perspective: '1000px',
        height: isMobileView ? 'auto' : '100vh',
        minHeight: '100vh',
        width: '100%',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {!isMobileView && (
        <>
          <CloudBackground />
          <BackgroundFloatingElements />
        </>
      )}
      {isMobileView && (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200 to-blue-300 opacity-50"></div>
      )}

      <motion.div
        className="relative flex flex-col items-center justify-center gap-8 z-30 p-8 mt-[5vh] md:mt-0"
        style={{ willChange: 'transform' }}
      >
        <motion.div
          className="flex flex-col items-center gap-4 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: prefersReducedMotion ? 0 : [0, -5, 5, 0] }}
            animate={
              prefersReducedMotion || isMobileView
                ? {}
                : {
                    y: [0, -12, 0],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    },
                  }
            }
            transition={{ duration: 0.5 }}
            className="rounded-full overflow-hidden shadow-lg w-48 h-48 md:w-64 md:h-64"
          >
            <Image
              src="/me-pixel-art.png"
              alt="Nelson Lai - Full-Stack Developer"
              width={isMobileView ? 192 : 256}
              height={isMobileView ? 192 : 256}
              className="image-pixelated cursor-pointer w-full h-full rounded-full"
              priority
            />
          </motion.div>
          <motion.h1
            className="font-pixel text-3xl sm:text-4xl md:text-5xl text-gray-800"
            style={{ textShadow: '4px 4px 0px var(--shadow)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            LST97.DEV
          </motion.h1>
          <motion.p
            className="font-pixel text-sm sm:text-base text-gray-800 max-w-md px-4 sm:px-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Welcome to my digital playground! Full-Stack Developer specializing in React, Next.js,
            and modern web development.
          </motion.p>
        </motion.div>
        <motion.div
          className="mt-6 md:mt-8 space-y-6 flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavigationLink
              href={routes.welcome}
              className="btn btn-primary font-pixel text-lg sm:text-xl py-3 px-6 md:py-4 md:px-8 no-underline hover:scale-105 relative
                before:content-[''] before:absolute before:top-[-4px] before:left-[-4px] before:right-[-4px] before:bottom-[-4px]
                before:border-2 before:border-gray-700 before:transition-all before:duration-200
                hover:before:top-[-6px] hover:before:left-[-6px] hover:before:right-[-6px] hover:before:bottom-[-6px]"
              aria-label="Start exploring the website"
            >
              EXPLORE <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </NavigationLink>
          </motion.div>

          <motion.button
            onClick={onScrollToNext}
            className="font-pixel text-gray-700 flex flex-col items-center mt-8 md:mt-12 animate-bounce"
            whileHover={{ scale: 1.1 }}
          >
            <span className="mb-1 sm:mb-2 text-sm sm:text-base">Explore Features</span>
            <ArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
