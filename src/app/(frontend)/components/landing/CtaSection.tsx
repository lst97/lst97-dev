'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { routes } from '@/frontend/constants/routes'
import { NavigationLink } from '@/frontend/components/ui/Links'
import { CtaSectionProps } from './types'

export const CtaSection: React.FC<CtaSectionProps> = ({ sectionRef, isInView, isMobileView }) => {
  const commonAnimate = isInView || isMobileView ? { opacity: 1 } : {}
  const textAnimate = isInView || isMobileView ? { x: 0, opacity: 1 } : {}
  const imageAnimate = isInView || isMobileView ? { x: 0, opacity: 1 } : {}

  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen w-full py-12 sm:py-20 landing-gradient relative overflow-hidden flex items-center section-snap-align"
      style={{
        height: isMobileView ? 'auto' : '100vh',
        minHeight: isMobileView ? '80vh' : '100vh',
        width: '100%',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10"
          initial={{ opacity: 0 }}
          animate={commonAnimate}
          transition={{ duration: 1 }}
        >
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={textAnimate}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h2
                className="font-pixel text-2xl sm:text-3xl md:text-4xl text-gray-800 mb-4 sm:mb-6"
                style={{ textShadow: '3px 3px 0px var(--shadow)' }}
              >
                LEVEL UP YOUR PROJECTS
              </h2>
              <p className="font-pixel text-xs sm:text-sm md:text-base text-gray-700 mb-6 sm:mb-8 max-w-md mx-auto md:mx-0">
                From professional web development services to helpful tools and resources, explore
                everything this digital playground has to offer.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
                <NavigationLink
                  href={routes.about}
                  className="btn btn-secondary font-pixel py-2.5 px-5 sm:py-3 sm:px-6 no-underline relative
                    before:content-[''] before:absolute before:top-[-3px] before:left-[-3px] before:right-[-3px] before:bottom-[-3px]
                    before:border-2 before:border-gray-700 before:transition-all before:duration-200
                    hover:before:top-[-5px] hover:before:left-[-5px] hover:before:right-[-5px] hover:before:bottom-[-5px] text-xs sm:text-sm"
                >
                  ABOUT ME
                </NavigationLink>
                <NavigationLink
                  href={routes.services}
                  className="btn btn-primary font-pixel py-2.5 px-5 sm:py-3 sm:px-6 no-underline relative
                    before:content-[''] before:absolute before:top-[-3px] before:left-[-3px] before:right-[-3px] before:bottom-[-3px]
                    before:border-2 before:border-gray-700 before:transition-all before:duration-200
                    hover:before:top-[-5px] hover:before:left-[-5px] hover:before:right-[-5px] hover:before:bottom-[-5px] text-xs sm:text-sm"
                >
                  SERVICES
                </NavigationLink>
              </div>
            </motion.div>
          </div>
          <motion.div
            className="flex-1 flex justify-center mt-8 md:mt-0"
            style={{ perspective: 800 }}
            initial={{ x: 50, opacity: 0 }}
            animate={{
              ...imageAnimate,
              rotateX: isInView || isMobileView ? 0 : 90,
            }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.div
              initial={{ rotateX: 90, opacity: 0 }}
              animate={
                isInView || isMobileView
                  ? {
                      rotateX: 0,
                      opacity: 1,
                      y: [0, -8, -12, -8, 0, 8, 12, 8, 0],
                    }
                  : {
                      rotateX: 90,
                      opacity: 0,
                      y: 0,
                    }
              }
              transition={
                isInView || isMobileView
                  ? {
                      rotateX: { duration: 0.7, delay: 0.4 },
                      opacity: { duration: 0.7, delay: 0.4 },
                      y: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'loop',
                        ease: 'easeInOut',
                        delay: 1.1, // start floating after fold-in
                      },
                    }
                  : {
                      rotateX: { duration: 0.7, delay: 0.4 },
                      opacity: { duration: 0.7, delay: 0.4 },
                      y: { duration: 0 },
                    }
              }
              style={{ width: '100%' }}
            >
              <Image
                src="/lv-up-pixel-art.png"
                alt="Pixel art preview"
                width={isMobileView ? 300 : 400}
                height={isMobileView ? 225 : 400}
                className="image-pixelated w-full h-auto"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
