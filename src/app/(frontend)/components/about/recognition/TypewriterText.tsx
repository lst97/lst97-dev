'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useAnimate, stagger } from 'framer-motion'

const TypewriterText: React.FC<{
  text: string
  delay?: number
  inView: boolean
  onComplete?: () => void
}> = ({ text, delay = 0, inView, onComplete }) => {
  const [scope, animate] = useAnimate()
  const [isTyping, setIsTyping] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const animationRef = useRef<AbortController>(new AbortController())
  const characters = Array.from(text)

  useEffect(() => {
    if (inView && !hasCompleted) {
      const controller = new AbortController()
      animationRef.current = controller

      const animation = async () => {
        try {
          // Reset the animation
          await animate('span', { opacity: 0, display: 'none' }, { duration: 0 })

          // Wait for the specified delay
          await new Promise((resolve) => setTimeout(resolve, delay))

          if (controller.signal.aborted) return
          setIsTyping(true)

          // Animate each character with a stagger effect
          await animate(
            'span',
            {
              opacity: 1,
              display: 'inline',
            },
            {
              duration: 0.02,
              delay: stagger(0.02),
              ease: 'linear',
            },
          )

          if (controller.signal.aborted) return
          setIsTyping(false)
          setHasCompleted(true)
          onComplete?.()
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            // Only log errors that aren't expected aborts
            console.error('Typewriter animation error:', error)
          }
        }
      }

      animation()

      return () => {
        controller.abort()
        setIsTyping(false)
      }
    } else if (!inView) {
      // Reset when not in view
      setIsTyping(false)
      setHasCompleted(false)
      animate('span', { opacity: 0, display: 'none' }, { duration: 0 })
      if (animationRef.current) {
        animationRef.current.abort()
      }
    }
  }, [animate, delay, inView, onComplete, hasCompleted])

  return (
    <div className="relative overflow-hidden">
      <div
        ref={scope}
        className="text-amber-300 block whitespace-pre-wrap break-words min-h-6 max-h-72 overflow-y-auto text-xs sm:text-sm"
      >
        {characters.map((char, index) => (
          <span
            key={index}
            style={{
              opacity: hasCompleted ? 1 : 0,
              display: hasCompleted ? 'inline' : 'none',
              whiteSpace: 'pre-wrap',
            }}
          >
            {char}
          </span>
        ))}
      </div>
      {isTyping && (
        <motion.div
          className="absolute right-0 bottom-0 bg-gray-800 text-amber-500 text-xs font-['Press_Start_2P'] p-0.5 rounded border border-amber-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          typing...
        </motion.div>
      )}
    </div>
  )
}

export default TypewriterText
