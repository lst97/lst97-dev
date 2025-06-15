'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import TypewriterText from './TypewriterText'

export interface TestimonialProps {
  quote: string
  author: string
  role: string
  avatar: string
  isTyped: boolean
  inView: boolean
  delay: number
  onTypingComplete?: () => void
}

const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  role,
  avatar,
  isTyped,
  inView,
  delay,
  onTypingComplete,
}) => {
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
        delay: delay * 0.0005,
      },
    },
  }

  const authorVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
        delay: 0.5,
      },
    },
  }

  return (
    <motion.div
      className="bg-gray-800 border-2 border-amber-500 rounded-tr-lg rounded-bl-lg rounded-br-lg relative ml-6 sm:ml-12 transition-all duration-200 backdrop-blur-sm w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-h-96 h-full overflow-hidden p-3 sm:p-6 before:content-[''] before:absolute before:left-[-10px] before:top-0 before:border-t-[10px] before:border-t-gray-800 before:border-l-[10px] before:border-l-transparent after:content-[''] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(45deg,rgba(181,137,0,0.05)_0,rgba(181,137,0,0.05)_1px,transparent_1px,transparent_4px)] after:pointer-events-none after:rounded-tr-lg after:rounded-bl-lg after:rounded-br-lg"
      variants={containerVariants}
      initial={false}
      animate={inView ? 'visible' : 'hidden'}
    >
      <TypewriterText
        text={quote}
        delay={delay * 0.75}
        inView={inView}
        onComplete={onTypingComplete}
      />
      <motion.div
        className="mt-4 flex items-center gap-2 h-6"
        variants={authorVariants}
        initial={false}
        animate={isTyped ? 'visible' : 'hidden'}
      >
        <motion.div
          initial={false}
          animate={isTyped ? { scale: 1 } : { scale: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 10,
          }}
        >
          <Image
            src={avatar}
            alt={author}
            width={24}
            height={24}
            className="w-6 h-6 border border-amber-500 p-0.5 bg-gray-700 rendering-pixelated"
          />
        </motion.div>
        <div>
          <div className="text-amber-100 font-bold text-xs sm:text-sm text-shadow shadow-amber-500/30 font-['Press_Start_2P']">
            {author}
          </div>
          <div className="text-amber-300 text-[10px] sm:text-xs font-['Press_Start_2P']">
            {role}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Testimonial
