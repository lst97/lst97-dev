'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { useTypoSyncStore } from '../store/typoSyncStore'
import GameControls from './GameControls'
import EnhancedGameStats from './EnhancedGameStats'
import ThreeGameRenderer from './GameRenderer'
import { LoadingSpinner } from '@/app/(frontend)/components/common/loading'

export default function TypoSyncClient() {
  const {
    gameState,
    audioState,
    error,
    startGame,
    stopGame,
    handleKeyPress,
    analyzeAudio,
    generateKeystrokeMap,
    loadSessionHistory,
  } = useTypoSyncStore()

  // Refs for keyboard handling
  const keyboardListenerActiveRef = useRef(false)

  /**
   * Convert browser keyboard events to game key format
   */
  const convertKeyboardEvent = useCallback((event: KeyboardEvent): string => {
    // Prevent default for game-relevant keys
    if (event.key === ' ' || event.key === 'Enter' || event.key.length === 1) {
      event.preventDefault()
    }

    // Convert to game format
    switch (event.key) {
      case ' ':
        return '[Space]'
      case 'Enter':
        return '[Enter]'
      default:
        // Regular character keys
        if (event.key.length === 1) {
          return event.key.toLowerCase()
        }
        return ''
    }
  }, [])

  /**
   * Global keyboard event handler
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!keyboardListenerActiveRef.current || !gameState.isActive) return

      const gameKey = convertKeyboardEvent(event)
      if (gameKey) {
        // Use performance.now() for more accurate timing
        const currentTime = performance.now() / 1000
        handleKeyPress(gameKey, currentTime)
      }
    },
    [convertKeyboardEvent, handleKeyPress, gameState.isActive, audioState.audioContext],
  )

  /**
   * File upload handler
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      console.log('🎵 Starting audio analysis for:', file.name)
      await analyzeAudio(file)
    },
    [analyzeAudio],
  )

  /**
   * Generate keystroke map handler
   */
  const handleGenerateKeystrokeMap = useCallback(() => {
    console.log('🗺️ Generating keystroke map from analysis results')
    generateKeystrokeMap()
  }, [generateKeystrokeMap])

  /**
   * Start game handler
   */
  const handleStartGame = useCallback(() => {
    const { audioBuffer, keystrokeMap, hiddenNotes } = audioState

    console.log('🎮 Start game handler called', {
      hasAudioBuffer: !!audioBuffer,
      keystrokeMapLength: keystrokeMap.length,
      hiddenNotesLength: hiddenNotes.length,
    })

    if (!audioBuffer || keystrokeMap.length === 0) {
      console.error('Cannot start game: missing audio data or keystroke map', {
        audioBuffer: !!audioBuffer,
        keystrokeMapLength: keystrokeMap.length,
      })
      return
    }

    console.log('🎵 Starting game with enhanced metrics')

    // Activate keyboard listener
    keyboardListenerActiveRef.current = true

    // Start the game through Zustand
    startGame(audioBuffer, keystrokeMap, hiddenNotes)
  }, [audioState, startGame])

  /**
   * Stop game handler
   */
  const handleStopGame = useCallback(() => {
    console.log('🛑 Stopping game')
    keyboardListenerActiveRef.current = false
    stopGame()
  }, [stopGame])

  /**
   * Keystroke update handler for the Three.js renderer
   */
  const handleKeystrokeUpdate = useCallback((keystroke: any) => {
    console.log('Keystroke visual update:', keystroke.key, keystroke.state)
  }, [])

  /**
   * Determine control states
   */
  const canGenerateMap = Boolean(
    audioState.analysisResult && !audioState.isAnalyzing,
  )

  const canPlay = Boolean(
    audioState.audioBuffer &&
      audioState.keystrokeMap.length > 0 &&
      !audioState.isAnalyzing &&
      !gameState.isActive,
  )

  /**
   * Setup and cleanup keyboard listeners
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  /**
   * Load session history on component mount
   */
  useEffect(() => {
    loadSessionHistory()
  }, [loadSessionHistory])

  /**
   * Deactivate keyboard listener when game stops
   */
  useEffect(() => {
    if (!gameState.isActive) {
      keyboardListenerActiveRef.current = false
    }
  }, [gameState.isActive])


  /**
   * Debug logging
   */
  useEffect(() => {
    console.log('🎮 Enhanced game state:', {
      isActive: gameState.isActive,
      score: gameState.score,
      wpm: gameState.wpm,
      accuracy: gameState.accuracy,
      streak: gameState.streak,
      maxStreak: gameState.maxStreak,
    })
  }, [gameState])

  return (
    <div className="min-h-screen bg-[var(--background-color)] p-4">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-['Press_Start_2P'] text-[var(--text-color)] mb-2">
            🎵 TYPO-SYNC ENHANCED 🎮
          </h1>
          <p className="text-lg text-[var(--text-color)] opacity-80">
            Rhythm Typing Game with Advanced Metrics & Streak Tracking
          </p>
          <div className="text-sm text-[var(--text-color)] opacity-60 mt-2">
            Upload audio → AI analyzes beats & melody → Type to the rhythm with enhanced statistics!
          </div>
        </div>

        {/* Game Controls */}
        <GameControls
          onFileUpload={handleFileUpload}
          onGenerateKeystrokeMap={handleGenerateKeystrokeMap}
          onPlayWithMetronome={handleStartGame}
          onPlayMelody={handleStartGame}
          isAnalyzing={audioState.isAnalyzing}
          canGenerateMap={canGenerateMap}
          canPlay={canPlay}
        />
        
        {/* Additional controls */}
        <div className="flex justify-center gap-4 mt-4">
          {gameState.isActive && (
            <button
              onClick={handleStopGame}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-['Press_Start_2P'] text-sm hover:bg-red-700 transition-colors"
            >
              STOP GAME
            </button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Three.js Game Renderer */}
        <div className="h-[500px]">
          <ThreeGameRenderer
            gameConfig={{
              NOTE_SPEED_PPS: 200,
              HIT_ZONE_X: 100,
              NOTE_FONT: '32px Consolas',
              COLORS: {
                UPCOMING: '#FFFFFF',
                HIT: '#00FF00',
                MISSED: '#FF0000',
                TYPO: '#FFA500',
                HIT_ZONE: '#00FFFF',
              },
              TIMING_WINDOWS: {
                SYNC: 0.05,
                LATE_EARLY: 0.15,
              },
              SCORING: {
                SYNC: 100,
                LATE_EARLY: 50,
                TYPO: -25,
                OFF: -50,
              },
            }}
            onKeystrokeUpdate={handleKeystrokeUpdate}
          />
        </div>

        {/* Enhanced Game Statistics */}
        <EnhancedGameStats />
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md p-4 bg-red-100 border-2 border-red-400 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <h4 className="font-['Press_Start_2P'] text-red-800 text-sm mb-1">ERROR</h4>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {audioState.isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-background)] p-6 rounded-lg border-2 border-[var(--border-color)] text-center">
            <LoadingSpinner />
            <div className="mt-4 font-['Press_Start_2P'] text-sm text-[var(--text-color)]">
              Analyzing audio...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}