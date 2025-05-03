'use client'

import React, { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { valuesData } from '@/frontend/constants/data/vap'
import { ValueCard } from './ValueCard'

interface ValuesAndPassionsProps {
  inView?: boolean
}

const ValuesAndPassions: React.FC<ValuesAndPassionsProps> = ({ inView = false }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInternalInView = useInView(sectionRef, { once: true, amount: 0.3 })

  // Use either the prop from parent or internal calculation
  const isVisible = inView || isInternalInView

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: prefersReducedMotion ? 0 : 0.2,
        duration: prefersReducedMotion ? 0.1 : 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.5,
        ease: 'easeOut',
      },
    },
  }

  return (
    <motion.section
      ref={sectionRef}
      className="relative bg-[#3a3a3a] border-4 border-[#b58900] font-['Press_Start_2P'] shadow-[8px_8px_0_rgba(181,137,0,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-[url('/pixel-art-innovation.svg')] before:bg-no-repeat before:bg-[256px] before:opacity-5 before:pointer-events-none before:z-0"
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
    >
      <motion.div className="mb-8 relative flex flex-col items-center" variants={itemVariants}>
        <div className="bg-[#3a3a3a] border-2 border-[#b58900] shadow-[0_4px_12px_rgba(181,137,0,0.2)] transform -translate-y-10 mb-[-20px] p-4">
          <Image
            src="/pixel-art-innovation.svg"
            alt="Values & Passions"
            width={64}
            height={64}
            className="filter sepia-[100%] saturate-[300%] brightness-[85%] hue-rotate-[350deg]"
          />
        </div>
        <h2 className="relative text-2xl font-bold text-center text-[#fff3c4] tracking-[2px] pb-4 font-['Press_Start_2P'] after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[120px] after:h-[4px] after:bg-[repeating-linear-gradient(45deg,#b58900_0,#b58900_4px,transparent_4px,transparent_8px)]">
          Values & Passions
        </h2>
      </motion.div>
      <motion.div className="relative z-1 flex flex-wrap justify-center gap-16 pb-12">
        {valuesData.map((item) => (
          <ValueCard key={item.id} item={item} variants={itemVariants} />
        ))}
      </motion.div>
    </motion.section>
  )
}

ValuesAndPassions.displayName = 'ValuesAndPassions'

export default ValuesAndPassions
