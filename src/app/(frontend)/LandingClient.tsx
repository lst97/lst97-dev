'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { routes } from '@/frontend/constants/routes'
import CloudBackground from '@/frontend/components/landing/CloudBackground'
import BackgroundFloatingElements from '@/frontend/components/landing/BackgroundFloatingElements'
import ArrowRightIcon from '@heroicons/react/16/solid/ArrowRightIcon'
import SchemaOrg from './components/common/SchemaOrg'
import { NavigationLink } from '@/frontend/components/ui/Links'

export default function LandingClient() {
  const { scrollYProgress } = useScroll()
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const prefersReducedMotion = useReducedMotion()

  return (
    <>
      {/* Add Person structured data for better representation in search results */}
      <SchemaOrg
        type="Person"
        title="Nelson Lai - Full-Stack Developer & Software Engineer"
        description="Personal website of Nelson Lai (LST97) - Full-Stack Developer specializing in React, Next.js, and modern web development."
      />

      <motion.div
        className="min-h-screen w-full flex flex-col justify-center items-center landing-gradient relative overflow-hidden"
        style={{ perspective: '1000px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <CloudBackground />
        <BackgroundFloatingElements />

        <motion.div
          className="relative flex flex-col items-center justify-center gap-8 z-30 p-8 mt-[5vh]"
          style={{ y: prefersReducedMotion ? 0 : titleY, willChange: 'transform' }}
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
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, -12, 0],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'reverse' as const,
                        ease: 'easeInOut',
                      },
                    }
              }
              transition={{ duration: 0.5 }}
              className="rounded-full overflow-hidden shadow-lg"
            >
              <Image
                src="/me-pixel-art.png"
                alt="Nelson Lai - Full-Stack Developer"
                width={256}
                height={256}
                className="image-pixelated cursor-pointer w-64 h-64 rounded-full"
                priority
              />
            </motion.div>
            <motion.h1
              className="font-pixel text-4xl md:text-5xl text-gray-800"
              style={{ textShadow: '4px 4px 0px var(--shadow)' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              LST97.DEV
            </motion.h1>
            <motion.p
              className="font-pixel text-base text-gray-800"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Welcome to my digital playground!
            </motion.p>
          </motion.div>
          <motion.div
            className="mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavigationLink
                href={routes.welcome}
                className="btn btn-primary font-pixel text-xl py-4 px-8 no-underline hover:scale-105 relative 
                  before:content-[''] before:absolute before:top-[-4px] before:left-[-4px] before:right-[-4px] before:bottom-[-4px] 
                  before:border-2 before:border-gray-700 before:transition-all before:duration-200 
                  hover:before:top-[-6px] hover:before:left-[-6px] hover:before:right-[-6px] hover:before:bottom-[-6px]"
                aria-label="Start exploring the website"
              >
                START GAME <ArrowRightIcon className="w-6 h-6" />
              </NavigationLink>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* <div className={styles.gameWrapper}>
				<ChromeDinoGame />
			</div> */}
    </>
  )
}
