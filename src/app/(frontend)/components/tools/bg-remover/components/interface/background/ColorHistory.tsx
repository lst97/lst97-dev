'use client'

import React from 'react'
import { FaHistory, FaTrash } from 'react-icons/fa'

type ColorHistoryProps = {
  colorHistory: string[]
  selectedColor: string | null
  backgroundMode: 'color' | 'image'
  onHistoryColorSelect: (color: string) => void
  onClearHistory: () => void
  disabled?: boolean
}

export const ColorHistory: React.FC<ColorHistoryProps> = ({
  colorHistory,
  selectedColor,
  backgroundMode,
  onHistoryColorSelect,
  onClearHistory,
  disabled = false,
}) => {
  if (colorHistory.length === 0) {
    return null
  }

  return (
    <div className="border-t-2 border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaHistory className="text-accent-color" />
          <h4 className="font-['Press_Start_2P'] text-sm">Recent Colors</h4>
        </div>
        <button
          onClick={onClearHistory}
          disabled={disabled}
          className={`
            w-8 h-8 flex items-center justify-center
            border-2 border-border shadow-[1px_1px_0px_#000] 
            hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] 
            transition-all bg-error-light
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title="Clear recent colors"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {colorHistory.map((color, index) => (
          <button
            key={`${color}-${index}`}
            onClick={() => !disabled && onHistoryColorSelect(color)}
            disabled={disabled}
            className={`
              w-10 h-10 border-2 border-border shadow-[2px_2px_0px_#000] 
              hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] 
              transition-all
              ${selectedColor === color && backgroundMode === 'color' ? 'ring-2 ring-accent-color' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}
