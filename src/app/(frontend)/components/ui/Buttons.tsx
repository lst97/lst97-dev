import {
  Button as RadixButtonPrimitive,
  type ButtonProps as RadixButtonProps,
} from '@radix-ui/themes'
import { Slot } from '@radix-ui/react-slot'
import React from 'react'

export const CloseIconButton = ({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) => {
  return (
    <div className={`inline-flex items-center justify-center h-full w-full`} onClick={onClick}>
      <span
        className={`absolute w-8 h-8 flex items-center justify-center transform hover:cursor-pointer hover:bg-amber-300 cursor-pointer ${className}`}
      >
        <span className="absolute w-4 h-1 bg-black rotate-45"></span>
        <span className="absolute w-4 h-1 bg-black -rotate-45"></span>
      </span>
    </div>
  )
}

// Pixel-art style classes
const pixelBase = [
  "font-['Press_Start_2P']",
  'text-xl',
  'border-4',
  'border-double',
  'border-black',
  'bg-yellow-200',
  'text-black',
  'shadow-[8px_8px_0_#222]',
  'px-10',
  'py-5',
  'relative',
  'transition-all',
  'duration-150',
  'cursor-pointer',
  'select-none',
  'no-underline',
  'inline-block',
  'overflow-hidden',
  'active:translate-x-[2px]',
  'active:translate-y-[2px]',
  'hover:translate-x-[-3px]',
  'hover:translate-y-[-3px]',
  'hover:shadow-[12px_12px_0_#222]',
  'hover:bg-yellow-300',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-yellow-400',
].join(' ')

const variantClasses: Record<string, string> = {
  primary:
    'rounded-md bg-[var(--color-button)] text-[var(--color-button-text)] border-2 border-[var(--color-border)] px-6 py-3 font-semibold shadow-md hover:bg-[var(--color-accent)] transition',
  secondary:
    'rounded bg-[var(--color-card)] text-[var(--color-text)] border-2 border-[var(--color-border)] px-6 py-3 font-semibold shadow hover:bg-[var(--color-hover)] transition',
  pixel: pixelBase,
}

export interface ButtonPropsExtended extends Omit<RadixButtonProps, 'variant'> {
  asChild?: boolean
  className?: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'pixel'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonPropsExtended>(
  ({ asChild = false, className = '', children, variant = 'primary', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const variantClass = variantClasses[variant] || variantClasses.primary

    if (asChild) {
      // Use Slot to compose the child with the button's props
      return (
        <RadixButtonPrimitive
          asChild
          className={variantClass + ' ' + className}
          {...props}
          ref={ref}
        >
          <Comp>{children}</Comp>
        </RadixButtonPrimitive>
      )
    }

    return (
      <RadixButtonPrimitive className={variantClass + ' ' + className} {...props} ref={ref}>
        {variant === 'pixel' && <div aria-hidden="true" className="bg-pixel-noise" />}
        <span className="relative z-20">{children}</span>
      </RadixButtonPrimitive>
    )
  },
)
Button.displayName = 'Button'
