'use client'

import React, { useRef, useState } from 'react'
import type { GameControlsProps } from '../types'
import { FaUpload, FaPlay, FaMusic, FaCog, FaFileAudio } from 'react-icons/fa'

export default function GameControls({
  onFileUpload,
  onGenerateKeystrokeMap,
  onPlayWithMetronome,
  onPlayMelody,
  isAnalyzing,
  canGenerateMap,
  canPlay,
}: GameControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      onFileUpload(file)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-card w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 border-4 border-border shadow-[8px_8px_0_#000] pixel-border">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-['Press_Start_2P'] text-text mb-2">
          🎵 GAME CONTROLS
        </h2>
        <p className="text-xs sm:text-sm text-text opacity-80">
          Upload audio → Analyze → Generate Map → Play!
        </p>
      </div>

      {/* File Upload Section */}
      <div className="mb-6 p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
        <h3 className="text-sm sm:text-lg font-['Press_Start_2P'] text-text mb-3 flex items-center gap-2">
          <FaFileAudio className="text-accent" />
          AUDIO FILE
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleFileClick}
            disabled={isAnalyzing}
            className={`
              flex items-center gap-2 px-4 py-2 font-['Press_Start_2P'] text-xs sm:text-sm
              border-2 transition-all duration-200 pixel-border shadow-[4px_4px_0px_#000]
              ${
                isAnalyzing
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-accent text-white border-accent hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
              }
            `}
          >
            <FaUpload />
            {isAnalyzing ? 'ANALYZING...' : 'CHOOSE FILE'}
          </button>

          {selectedFileName && (
            <div className="flex-1 p-2 bg-background border-2 border-border pixel-border min-w-0">
              <p className="text-xs sm:text-sm text-text truncate">📁 {selectedFileName}</p>
            </div>
          )}
        </div>

        {isAnalyzing && (
          <div className="mt-3 p-3 bg-info/10 border-2 border-info pixel-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-info border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm text-info font-['Press_Start_2P']">
                Analyzing audio patterns...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Controls */}
      <div className="mb-6 p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
        <h3 className="text-sm sm:text-lg font-['Press_Start_2P'] text-text mb-3 flex items-center gap-2">
          <FaCog className="text-accent" />
          GENERATE MAP
        </h3>

        <button
          onClick={onGenerateKeystrokeMap}
          disabled={!canGenerateMap || isAnalyzing}
          className={`
            flex items-center gap-2 px-4 py-2 font-['Press_Start_2P'] text-xs sm:text-sm
            border-2 transition-all duration-200 pixel-border shadow-[4px_4px_0px_#000]
            ${
              !canGenerateMap || isAnalyzing
                ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed shadow-none'
                : 'bg-success text-white border-success hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
            }
          `}
        >
          <FaCog className={!canGenerateMap || isAnalyzing ? '' : 'animate-spin'} />
          GENERATE KEYSTROKE MAP
        </button>

        <p className="text-xs text-text opacity-60 mt-2">
          Creates typing patterns from beat detection and melody analysis
        </p>
      </div>

      {/* Playback Controls */}
      <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
        <h3 className="text-sm sm:text-lg font-['Press_Start_2P'] text-text mb-3 flex items-center gap-2">
          <FaPlay className="text-accent" />
          PLAY GAME
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayWithMetronome}
            disabled={!canPlay || isAnalyzing}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 font-['Press_Start_2P'] text-xs sm:text-sm
              border-2 transition-all duration-200 pixel-border shadow-[4px_4px_0px_#000]
              ${
                !canPlay || isAnalyzing
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary text-white border-primary hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
              }
            `}
          >
            <FaPlay />
            PLAY WITH METRONOME
          </button>

          <button
            onClick={onPlayMelody}
            disabled={!canPlay || isAnalyzing}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 font-['Press_Start_2P'] text-xs sm:text-sm
              border-2 transition-all duration-200 pixel-border shadow-[4px_4px_0px_#000]
              ${
                !canPlay || isAnalyzing
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-warning text-white border-warning hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
              }
            `}
          >
            <FaMusic />
            PLAY MELODY
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text opacity-60">
          <p>🥁 Metronome: Highlights beat detection</p>
          <p>🎵 Melody: Shows musical note analysis</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-warning/10 border-2 border-warning pixel-border">
        <h4 className="text-xs sm:text-sm font-['Press_Start_2P'] text-warning mb-2">
          📝 HOW TO PLAY
        </h4>
        <ul className="text-xs text-warning/80 space-y-1">
          <li>• Upload an audio file (MP3, WAV, etc.)</li>
          <li>• Wait for analysis to complete</li>
          <li>• Generate keystroke map from the analysis</li>
          <li>• Choose play mode and start typing along!</li>
          <li>• Hit keys precisely in time with the music</li>
          <li>• Look for hidden tambourine notes for bonus points</li>
        </ul>
      </div>
    </div>
  )
}
