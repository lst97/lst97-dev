import type { ComponentType } from 'react'
import { motion, useSpring } from 'framer-motion'
import React, { useState, useRef, useCallback, useEffect } from 'react'

const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 40,
}

interface FlipCardProps {
  width: string | number
  height: string | number
  style?: React.CSSProperties
  variant?: 'Front' | 'Back'
}

// Debounce helper function to limit how often mouse move events are processed

export function FlipCardAnimation<P extends FlipCardProps>(
  Component: ComponentType<P>,
): ComponentType<P> {
  function WrappedComponent(props: P) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [, setIsHovering] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Initialize springs with smoother damping
    const dx = useSpring(0, { stiffness: 200, damping: 50 })
    const dy = useSpring(0, { stiffness: 200, damping: 50 })
    const scale = useSpring(1, { stiffness: 300, damping: 40 })

    const handleClick = () => {
      setIsFlipped((prevState) => !prevState)
    }

    // Check if a point is inside the container
    const isPointInContainer = useCallback((x: number, y: number): boolean => {
      if (!containerRef.current) return false

      const rect = containerRef.current.getBoundingClientRect()
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    }, [])

    // Use debounced mouse move handler with reduced sensitivity
    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        const element = containerRef.current
        if (!element) return

        // Verify the mouse is still inside the container (extra safety check)
        if (!isPointInContainer(event.clientX, event.clientY)) return

        const elementRect = element.getBoundingClientRect()
        const elementWidth = elementRect.width
        const elementHeight = elementRect.height
        const elementCenterX = elementWidth / 2
        const elementCenterY = elementHeight / 2

        const mouseX = event.clientX - elementRect.left - elementCenterX
        const mouseY = event.clientY - elementRect.top - elementCenterY

        // Reduced sensitivity for a subtle effect (3 degrees max tilt)
        const degreeX = (mouseY / elementHeight) * 3
        const degreeY = (mouseX / elementWidth) * -3

        // Directly update the spring values
        dx.set(degreeX)
        dy.set(degreeY)
      },
      [isPointInContainer],
    )

    const handleMouseEnter = useCallback(() => {
      setIsHovering(true)
      scale.set(1.05)
    }, [scale])

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        // Double-check if we're really leaving the container
        if (!containerRef.current) {
          setIsHovering(false)
          dx.set(0)
          dy.set(0)
          scale.set(1)
          return
        }

        const rect = containerRef.current.getBoundingClientRect()
        const isOutside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom

        if (isOutside) {
          setIsHovering(false)
          dx.set(0)
          dy.set(0)
          scale.set(1)
        }
      },
      [dx, dy, scale],
    )

    // Clean up springs on unmount
    useEffect(() => {
      return () => {
        dx.stop()
        dy.stop()
        scale.stop()
      }
    }, [dx, dy, scale])

    return (
      <motion.div
        ref={containerRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: '1500px',
          width: props.width,
          height: props.height,
          cursor: 'pointer',
          display: 'block',
          scale,
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            rotateX: dx,
            rotateY: dy,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              position: 'relative',
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? -180 : 0 }}
              transition={spring}
              style={{
                width: '100%',
                height: '100%',
                zIndex: isFlipped ? 0 : 1,
                backfaceVisibility: 'hidden',
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              <Component
                {...props}
                variant="Front"
                style={{ ...props.style, width: '100%', height: '100%' }}
              />
            </motion.div>
            <motion.div
              initial={{ rotateY: 180 }}
              animate={{ rotateY: isFlipped ? 0 : 180 }}
              transition={spring}
              style={{
                width: '100%',
                height: '100%',
                zIndex: isFlipped ? 1 : 0,
                backfaceVisibility: 'hidden',
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              <Component
                {...props}
                variant="Back"
                style={{ ...props.style, width: '100%', height: '100%' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  WrappedComponent.displayName = `FlipCard(${
    Component.displayName || Component.name || 'Component'
  })`
  return WrappedComponent
}
