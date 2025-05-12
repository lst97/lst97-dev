'use client'

import React from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { motion } from 'framer-motion'
import { FaChevronDown } from 'react-icons/fa'

interface PixelCollapsibleProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  arrowPosition?: 'right' | 'left'
}

export const PixelCollapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  PixelCollapsibleProps
>(
  (
    {
      title,
      children,
      className = '',
      headerClassName = '',
      contentClassName = '',
      icon,
      defaultOpen = false,
      onOpenChange,
      arrowPosition = 'right',
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(defaultOpen)

    // Handle open state changes
    const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen)
      if (onOpenChange) {
        onOpenChange(isOpen)
      }
    }

    return (
      <CollapsiblePrimitive.Root
        ref={ref}
        open={open}
        onOpenChange={handleOpenChange}
        className={`w-full border-4 border-[var(--color-border)] bg-[var(--color-card)] shadow-[8px_8px_0_var(--shadow)]  ${className}`}
        {...props}
      >
        <CollapsiblePrimitive.Trigger
          asChild
          className={`group w-full cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${headerClassName}`}
        >
          <div className="relative flex items-center justify-between w-full p-4 font-['Press_Start_2P'] text-[1rem] md:text-[0.9rem] sm:text-[0.8rem] text-[var(--color-text)] bg-[var(--color-hover)] border-b-4 border-[var(--color-border)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-button-text)]">
            {/* Pixel art pattern overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 4px,
                    rgba(0, 0, 0, 0.1) 4px,
                    rgba(0, 0, 0, 0.1) 8px
                  )
                `,
              }}
              aria-hidden="true"
            />

            {/* Title with optional icon */}
            <div className="flex items-center gap-2 w-full">
              {arrowPosition === 'left' && (
                <motion.div
                  animate={{ rotate: open ? -180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[0.8rem]"
                >
                  <FaChevronDown />
                </motion.div>
              )}

              {icon && <span className="text-[1.2rem]">{icon}</span>}

              <span className="text-left flex-1">{title}</span>

              {arrowPosition === 'right' && (
                <motion.div
                  animate={{ rotate: open ? -180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[0.8rem]"
                >
                  <FaChevronDown />
                </motion.div>
              )}
            </div>
          </div>
        </CollapsiblePrimitive.Trigger>

        <CollapsiblePrimitive.Content className={`overflow-hidden ${contentClassName}`}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: open ? 'auto' : 0 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {/* Content wrapper with decorative border */}
            <div className="p-4 relative">
              {/* Pixel art decorative border pattern */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, var(--color-border) 4px, transparent 4px),
                    linear-gradient(to bottom, var(--color-border) 4px, transparent 4px)
                  `,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0',
                  opacity: 0.1,
                }}
                aria-hidden="true"
              />

              {/* Actual content */}
              <div className="relative z-10">{children}</div>
            </div>
          </motion.div>
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    )
  },
)

PixelCollapsible.displayName = 'PixelCollapsible'

export default PixelCollapsible
