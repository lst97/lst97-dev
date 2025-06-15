'use client'

import React from 'react'
import { PRESET_COLORS } from './types'

type PresetColorsProps = {
  selectedColor: string | null
  backgroundMode: 'color' | 'image'
  onPresetColorSelect: (color: string | null) => void
  onPresetColorApply: () => void
  hasCompletedImages: boolean
  disabled?: boolean
}

export const PresetColors: React.FC<PresetColorsProps> = ({
  selectedColor,
  backgroundMode,
  onPresetColorSelect,
  onPresetColorApply: _onPresetColorApply,
  hasCompletedImages: _hasCompletedImages,
  disabled = false,
}) => {
  return (
    <div className="mb-6">
      <h4 className="font-['Press_Start_2P'] text-sm mb-3">Preset Colors</h4>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => !disabled && onPresetColorSelect(preset.value)}
            disabled={disabled}
            className={`
              relative w-12 h-12 border-2 border-border shadow-[2px_2px_0px_#000] 
              hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] 
              transition-all font-['Press_Start_2P'] text-xs
              ${selectedColor === preset.value && backgroundMode === 'color' ? 'ring-4 ring-accent-color' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              backgroundColor: preset.color,
              backgroundImage:
                preset.pattern === 'checkerboard'
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                  : undefined,
              backgroundSize: preset.pattern === 'checkerboard' ? '8px 8px' : undefined,
              backgroundPosition:
                preset.pattern === 'checkerboard' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
            }}
            title={preset.name}
          />
        ))}
      </div>
    </div>
  )
}
