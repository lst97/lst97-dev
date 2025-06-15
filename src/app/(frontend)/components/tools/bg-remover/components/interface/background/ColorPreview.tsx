'use client'

import React from 'react'

type ColorPreviewProps = {
  selectedColor: string | null
  alpha?: number
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({ selectedColor, alpha = 1.0 }) => {
  console.log('ColorPreview received:', { selectedColor, alpha })
  return (
    <div className="mb-6">
      <h4 className="font-['Press_Start_2P'] text-sm mb-3">Live Preview</h4>
      <div
        className="relative w-full h-48 border-4 border-border overflow-hidden"
        style={{
          backgroundColor: selectedColor
            ? `rgba(${parseInt(selectedColor.slice(1, 3), 16)}, ${parseInt(selectedColor.slice(3, 5), 16)}, ${parseInt(selectedColor.slice(5, 7), 16)}, ${alpha})`
            : 'transparent',
        }}
      >
        {/* Foreground SVG Demo Object */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M50 10 L61.8 35.4 L90.2 38.2 L68.2 58 L73.6 86.4 L50 72.8 L26.4 86.4 L31.8 58 L9.8 38.2 L38.2 35.4 Z"
            fill="#888888"
            stroke="#333333"
            strokeWidth="2"
            transform="scale(1.2) translate(-8, -5)"
          />
          <path
            d="M50 10 L61.8 35.4 L90.2 38.2 L68.2 58 L73.6 86.4 L50 72.8 L26.4 86.4 L31.8 58 L9.8 38.2 L38.2 35.4 Z"
            fill="rgba(255, 255, 255, 0.8)"
            stroke="white"
            strokeWidth="0.5"
            transform="scale(1.18) translate(-7.5, -6)"
          />
        </svg>
      </div>
    </div>
  )
}
