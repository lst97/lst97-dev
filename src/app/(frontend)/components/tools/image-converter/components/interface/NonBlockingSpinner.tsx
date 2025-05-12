'use client'

import React, { useRef, useEffect } from 'react'

interface NonBlockingSpinnerProps {
  size?: number
  color?: string
  bgColor?: string
  thickness?: number
}

/**
 * A lightweight, non-blocking loading spinner that uses Canvas API
 * and requestAnimationFrame for animation, avoiding heavy DOM operations.
 *
 * This spinner is designed to remain smooth even when the main thread
 * is busy with processing tasks.
 */
const NonBlockingSpinner: React.FC<NonBlockingSpinnerProps> = ({
  size = 40,
  color = '#b58900',
  bgColor = 'rgba(255, 255, 255, 0.2)',
  thickness = 4,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const angleRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set actual size in memory (scaled to account for extra pixel density)
    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = size * devicePixelRatio
    canvas.height = size * devicePixelRatio

    // Scale down to match CSS size
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    // Scale up to handle retina displays
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const drawSpinner = () => {
      ctx.clearRect(0, 0, size, size)

      // Draw background circle
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, (size - thickness) / 2, 0, Math.PI * 2, false)
      ctx.strokeStyle = bgColor
      ctx.lineWidth = thickness
      ctx.stroke()

      // Draw loading circle
      ctx.beginPath()
      ctx.arc(
        size / 2,
        size / 2,
        (size - thickness) / 2,
        angleRef.current,
        angleRef.current + Math.PI * 1.5,
        false,
      )
      ctx.strokeStyle = color
      ctx.lineWidth = thickness
      ctx.stroke()

      // Update angle for animation
      angleRef.current += 0.1
      if (angleRef.current > Math.PI * 2) {
        angleRef.current = 0
      }

      // Schedule next frame
      rafRef.current = requestAnimationFrame(drawSpinner)
    }

    // Start animation
    rafRef.current = requestAnimationFrame(drawSpinner)

    // Cleanup function
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [size, color, bgColor, thickness])

  return <canvas ref={canvasRef} width={size} height={size} className="inline-block" />
}

export default NonBlockingSpinner
