'use client'

import React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'

interface PixelScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  children: React.ReactNode
  className?: string
  viewportClassName?: string
  scrollbarClassName?: string
  thumbClassName?: string
  maxHeight?: string | number
  maxWidth?: string | number
  orientation?: 'vertical' | 'horizontal' | 'both'
}

export const PixelScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  PixelScrollAreaProps
>(
  (
    {
      children,
      className = '',
      viewportClassName = '',
      scrollbarClassName = '',
      thumbClassName = '',
      maxHeight = '100%',
      maxWidth = '100%',
      orientation = 'vertical',
      type = 'auto',
      ...props
    },
    ref,
  ) => {
    // Define scrollbar styles based on orientation
    const verticalScrollbar = orientation === 'vertical' || orientation === 'both'
    const horizontalScrollbar = orientation === 'horizontal' || orientation === 'both'

    // Determine height/width style values
    const heightValue = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
    const widthValue = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        type={type}
        className={`relative overflow-hidden ${className}`}
        style={{
          height: heightValue,
          maxHeight: heightValue,
          width: '100%',
          maxWidth: widthValue,
        }}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport className={`w-full h-full rounded-none ${viewportClassName}`}>
          {children}
        </ScrollAreaPrimitive.Viewport>

        {/* Vertical scrollbar */}
        {verticalScrollbar && (
          <ScrollAreaPrimitive.Scrollbar
            orientation="vertical"
            className={`flex select-none touch-none p-0.5 bg-[var(--color-card)] transition-colors duration-150 ease-out
              w-6 border-l-2 border-[var(--color-border)]
              hover:bg-[var(--color-hover)]
              ${scrollbarClassName}`}
          >
            <ScrollAreaPrimitive.Thumb
              className={`relative flex-1 rounded-none bg-[var(--color-accent)] border-2 border-[var(--color-border)] ${thumbClassName}`}
              style={{
                position: 'relative',
                // Ensure the thumb has a minimum height for better usability
                minHeight: '20px',
                // Pixel art pattern inside thumb
                backgroundImage: `
                  repeating-linear-gradient(
                    to bottom,
                    transparent,
                    transparent 4px,
                    rgba(255, 255, 255, 0.1) 4px,
                    rgba(255, 255, 255, 0.1) 8px
                  )
                `,
              }}
            >
              {/* Decorator dots (pixel art style) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--color-border)]" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--color-border)]" />
              <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--color-border)]" />
            </ScrollAreaPrimitive.Thumb>
          </ScrollAreaPrimitive.Scrollbar>
        )}

        {/* Horizontal scrollbar */}
        {horizontalScrollbar && (
          <ScrollAreaPrimitive.Scrollbar
            orientation="horizontal"
            className={`flex select-none touch-none p-0.5 bg-[var(--color-card)] transition-colors duration-150 ease-out
              h-4 border-t-2 border-[var(--color-border)]
              hover:bg-[var(--color-hover)]
              ${scrollbarClassName}`}
          >
            <ScrollAreaPrimitive.Thumb
              className={`relative flex-1 rounded-none bg-[var(--color-accent)] border-2 border-[var(--color-border)] ${thumbClassName}`}
              style={{
                // Pixel art pattern inside thumb
                backgroundImage: `
                  repeating-linear-gradient(
                    to right,
                    transparent,
                    transparent 4px,
                    rgba(255, 255, 255, 0.1) 4px,
                    rgba(255, 255, 255, 0.1) 8px
                  )
                `,
              }}
            >
              {/* Decorator dots (pixel art style) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--color-border)]" />
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--color-border)]" />
              <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--color-border)]" />
            </ScrollAreaPrimitive.Thumb>
          </ScrollAreaPrimitive.Scrollbar>
        )}

        <ScrollAreaPrimitive.Corner className="bg-[var(--color-hover)]" />
      </ScrollAreaPrimitive.Root>
    )
  },
)

PixelScrollArea.displayName = 'PixelScrollArea'

export default PixelScrollArea
