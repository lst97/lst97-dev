'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RollingDigitProps {
  value: string | number
  className?: string
  duration?: number
}

export const RollingDigit: React.FC<RollingDigitProps> = ({
  value,
  className = '',
  duration = 0.15,
}) => {
  const [displayValue, setDisplayValue] = useState(String(value))
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up')
  const prevValueRef = useRef(String(value))

  useEffect(() => {
    const newValue = String(value)
    const prevValue = prevValueRef.current

    if (newValue !== prevValue) {
      // Determine animation direction
      const newNum = parseFloat(newValue) || 0
      const prevNum = parseFloat(prevValue) || 0
      setAnimationDirection(newNum > prevNum ? 'up' : 'down')

      setIsAnimating(true)
      setDisplayValue(newValue)

      // Quick mechanical animation like a combination lock
      setTimeout(() => {
        setIsAnimating(false)
        prevValueRef.current = newValue
      }, duration * 1000)
    }
  }, [value, duration])

  return (
    <div className={`inline-block relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`digit-${displayValue}-${isAnimating}`}
          initial={
            isAnimating
              ? {
                  y: animationDirection === 'up' ? '100%' : '-100%',
                }
              : false
          }
          animate={{
            y: '0%',
          }}
          transition={{
            type: 'tween',
            ease: [0.25, 0.46, 0.45, 0.94], // Smooth mechanical easing
            duration: duration,
          }}
          className="flex items-center justify-center"
        >
          {displayValue}
        </motion.div>
      </AnimatePresence>

      {/* Hidden element to maintain consistent sizing */}
      <div className="invisible" aria-hidden="true">
        {displayValue}
      </div>
    </div>
  )
}

interface RollingNumberProps {
  value: number
  className?: string
  duration?: number
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  className = '',
  duration = 0.15,
}) => {
  const digits = String(value).split('')

  return (
    <div className={`inline-flex ${className}`}>
      {digits.map((digit, index) => (
        <RollingDigit
          key={`digit-${index}`}
          value={digit}
          className=" text-4xl text-center"
          duration={duration}
        />
      ))}
    </div>
  )
}
