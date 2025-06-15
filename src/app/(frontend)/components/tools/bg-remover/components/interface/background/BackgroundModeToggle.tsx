'use client'

import React from 'react'
import { FaPalette, FaImage } from 'react-icons/fa'

type BackgroundModeToggleProps = {
  backgroundMode: 'color' | 'image'
  onModeChange: (mode: 'color' | 'image') => void
  disabled?: boolean
}

export const BackgroundModeToggle: React.FC<BackgroundModeToggleProps> = ({
  backgroundMode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onModeChange('color')}
          disabled={disabled}
          className={`
            px-4 py-2 border-2 border-border shadow-[2px_2px_0px_#000] 
            transition-all font-['Press_Start_2P'] text-xs
            ${backgroundMode === 'color' ? 'bg-accent-color' : 'bg-card'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'}
          `}
          style={{
            color: backgroundMode === 'color' ? 'var(--card-background)' : 'var(--text-color)',
          }}
        >
          <FaPalette className="inline mr-2" />
          Color
        </button>
        <button
          onClick={() => onModeChange('image')}
          disabled={disabled}
          className={`
            px-4 py-2 border-2 border-border shadow-[2px_2px_0px_#000] 
            transition-all font-['Press_Start_2P'] text-xs
            ${backgroundMode === 'image' ? 'bg-accent-color' : 'bg-card'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'}
          `}
          style={{
            color: backgroundMode === 'image' ? 'var(--card-background)' : 'var(--text-color)',
          }}
        >
          <FaImage className="inline mr-2" />
          Image
        </button>
      </div>
    </div>
  )
}
