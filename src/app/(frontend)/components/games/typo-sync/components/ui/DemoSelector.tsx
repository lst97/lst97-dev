'use client'

import React from 'react'
import { mapImportExportService } from '../../services/mapImportExportService'
import type { AnalysisResult, Keystroke, HiddenNote } from '../../types'

interface DemoSelectorProps {
  onDemoSelect: (demoLevel: string) => void
  onDemoLoadingSet: (loading: boolean) => void
  onAudioContextSet: (context: AudioContext) => void
  onAudioBufferSet: (buffer: AudioBuffer) => void
  onAnalysisResultSet: (result: AnalysisResult) => void
  onKeystrokeMapSet: (map: Keystroke[]) => void
  onHiddenNotesSet: (notes: HiddenNote[]) => void
  onCurrentAudioFileSet: (file: File) => void
  onUploadedFileNameSet: (name: string) => void
  onIsAudioLoadedForPreAnalyzedSet: (loaded: boolean) => void
  onCloudProcessingEnabledSet: (enabled: boolean) => void
  onError: (error: string | null) => void
  onStopGame: () => void
  generateKeystrokeMap: () => void
  selectedDemo: string | null
  isDemoLoading: boolean
  gameState: {
    isActive: boolean
    isPaused: boolean
  }
}

interface DemoLevel {
  id: string
  name: string
  emoji: string
  description: string
  colorClass: string
  hoverClass: string
  bgClass: string
  borderClass: string
}

const demoLevels: DemoLevel[] = [
  {
    id: 'medium',
    name: 'MEDIUM',
    emoji: '🟢',
    description: 'Perfect for beginners',
    colorClass: 'bg-success text-white border-success',
    hoverClass: 'hover:bg-success/10',
    bgClass: 'bg-card',
    borderClass: 'border-border',
  },
  {
    id: 'hard',
    name: 'HARD',
    emoji: '🟡',
    description: 'Challenge yourself',
    colorClass: 'bg-warning text-white border-warning',
    hoverClass: 'hover:bg-warning/10',
    bgClass: 'bg-card',
    borderClass: 'border-border',
  },
  {
    id: 'expert',
    name: 'EXPERT',
    emoji: '🔴',
    description: 'Master level',
    colorClass: 'bg-error text-white border-error',
    hoverClass: 'hover:bg-error/10',
    bgClass: 'bg-card',
    borderClass: 'border-border',
  },
]

export default function DemoSelector({
  onDemoSelect,
  onDemoLoadingSet,
  onAudioContextSet,
  onAudioBufferSet,
  onAnalysisResultSet,
  onKeystrokeMapSet,
  onHiddenNotesSet,
  onCurrentAudioFileSet,
  onUploadedFileNameSet,
  onIsAudioLoadedForPreAnalyzedSet,
  onCloudProcessingEnabledSet,
  onError,
  onStopGame,
  generateKeystrokeMap,
  selectedDemo,
  isDemoLoading,
  gameState,
}: DemoSelectorProps) {
  const handleDemoSelection = async (demoLevel: string) => {
    // Stop the current game if it's active
    if (gameState.isActive) {
      onStopGame()
      // Give a small delay to ensure the game stops cleanly
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    onDemoLoadingSet(true)
    onDemoSelect(demoLevel)
    onError(null)

    try {
      // Load demo map
      const mapResponse = await fetch(`/typo-sync/demo/${demoLevel}-map.json`)
      if (!mapResponse.ok) {
        throw new Error(`Failed to load demo map: ${mapResponse.statusText}`)
      }
      const mapData = await mapResponse.json()

      // Load demo audio
      const audioResponse = await fetch(`/typo-sync/demo/${demoLevel}.mp3`)
      if (!audioResponse.ok) {
        throw new Error(`Failed to load demo audio: ${audioResponse.statusText}`)
      }
      const audioBlob = await audioResponse.blob()
      const audioFile = new File([audioBlob], `${demoLevel}.mp3`, { type: 'audio/mpeg' })

      // Process the demo map data
      const analysisResult = mapImportExportService.createAnalysisResultFromImport(mapData)
      onAnalysisResultSet(analysisResult)

      // Set keystroke map
      if (mapData.keystroke_map && mapData.keystroke_map.length > 0) {
        onKeystrokeMapSet(mapData.keystroke_map)
      } else {
        generateKeystrokeMap()
      }

      // Set hidden notes
      if (mapData.hidden_notes && mapData.hidden_notes.length > 0) {
        onHiddenNotesSet(mapData.hidden_notes)
      }

      // Load audio buffer
      const audioContext = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext ||
        AudioContext)()
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      onAudioContextSet(audioContext)
      onAudioBufferSet(audioBuffer)
      onCurrentAudioFileSet(audioFile)
      onUploadedFileNameSet(`${demoLevel}.mp3`)
      onIsAudioLoadedForPreAnalyzedSet(true)

      // Switch to pre-analyzed mode
      onCloudProcessingEnabledSet(false)
    } catch (error) {
      onError(
        `Failed to load demo "${demoLevel}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      onDemoLoadingSet(false)
    }
  }

  return (
    <section className="mb-8">
      <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_#000] pixel-border">
        <h3 className="font-['Press_Start_2P'] text-lg mb-4 text-text flex items-center">
          🎮 Try Demo Levels
        </h3>
        <p className="font-['Press_Start_2P'] text-xs text-text mb-4 opacity-80">
          Experience the game with pre-made levels of varying difficulty
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {demoLevels.map((level) => {
            const isSelected = selectedDemo === level.id
            const isLoading = isDemoLoading && selectedDemo === level.id

            return (
              <button
                key={level.id}
                onClick={() => handleDemoSelection(level.id)}
                disabled={isDemoLoading}
                className={`p-4 border-2 shadow-[4px_4px_0px_#000] pixel-border transition-all duration-200 ${
                  isSelected
                    ? level.colorClass
                    : `${level.bgClass} ${level.hoverClass} text-text ${level.borderClass}`
                } ${
                  isDemoLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div className="text-2xl mb-2">{level.emoji}</div>
                <div className="font-['Press_Start_2P'] text-xs mb-1">{level.name}</div>
                <div className="font-['Press_Start_2P'] text-xs opacity-70">
                  {isLoading ? 'Loading...' : level.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
