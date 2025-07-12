'use client'

import React, { useRef } from 'react'
import type { GameControlsProps } from '../../types'
import { FaUpload, FaPlay, FaPause, FaStop, FaRedo } from 'react-icons/fa'
import { MdAnalytics } from 'react-icons/md'

export default function GameControls({
  onFileUpload,
  onRegenerateKeystrokeMap,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onStopGame,
  isAnalyzing,
  hasKeystrokeMap,
  canPlay,
  gameState,
  uploadedFileName,
}: GameControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-card border-2 border-border shadow-[4px_4px_0px_#000] pixel-border p-6">
      <div className="flex flex-col items-center gap-4">
        {/* Control Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* File Upload Button */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleFileClick}
              disabled={isAnalyzing}
              className={`
                bg-primary text-white font-['Press_Start_2P'] text-sm border-2 border-primary 
                px-6 py-3 shadow-[4px_4px_0px_#000] pixel-border cursor-pointer
                flex items-center gap-2 min-w-[200px] justify-center
                ${
                  isAnalyzing
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <MdAnalytics className="animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <FaUpload />
                  CHOOSE AUDIO FILE
                </>
              )}
            </button>

            {/* File name display during analysis */}
            {isAnalyzing && uploadedFileName && (
              <div className="text-xs text-text opacity-70 font-['Press_Start_2P'] mt-1">
                {uploadedFileName}
              </div>
            )}
          </div>

          {/* Control Buttons - Show after keystroke map is generated */}
          {hasKeystrokeMap && (
            <>
              {/* Regenerate Map Button */}
              <button
                onClick={onRegenerateKeystrokeMap}
                disabled={isAnalyzing}
                className="bg-secondary text-white font-['Press_Start_2P'] text-sm border-2 border-secondary p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12"
                title="Regenerate keystroke map"
              >
                <FaRedo />
              </button>

              {/* Play/Pause/Stop Buttons */}
              {gameState.isActive ? (
                <div className="flex gap-2">
                  {/* Pause/Resume Button */}
                  <button
                    onClick={gameState.isPaused ? onResumeGame : onPauseGame}
                    className="bg-warning text-white font-['Press_Start_2P'] text-sm border-2 border-warning p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 flex items-center justify-center w-12 h-12"
                    title={gameState.isPaused ? 'Resume game' : 'Pause game'}
                  >
                    {gameState.isPaused ? <FaPlay /> : <FaPause />}
                  </button>

                  {/* Stop Button */}
                  <button
                    onClick={onStopGame}
                    className="bg-error text-white font-['Press_Start_2P'] text-sm border-2 border-error p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 flex items-center justify-center w-12 h-12"
                    title="Stop game"
                  >
                    <FaStop />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onStartGame}
                  disabled={!canPlay}
                  className="bg-accent text-white font-['Press_Start_2P'] text-sm border-2 border-accent p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12"
                  title="Start game"
                >
                  <FaPlay />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
