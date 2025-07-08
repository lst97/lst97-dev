'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { useAudioAnalysis } from '@/frontend/components/games/typo-sync/hooks/useAudioAnalysis'
import { useGameLoop } from '@/frontend/components/games/typo-sync/hooks/useGameLoop'
import GameControls from '@/frontend/components/games/typo-sync/components/GameControls'
import GameStats from '@/frontend/components/games/typo-sync/components/GameStats'
import ThreeGameRenderer from '@/frontend/components/games/typo-sync/components/GameRenderer'
import { LoadingSpinner } from '@/app/(frontend)/components/common/loading'
import dynamic from 'next/dynamic'

const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading dashboard...</div>
      </div>
    ),
  },
)

export default function TypoSyncGamePage() {
  // Hooks for game functionality
  const audioAnalysis = useAudioAnalysis()
  const gameLoop = useGameLoop()

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
      if (!keyboardListenerActiveRef.current) return

      const gameKey = convertKeyboardEvent(event)
      if (gameKey) {
        gameLoop.handleKeyPress(gameKey)
      }
    },
    [convertKeyboardEvent, gameLoop.handleKeyPress],
  )

  /**
   * File upload handler
   */
  const handleFileUpload = useCallback(
    (file: File) => {
      console.log('🎵 Starting audio analysis for:', file.name)
      audioAnalysis.analyzeAudio(file)
    },
    [audioAnalysis.analyzeAudio],
  )

  /**
   * Generate keystroke map handler
   */
  const handleGenerateKeystrokeMap = useCallback(() => {
    console.log('🗺️ Generating keystroke map from analysis results')
    audioAnalysis.generateKeystrokeMap()
  }, [audioAnalysis.generateKeystrokeMap])

  /**
   * Play with metronome handler
   */
  const handlePlayWithMetronome = useCallback(async () => {
    const { audioBuffer, keystrokeMap, hiddenNotes } = audioAnalysis.audioState

    if (!audioBuffer || keystrokeMap.length === 0) {
      console.error('Cannot start game: missing audio data or keystroke map')
      return
    }

    console.log('🎵 Starting game with metronome mode')

    // Activate keyboard listener
    keyboardListenerActiveRef.current = true

    // Start the game
    gameLoop.startGame(audioBuffer, keystrokeMap, hiddenNotes)
  }, [audioAnalysis.audioState, gameLoop.startGame])

  /**
   * Play melody handler
   */
  const handlePlayMelody = useCallback(async () => {
    const { audioBuffer, keystrokeMap, hiddenNotes } = audioAnalysis.audioState

    if (!audioBuffer || keystrokeMap.length === 0) {
      console.error('Cannot start game: missing audio data or keystroke map')
      return
    }

    console.log('🎼 Starting game with melody mode')

    // Activate keyboard listener
    keyboardListenerActiveRef.current = true

    // Start the game
    gameLoop.startGame(audioBuffer, keystrokeMap, hiddenNotes)
  }, [audioAnalysis.audioState, gameLoop.startGame])

  /**
   * Keystroke update handler for the Three.js renderer
   */
  const handleKeystrokeUpdate = useCallback((keystroke: any) => {
    // The Three.js renderer can use this to trigger visual effects
    // Currently, keystroke state is managed in the game loop
    console.log('Keystroke visual update:', keystroke.key, keystroke.state)
  }, [])

  /**
   * Determine control states
   */
  const canGenerateMap = Boolean(
    audioAnalysis.audioState.analysisResult && !audioAnalysis.isAnalyzing,
  )

  const canPlay = Boolean(
    audioAnalysis.audioState.audioBuffer &&
      audioAnalysis.audioState.keystrokeMap.length > 0 &&
      !audioAnalysis.isAnalyzing &&
      !gameLoop.gameState.isActive,
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
   * Deactivate keyboard listener when game stops
   */
  useEffect(() => {
    if (!gameLoop.gameState.isActive) {
      keyboardListenerActiveRef.current = false
    }
  }, [gameLoop.gameState.isActive])

  /**
   * Log state changes for debugging
   */
  useEffect(() => {
    console.log('🎮 Game state changed:', {
      isActive: gameLoop.gameState.isActive,
      score: gameLoop.gameState.score,
      keyboardActive: keyboardListenerActiveRef.current,
    })
  }, [gameLoop.gameState.isActive, gameLoop.gameState.score])

  /**
   * Log keystroke updates for debugging
   */
  useEffect(() => {
    if (gameLoop.gameState.isActive) {
      console.log('⌨️ Keystroke map updated, trigger:', gameLoop.keystrokeUpdateTrigger)
      console.log('📋 Current keystroke map length:', gameLoop.currentKeystrokeMap.length)
      const hitCount = gameLoop.currentKeystrokeMap.filter((k) => k.state === 'hit').length
      const missedCount = gameLoop.currentKeystrokeMap.filter((k) => k.state === 'missed').length
      const upcomingCount = gameLoop.currentKeystrokeMap.filter(
        (k) => k.state === 'upcoming',
      ).length
      console.log(
        `📊 Live Stats: ${hitCount} hits, ${missedCount} missed, ${upcomingCount} upcoming`,
      )

      // Also log what we're passing to GameStats
      const statsKeystrokeMap = gameLoop.gameState.isActive
        ? gameLoop.currentKeystrokeMap
        : audioAnalysis.audioState.keystrokeMap
      console.log('📊 Passing to GameStats:', {
        isActive: gameLoop.gameState.isActive,
        keystrokeMapLength: statsKeystrokeMap.length,
        hiddenNotesLength: gameLoop.gameState.isActive
          ? gameLoop.currentHiddenNotes.length
          : audioAnalysis.audioState.hiddenNotes.length,
      })
    }
  }, [
    gameLoop.keystrokeUpdateTrigger,
    gameLoop.gameState.isActive,
    gameLoop.currentKeystrokeMap,
    audioAnalysis.audioState.keystrokeMap,
    audioAnalysis.audioState.hiddenNotes,
    gameLoop.currentHiddenNotes,
  ])

  const TypoSyncGameContent = () => {
    return (
      <div className="min-h-screen bg-[var(--background-color)] p-4">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-['Press_Start_2P'] text-[var(--text-color)] mb-2">
              🎵 TYPO-SYNC 🎮
            </h1>
            <p className="text-lg text-[var(--text-color)] opacity-80">
              Rhythm Typing Game with AI-Powered Beat Detection
            </p>
            <div className="text-sm text-[var(--text-color)] opacity-60 mt-2">
              Upload audio → AI analyzes beats & melody → Type to the rhythm!
            </div>
          </div>

          {/* Game Controls */}
          <GameControls
            onFileUpload={handleFileUpload}
            onGenerateKeystrokeMap={handleGenerateKeystrokeMap}
            onPlayWithMetronome={handlePlayWithMetronome}
            onPlayMelody={handlePlayMelody}
            isAnalyzing={audioAnalysis.isAnalyzing}
            canGenerateMap={canGenerateMap}
            canPlay={canPlay}
          />
        </div>

        {/* Main Game Area */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Three.js Game Renderer */}
          <div className="h-[500px]">
            <ThreeGameRenderer
              keystrokeMap={
                gameLoop.gameState.isActive
                  ? gameLoop.currentKeystrokeMap
                  : audioAnalysis.audioState.keystrokeMap
              }
              gameState={gameLoop.gameState}
              analysisResult={audioAnalysis.audioState.analysisResult}
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

          {/* Game Statistics */}
          <GameStats
            score={gameLoop.gameState.score}
            feedback={gameLoop.gameState.feedback}
            feedbackColor={gameLoop.gameState.feedbackColor}
            keystrokeMap={
              gameLoop.gameState.isActive
                ? gameLoop.currentKeystrokeMap
                : audioAnalysis.audioState.keystrokeMap
            }
            hiddenNotes={
              gameLoop.gameState.isActive
                ? gameLoop.currentHiddenNotes
                : audioAnalysis.audioState.hiddenNotes
            }
          />
        </div>

        {/* Error Display */}
        {audioAnalysis.error && (
          <div className="fixed bottom-4 right-4 max-w-md p-4 bg-red-100 border-2 border-red-400 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <h4 className="font-['Press_Start_2P'] text-red-800 text-sm mb-1">ERROR</h4>
                <p className="text-red-700 text-sm">{audioAnalysis.error}</p>
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
      </div>
    )
  }

  return (
    <DynamicDashboard>
      <TypoSyncGameContent />
    </DynamicDashboard>
  )
}
