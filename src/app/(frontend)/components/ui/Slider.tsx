'use client'

import React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

interface PixelSliderProps {
  value: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  lowLabel?: string
  highLabel?: string
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  thumbClassName?: string
  trackClassName?: string
  rangeClassName?: string
}

export const PixelSlider = React.forwardRef<HTMLDivElement, PixelSliderProps>(
  (
    {
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      lowLabel,
      highLabel,
      disabled = false,
      fullWidth = false,
      className = '',
      thumbClassName = '',
      trackClassName = '',
      rangeClassName = '',
    },
    ref,
  ) => {
    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="font-['Press_Start_2P'] text-sm text-[var(--color-text)]">
            {label}: {value[0]}%
          </label>
        )}

        <div className="relative">
          <SliderPrimitive.Root
            ref={ref}
            className={`relative flex items-center select-none touch-none ${
              fullWidth ? 'w-full' : 'w-[200px]'
            } h-8 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            value={value}
            onValueChange={onValueChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-label={label}
          >
            <SliderPrimitive.Track
              className={`w-full h-3 bg-[var(--background-color)] border-3 border-[var(--color-border)] rounded-none appearance-none ${trackClassName}`}
            >
              <SliderPrimitive.Range
                className={`absolute h-2  bg-[var(--color-accent)] ${rangeClassName}`}
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              className={`block h-8 w-8 shadow-[4px_4px_0px_var(--shadow)] border-4 border-[var(--color-border)] focus:outline-none hover:cursor-pointer 
                bg-[var(--color-card)] hover:bg-[var(--color-hover)] focus:-translate-x-0.5 focus:-translate-y-0.5
                active:translate-x-[2px] active:translate-y-[2px] transition-transform duration-150 ${thumbClassName}`}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(181, 137, 0, 0.05) 2px, rgba(181, 137, 0, 0.05) 4px)',
                  opacity: 0.5,
                  mixBlendMode: 'overlay',
                }}
              />
            </SliderPrimitive.Thumb>
          </SliderPrimitive.Root>

          {/* Pixel noise overlay using CSS pattern */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-5"
            aria-hidden="true"
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
          />
        </div>

        {(lowLabel || highLabel) && (
          <div className="flex justify-between text-xs mt-1 font-['Press_Start_2P'] text-[var(--color-text)]">
            {lowLabel && <span>{lowLabel}</span>}
            {highLabel && <span>{highLabel}</span>}
          </div>
        )}
      </div>
    )
  },
)

PixelSlider.displayName = 'PixelSlider'

export default PixelSlider
