'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import RecognitionSidebar from './RecognitionSidebar'
import RecognitionTestimonials from './RecognitionTestimonials'
import testimonials from '@/app/(frontend)/constants/data/recognition'

interface RecognitionProps {
  inView?: boolean
}

const Recognition: React.FC<RecognitionProps> = ({ inView = false }) => {
  const [typedMessages, setTypedMessages] = useState<boolean[]>([])
  const [currentTypingIndex, setCurrentTypingIndex] = useState<number>(-1)

  useEffect(() => {
    if (!inView) {
      setTypedMessages([])
      setCurrentTypingIndex(-1)
    } else if (inView && currentTypingIndex === -1) {
      setCurrentTypingIndex(0)
    }
  }, [inView, currentTypingIndex])

  const handleTypingComplete = (index: number) => {
    setTypedMessages((prev) => {
      const newTyped = [...prev]
      newTyped[index] = true
      return newTyped
    })
    setTimeout(() => {
      if (index < testimonials.length - 1) {
        setCurrentTypingIndex(index + 1)
      }
    }, 500)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.section
      className="bg-gray-700 border-4 border-amber-500 font-['Press_Start_2P'] shadow-[8px_8px_0_rgba(181,137,0,0.2)] relative w-full max-w-[1200px] mx-auto p-0 before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(#b58900_1px,transparent_1px),radial-gradient(#b58900_1px,transparent_1px)] before:bg-[size:16px_16px] before:bg-[position:0_0,8px_8px] before:opacity-5 before:pointer-events-none"
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      <motion.div
        className="bg-gray-800 border-b-2 border-amber-500 px-3 sm:px-4 py-2 flex items-center justify-between h-8 relative z-10"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🏆</span>
          <span className="text-amber-100 text-[10px] sm:text-xs text-shadow shadow-amber-500/30">
            Recognition & Achievements
          </span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <span
            className="text-amber-500 text-xs cursor-pointer transition-colors duration-200 hover:text-amber-100"
            aria-hidden="true"
          >
            _
          </span>
          <span
            className="text-amber-500 text-xs cursor-pointer transition-colors duration-200 hover:text-amber-100"
            aria-hidden="true"
          >
            □
          </span>
          <span
            className="text-amber-500 text-xs cursor-pointer transition-colors duration-200 hover:text-amber-100"
            aria-hidden="true"
          >
            ×
          </span>
        </div>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-[300px_1fr] min-h-[600px] relative"
        variants={itemVariants}
      >
        <RecognitionSidebar />
        <RecognitionTestimonials
          testimonials={testimonials}
          typedMessages={typedMessages}
          currentTypingIndex={currentTypingIndex}
          inView={inView}
          handleTypingComplete={handleTypingComplete}
        />
      </motion.div>
    </motion.section>
  )
}

Recognition.displayName = 'Recognition'
export default Recognition
