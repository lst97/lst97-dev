'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

// FlipDigit: animates a single digit flip when value changes with pixel art style
const FlipDigit = ({ value, className }: { value: string; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const prev = useRef(value)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [digitSize, setDigitSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  // Measure digit size for fixed width/height
  useEffect(() => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect()
      setDigitSize({ width: rect.width, height: rect.height })
    }
  }, [])

  useEffect(() => {
    if (value !== prev.current) {
      setIsAnimating(true)
      // Pixel art style quick flip animation
      setTimeout(() => {
        setDisplayValue(value)
        setTimeout(() => {
          setIsAnimating(false)
          prev.current = value
        }, 100)
      }, 50)
    }
  }, [value])

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        position: 'relative',
        width: digitSize.width ? digitSize.width : '1ch',
        height: digitSize.height ? digitSize.height : '1em',
        verticalAlign: 'middle',
      }}
    >
      {/* Hidden static digit for sizing */}
      <span
        ref={spanRef}
        style={{ visibility: 'hidden', pointerEvents: 'none', userSelect: 'none' }}
      >
        {value}
      </span>
      <motion.span
        initial={false}
        animate={{
          scale: isAnimating ? [1, 1.2, 1] : 1,
          rotateY: isAnimating ? [0, 180, 360] : 0,
        }}
        transition={{
          duration: 0.15,
          ease: 'linear',
          times: [0, 0.5, 1],
        }}
        style={{
          display: 'inline-block',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
        }}
        className="pixel-border"
      >
        <span
          style={{
            display: 'inline-block',
            backfaceVisibility: 'hidden',
            filter: isAnimating ? 'brightness(1.5)' : 'brightness(1)',
            textShadow: isAnimating ? '0 0 8px currentColor' : 'none',
          }}
        >
          {displayValue}
        </span>
      </motion.span>
    </span>
  )
}

/**
 * Props for MelbourneTime component
 * @param className - Optional Tailwind/CSS classes
 * @param timeZone - IANA time zone string (default: 'Australia/Melbourne')
 * @param hour12 - Whether to use 12-hour format (default: false)
 */
export interface MelbourneTimeProps {
  className?: string
  timeZone?: string
  hour12?: boolean
}

export const MelbourneTime = ({
  className,
  timeZone = 'Australia/Melbourne',
  hour12 = false,
}: MelbourneTimeProps) => {
  const getTimeString = useCallback(
    () =>
      new Date().toLocaleTimeString('en-AU', {
        timeZone,
        hour12,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [timeZone, hour12],
  )

  const [time, setTime] = useState(getTimeString())
  const [, setPrevTime] = useState(time)

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeString = getTimeString()
      setTime((currentTimeString) => {
        setPrevTime(currentTimeString)
        return newTimeString
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeZone, hour12, getTimeString])

  // Split time into array of chars (digits and colons)
  const timeChars = time.split('')

  return (
    <div
      className={`${className || ''} flex flex-col items-center w-full h-full justify-center relative press-start-2p-regular`}
      aria-live="polite"
    >
      <div className="text-3xl md:text-5xl text-center font-bold flex justify-center">
        {timeChars.map((char, i) =>
          /\d/.test(char) ? (
            <FlipDigit key={i} value={char} className="relative" />
          ) : (
            <span key={i} className="mx-1">
              {char}
            </span>
          ),
        )}
      </div>
      <div className="text-sm text-center absolute right-0 bottom-0 p-2">
        {timeZone.split('/').pop() || timeZone}
      </div>
    </div>
  )
}
