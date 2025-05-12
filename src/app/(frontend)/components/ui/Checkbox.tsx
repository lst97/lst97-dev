'use client'

import React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'

interface PixelCheckboxProps {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  id?: string
  className?: string
  labelClassName?: string
}

export const PixelCheckbox = React.forwardRef<HTMLButtonElement, PixelCheckboxProps>(
  (
    { checked, onCheckedChange, disabled = false, label, id, className = '', labelClassName = '' },
    ref,
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`

    return (
      <div className="flex items-center">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={`
            relative w-6 h-6 
            border-4 border-[var(--color-border)] 
            bg-[var(--color-hover)]
            shadow-[4px_4px_0_var(--shadow-color)]
            transition-all duration-200
            hover:-translate-x-0.5 hover:-translate-y-0.5
            hover:shadow-[6px_6px_0_var(--shadow-color)]
            data-[state=checked]:bg-[var(--color-accent)]
            data-[state=checked]:-translate-x-0.5 data-[state=checked]:-translate-y-0.5
            data-[state=checked]:shadow-[6px_6px_0_var(--shadow-color)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center">
            <CheckIcon className="text-white w-4 h-4" />
          </CheckboxPrimitive.Indicator>

          {/* Pixel noise overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(181, 137, 0, 0.05) 2px, rgba(181, 137, 0, 0.05) 4px)',
              opacity: 0.5,
              mixBlendMode: 'overlay',
            }}
          />
        </CheckboxPrimitive.Root>

        {label && (
          <label
            htmlFor={checkboxId}
            className={`ml-2 text-sm font-['Press_Start_2P'] text-[var(--color-text)] cursor-pointer ${
              disabled ? 'opacity-50' : ''
            } ${labelClassName}`}
          >
            {label}
          </label>
        )}
      </div>
    )
  },
)

PixelCheckbox.displayName = 'PixelCheckbox'

export default PixelCheckbox
