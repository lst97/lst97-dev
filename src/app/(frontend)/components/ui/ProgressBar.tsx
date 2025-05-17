'use client'

import React from 'react'
import * as Progress from '@radix-ui/react-progress'
import { motion } from 'framer-motion'

interface PixelProgressBarProps {
  value: number
  max?: number
  showPercentage?: boolean
  className?: string
  progressClassName?: string
  height?: number
  animated?: boolean
}

export const PixelProgressBar = ({
  value,
  max = 100,
  showPercentage = false,
  className = '',
  progressClassName = '',
  height = 20,
  animated = true,
}: PixelProgressBarProps) => {
  // Ensure value is between 0 and max
  const safeValue = Math.min(Math.max(0, value), max)
  const percentage = (safeValue / max) * 100

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <Progress.Root
        className={`relative overflow-hidden w-full bg-background border-4 border-border rounded-none`}
        style={{
          height: `${height}px`,
          imageRendering: 'pixelated',
        }}
        value={percentage}
      >
        <Progress.Indicator asChild>
          {animated ? (
            <motion.div
              className={`h-full ${progressClassName}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              style={{
                backgroundColor: 'var(--color-accent)',
                backgroundImage: `repeating-linear-gradient(
                  to right,
                  var(--color-accent) 0,
                  var(--color-accent) 4px,
                  rgba(255, 255, 255, 0.15) 4px,
                  rgba(255, 255, 255, 0.15) 8px
                )`,
              }}
            />
          ) : (
            <div
              className={`h-full ${progressClassName}`}
              style={{
                width: `${percentage}%`,
                backgroundColor: 'var(--color-accent)',
                backgroundImage: `repeating-linear-gradient(
                  to right,
                  var(--color-accent) 0,
                  var(--color-accent) 4px,
                  rgba(255, 255, 255, 0.15) 4px,
                  rgba(255, 255, 255, 0.15) 8px
                )`,
              }}
            />
          )}
        </Progress.Indicator>

        {/* Pixel noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #000 25%, transparent 25%), 
              linear-gradient(-45deg, #000 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #000 75%), 
              linear-gradient(-45deg, transparent 75%, #000 75%)
            `,
            backgroundSize: '4px 4px',
            backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
            mixBlendMode: 'overlay',
          }}
          aria-hidden="true"
        />
      </Progress.Root>

      {showPercentage && (
        <span
          className="font-['Press_Start_2P'] text-xs min-w-[3rem] text-right"
          style={{ color: 'var(--color-accent)' }}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

export default PixelProgressBar
