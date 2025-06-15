'use client'

import React from 'react'
import { FaEyeDropper } from 'react-icons/fa'
import { PixelSlider } from '@/frontend/components/ui/Slider'

type CustomColorPickerProps = {
  customColor: string
  hasUnappliedCustomColor: boolean
  hasCompletedImages: boolean
  onCustomColorInputChange: (color: string) => void
  onCustomColorApply: () => void
  disabled?: boolean
  alpha?: number
  onAlphaChange?: (alpha: number) => void
  alphaDisabled?: boolean
}

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  customColor,
  hasUnappliedCustomColor,
  hasCompletedImages,
  onCustomColorInputChange,
  onCustomColorApply,
  disabled = false,
  alpha = 1.0,
  onAlphaChange,
  alphaDisabled = false,
}) => {
  const isApplyDisabled = disabled || !customColor || customColor.length < 4

  return (
    <div className="pt-4 mb-4">
      <h4 className="font-['Press_Start_2P'] text-sm mb-3">Apply Color</h4>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FaEyeDropper className="text-accent-color" />
          <input
            type="color"
            value={customColor}
            onChange={(e) => !disabled && onCustomColorInputChange(e.target.value)}
            disabled={disabled}
            className={`
              w-12 h-12 border-2 border-border shadow-[2px_2px_0px_#000] 
              cursor-pointer bg-transparent
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${hasUnappliedCustomColor ? 'ring-2 ring-yellow-400' : ''}
            `}
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={customColor}
            onChange={(e) => !disabled && onCustomColorInputChange(e.target.value)}
            disabled={disabled}
            placeholder="#F8F9FA"
            className={`
              w-full p-2 border-2 border-border font-['Press_Start_2P'] text-xs
              bg-card focus:outline-none focus:border-accent-color
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${hasUnappliedCustomColor ? 'border-yellow-400' : ''}
            `}
          />
        </div>
        {hasCompletedImages && (
          <button
            onClick={onCustomColorApply}
            disabled={isApplyDisabled}
            className={`
              px-4 py-2 border-2 border-border shadow-[2px_2px_0px_#000] 
              transition-all font-['Press_Start_2P'] text-xs
              bg-border text-white
              ${
                isApplyDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              }
            `}
            title={
              hasUnappliedCustomColor ? 'Apply this custom color' : 'Enter a custom color to apply'
            }
          >
            Apply
          </button>
        )}
      </div>

      {/* Transparency Slider */}
      {onAlphaChange && (
        <div className="mt-4">
          <div className="text-center mb-2">
            <span className="font-['Press_Start_2P'] text-xs text-[var(--color-text)]">
              Transparency: {Math.round((1 - alpha) * 100)}%
              {alphaDisabled && (
                <span className="text-yellow-600 ml-2">(Locked for Transparent)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['Press_Start_2P'] text-xs opacity-70 whitespace-nowrap hidden sm:inline">
              Opaque
            </span>
            <div className="flex-1">
              <PixelSlider
                value={[Math.round((1 - alpha) * 100)]}
                onValueChange={(values) => {
                  if (!alphaDisabled) {
                    const transparency = values[0] / 100
                    const newAlpha = 1 - transparency
                    onAlphaChange(newAlpha)
                  }
                }}
                min={0}
                max={100}
                step={1}
                disabled={disabled || alphaDisabled}
                fullWidth={true}
                className="h-6"
              />
            </div>
            <span className="font-['Press_Start_2P'] text-xs opacity-70 whitespace-nowrap hidden sm:inline">
              Clear
            </span>
          </div>

          {/* Mobile labels below slider */}
          <div className="flex justify-between mt-1 sm:hidden">
            <span className="font-['Press_Start_2P'] text-[10px] opacity-70">Opaque</span>
            <span className="font-['Press_Start_2P'] text-[10px] opacity-70">Clear</span>
          </div>
        </div>
      )}
    </div>
  )
}
