'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

type ProcessingNoticeProps = {
  isVisible: boolean
  jobCount: number
}

/**
 * A notice component that displays a message about background processing tasks
 */
const ProcessingNotice: React.FC<ProcessingNoticeProps> = ({ isVisible, jobCount }) => {
  const dotsRef = useRef('')
  const frameRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const dotsDOMRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isVisible) {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      return
    }

    const animateDots = (timestamp: number) => {
      // Only update dots every 500ms
      if (timestamp - lastUpdateRef.current > 500) {
        if (dotsRef.current.length >= 3) {
          dotsRef.current = ''
        } else {
          dotsRef.current = dotsRef.current + '.'
        }

        if (dotsDOMRef.current) {
          dotsDOMRef.current.textContent = dotsRef.current
        }

        lastUpdateRef.current = timestamp
      }

      frameRef.current = requestAnimationFrame(animateDots)
    }

    frameRef.current = requestAnimationFrame(animateDots)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-4 right-4 p-4 max-w-md z-50 bg-amber-100"
      style={{
        imageRendering: 'pixelated',
        border: '4px solid #2c2c2c',
        boxShadow: '8px 8px 0 #000',
        fontFamily: "'Press Start 2P', monospace",
        padding: '12px',
        letterSpacing: '1px',
      }}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="#b58900"
            style={{
              filter: 'drop-shadow(2px 2px 0 #000)',
              transform: 'scale(0.9)',
            }}
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h3
            className="font-medium text-sm mb-2"
            style={{
              color: '#2c2c2c',
              textShadow: '1px 1px 0 #fff',
            }}
          >
            Processing {jobCount} image{jobCount !== 1 ? 's' : ''}
            <span ref={dotsDOMRef}></span>
          </h3>
          <p
            className="mt-1 text-xs"
            style={{
              color: '#4e4e4e',
              lineHeight: '1.5',
              fontSize: '10px',
            }}
          >
            The AI model is processing your images to remove backgrounds. This process may take some
            time depending on the number and size of your images.
          </p>
          <div className="mt-3 flex items-center">
            <motion.div
              className="h-4 w-4 rounded-none bg-accent-color border-2 border-border"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span
              className="ml-2 text-xs"
              style={{
                color: '#4e4e4e',
                fontSize: '10px',
              }}
            >
              Please wait while your images are being processed
            </span>
          </div>
          <p
            className="mt-2 text-xs italic"
            style={{
              color: '#b58900',
              fontSize: '10px',
              fontWeight: 'bold',
              textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            Note: Please be patient, and do not close the page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProcessingNotice
