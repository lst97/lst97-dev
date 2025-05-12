'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaExclamationTriangle } from 'react-icons/fa'

type ProcessingNoticeProps = {
  isVisible: boolean
  fileCount: number
}

/**
 * A notice component that displays a message about potential UI lag
 * during file processing.
 */
const ProcessingNotice: React.FC<ProcessingNoticeProps> = ({ isVisible, fileCount }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 p-4 max-w-md z-50 bg-amber-100 border-4 border-border shadow-[8px_8px_0px_#000] rounded-none"
      style={{
        imageRendering: 'pixelated',
        fontFamily: "'Press Start 2P', monospace",
        padding: '12px',
        letterSpacing: '1px',
      }}
    >
      <div className="flex items-start">
        <div className="mr-3 text-amber-600">
          <FaExclamationTriangle size={20} style={{ filter: 'drop-shadow(2px 2px 0 #000)' }} />
        </div>
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{
              color: '#2c2c2c',
              textShadow: '1px 1px 0 #fff',
            }}
          >
            Processing {fileCount} file{fileCount !== 1 ? 's' : ''}
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
            The browser is using AI to analyze and detect the file types, which may temporarily
            cause the UI to lag during processing.
          </p>
          <div className="mt-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-accent-color border-t-transparent rounded-full"></div>
            <span
              className="ml-2 text-xs"
              style={{
                color: '#4e4e4e',
                fontSize: '10px',
              }}
            >
              Please wait while your files are processing
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
    </motion.div>
  )
}

export default ProcessingNotice
