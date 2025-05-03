'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Props for the TypingAnimation component.
 */
interface TypingAnimationProps {
  /** The text to be displayed with a typing animation. */
  text: string
}

/**
 * Component that displays text with a typing animation effect.
 * @param {TypingAnimationProps} props - The props for the component.
 */
const TypingAnimation = React.memo(({ text }: TypingAnimationProps) => {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [text])

  return (
    <motion.h1
      className="font-['Press_Start_2P'] text-[2rem] md:text-[3rem] text-text-color drop-shadow-[4px_4px_0_var(--text-shadow-color)] mb-8 relative inline-block whitespace-pre-wrap min-h-[5rem] max-w-[90%] break-words leading-[1.5]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {displayText}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="inline-block ml-2 animate-blink text-accent-color align-baseline"
      >
        _
      </motion.span>
    </motion.h1>
  )
})

TypingAnimation.displayName = 'TypingAnimation'

export default TypingAnimation
