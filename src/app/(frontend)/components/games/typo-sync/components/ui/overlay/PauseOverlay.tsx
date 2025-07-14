'use client'

import React from 'react'
import { FaPlay, FaStop, FaClock } from 'react-icons/fa'

interface PauseOverlayProps {
  isVisible: boolean
  onResume: () => void
  onStop: () => void
}

export function PauseOverlay({ isVisible, onResume, onStop }: PauseOverlayProps) {
  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center"
      onClick={onResume} // Click anywhere to resume
    >
      {/* Main pause overlay content */}
      <div
        className="relative bg-card border-4 border-border shadow-[8px_8px_0px_#000] pixel-border p-8 max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent click-through to resume
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaClock className="text-4xl text-warning" />
            <h2 className="font-['Press_Start_2P'] text-2xl text-warning">PAUSED</h2>
          </div>
          
          <p className="font-['Press_Start_2P'] text-sm text-text/80">
            Click anywhere or press a button to continue
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={onResume}
            className="w-full px-6 py-4 bg-success text-white font-['Press_Start_2P'] text-sm 
              border-4 border-border shadow-[4px_4px_0px_#000] pixel-border
              hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
              active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
              transition-all duration-100 flex items-center justify-center gap-3"
          >
            <FaPlay />
            RESUME GAME
          </button>

          <button
            onClick={onStop}
            className="w-full px-6 py-4 bg-error text-white font-['Press_Start_2P'] text-sm 
              border-4 border-border shadow-[4px_4px_0px_#000] pixel-border
              hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
              active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
              transition-all duration-100 flex items-center justify-center gap-3"
          >
            <FaStop />
            STOP GAME
          </button>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-2 left-2 w-4 h-4 bg-accent pixel-border" />
        <div className="absolute top-2 right-2 w-4 h-4 bg-primary pixel-border" />
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-info pixel-border" />
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-success pixel-border" />
      </div>

      {/* Status indicators */}
      <div className="absolute top-8 left-8 bg-background/80 border-2 border-border p-3 pixel-border shadow-[4px_4px_0px_#000] backdrop-blur-sm">
        <div className="font-['Press_Start_2P'] text-xs text-text/70">
          GAME PAUSED
        </div>
      </div>

      <div className="absolute top-8 right-8 bg-background/80 border-2 border-border p-3 pixel-border shadow-[4px_4px_0px_#000] backdrop-blur-sm">
        <div className="font-['Press_Start_2P'] text-xs text-text/70">
          TIME STOPPED
        </div>
      </div>
    </div>
  )
}

export default PauseOverlay