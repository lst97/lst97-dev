'use client'

import React from 'react'
import { PixelSlider } from '@/frontend/components/ui/Slider'

type ColorAlphaSliderProps = {
  alpha: number
  onAlphaChange: (alpha: number) => void
  disabled?: boolean
}

export const ColorAlphaSlider: React.FC<ColorAlphaSliderProps> = ({
  alpha,
  onAlphaChange,
  disabled = false,
}) => {
  return (
    <div className="mb-6">
      <h4 className="font-['Press_Start_2P'] text-sm mb-3">Color Transparency</h4>
      <div className="bg-card border-2 border-border p-4 shadow-[2px_2px_0px_#000]">
        <div className="text-center mb-2">
          <span className="font-['Press_Start_2P'] text-xs text-[var(--color-text)]">
            Transparency: {Math.round((1 - alpha) * 100)}%
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
                const transparency = values[0] / 100
                const newAlpha = 1 - transparency
                onAlphaChange(newAlpha)
              }}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
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
    </div>
  )
}
