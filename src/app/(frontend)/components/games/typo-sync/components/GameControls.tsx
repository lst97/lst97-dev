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
    <div className="w-full max-w-4xl mx-auto p-6 bg-[var(--card-background)] rounded-lg border-2 border-[var(--border-color)] pixel-border">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-['Press_Start_2P'] text-[var(--text-color)] mb-2">
          🎵 TYPO-SYNC CONTROLS
        </h2>
        <p className="text-sm text-[var(--text-color)] opacity-80">
          Upload audio → Analyze → Generate Map → Play!
        </p>
      </div>

      {/* File Upload Section */}
      <div className="mb-6 p-4 bg-[var(--background-color)] rounded border border-[var(--border-color)]">
        <h3 className="text-lg font-['Press_Start_2P'] text-[var(--text-color)] mb-3 flex items-center gap-2">
          <FaFileAudio className="text-[var(--accent-color)]" />
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
              flex items-center gap-2 px-4 py-2 rounded font-['Press_Start_2P'] text-sm
              border-2 transition-all duration-200
              ${
                isAnalyzing
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                  : 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 active:transform active:scale-95'
              }
            `}
          >
            <FaUpload />
            {isAnalyzing ? 'ANALYZING...' : 'CHOOSE FILE'}
          </button>

          {selectedFileName && (
            <div className="flex-1 p-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded">
              <p className="text-sm text-[var(--text-color)] truncate">📁 {selectedFileName}</p>
            </div>
          )}
        </div>

        {isAnalyzing && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700 font-['Press_Start_2P']">
                Analyzing audio patterns...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Controls */}
      <div className="mb-6 p-4 bg-[var(--background-color)] rounded border border-[var(--border-color)]">
        <h3 className="text-lg font-['Press_Start_2P'] text-[var(--text-color)] mb-3 flex items-center gap-2">
          <FaCog className="text-[var(--accent-color)]" />
          GENERATE MAP
        </h3>

        <button
          onClick={onGenerateKeystrokeMap}
          disabled={!canGenerateMap || isAnalyzing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded font-['Press_Start_2P'] text-sm
            border-2 transition-all duration-200
            ${
              !canGenerateMap || isAnalyzing
                ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white border-green-600 hover:bg-green-700 active:transform active:scale-95'
            }
          `}
        >
          <FaCog className="animate-spin-slow" />
          GENERATE KEYSTROKE MAP
        </button>

        <p className="text-xs text-[var(--text-color)] opacity-60 mt-2">
          Creates typing patterns from beat detection and melody analysis
        </p>
      </div>

      {/* Playback Controls */}
      <div className="p-4 bg-[var(--background-color)] rounded border border-[var(--border-color)]">
        <h3 className="text-lg font-['Press_Start_2P'] text-[var(--text-color)] mb-3 flex items-center gap-2">
          <FaPlay className="text-[var(--accent-color)]" />
          PLAY GAME
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayWithMetronome}
            disabled={!canPlay || isAnalyzing}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded font-['Press_Start_2P'] text-sm
              border-2 transition-all duration-200
              ${
                !canPlay || isAnalyzing
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 active:transform active:scale-95'
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
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded font-['Press_Start_2P'] text-sm
              border-2 transition-all duration-200
              ${
                !canPlay || isAnalyzing
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700 active:transform active:scale-95'
              }
            `}
          >
            <FaMusic />
            PLAY MELODY
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-color)] opacity-60">
          <p>🥁 Metronome: Highlights beat detection</p>
          <p>🎵 Melody: Shows musical note analysis</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
        <h4 className="text-sm font-['Press_Start_2P'] text-amber-800 mb-2">📝 HOW TO PLAY</h4>
        <ul className="text-xs text-amber-700 space-y-1">
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
