'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTypoSyncStore } from '../store'
import GameRenderer from './GameRenderer'
import { motion } from 'framer-motion'
import { FaInfoCircle, FaCheckCircle, FaCog } from 'react-icons/fa'
import { GAME_CONFIG } from '../config'
import { GameControls, KeyboardLayout } from './ui'

export default function TypoSyncClient() {
  const {
    gameState,
    audioState,
    error,
    startGame,
    stopGame,
    pauseGame,
    resumeGame,
    handleKeyPress,
    analyzeAudio,
    generateKeystrokeMap,
    loadSessionHistory,
  } = useTypoSyncStore()

  // Refs for keyboard handling
  const keyboardListenerActiveRef = useRef(false)

  // Mobile device detection
  const [isMobile, setIsMobile] = useState(false)

  // Local state for uploaded file name
  const [uploadedFileName, setUploadedFileName] = useState<string>('')

  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    setIsMobile(mobileRegex.test(userAgent))
  }, [])

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
   * Pause game handler
   */
  const handlePauseGame = useCallback(() => {
    pauseGame()
  }, [pauseGame])

  /**
   * Resume game handler
   */
  const handleResumeGame = useCallback(() => {
    resumeGame()
  }, [resumeGame])

  /**
   * Global keyboard event handler
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Handle ESC key for pause/resume
      if (event.key === 'Escape') {
        event.preventDefault()
        if (gameState.isActive) {
          if (gameState.isPaused) {
            handleResumeGame()
          } else {
            handlePauseGame()
          }
        }
        return
      }

      if (!keyboardListenerActiveRef.current || !gameState.isActive || gameState.isPaused) return

      const gameKey = convertKeyboardEvent(event)
      if (gameKey) {
        // Use performance.now() for more accurate timing
        const currentTime = performance.now() / 1000
        handleKeyPress(gameKey, currentTime)
      }
    },
    [
      convertKeyboardEvent,
      handleKeyPress,
      gameState.isActive,
      gameState.isPaused,
      handlePauseGame,
      handleResumeGame,
    ],
  )

  /**
   * File upload handler with auto-generation
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadedFileName(file.name)
      await analyzeAudio(file)
      // Auto-generation happens in the store after analysis completes
    },
    [analyzeAudio],
  )

  /**
   * Manual regenerate keystroke map handler
   */
  const handleRegenerateKeystrokeMap = useCallback(() => {
    generateKeystrokeMap()
  }, [generateKeystrokeMap])

  /**
   * Start game handler
   */
  const handleStartGame = useCallback(() => {
    const { audioBuffer, keystrokeMap, hiddenNotes } = audioState

    if (!audioBuffer || keystrokeMap.length === 0) {
      console.error('Cannot start game: missing audio data or keystroke map', {
        audioBuffer: !!audioBuffer,
        keystrokeMapLength: keystrokeMap.length,
      })
      return
    }

    // Activate keyboard listener
    keyboardListenerActiveRef.current = true

    // Start the game through Zustand - it will handle resetting keystroke states
    startGame(audioBuffer, keystrokeMap, hiddenNotes)
  }, [audioState, startGame])

  /**
   * Stop game handler
   */
  const handleStopGame = useCallback(() => {
    keyboardListenerActiveRef.current = false
    stopGame()
  }, [stopGame])

  /**
   * Determine control states
   */
  const hasKeystrokeMap = Boolean(audioState.keystrokeMap.length > 0)
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

  // InfoBox Component for consistent styling
  const InfoBox: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({
    title,
    children,
    icon,
  }) => (
    <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000] pixel-border">
      <div className="flex items-center mb-2">
        <div className="text-2xl text-accent mr-3">{icon}</div>
        <h3 className="font-['Press_Start_2P'] text-sm text-text">{title}</h3>
      </div>
      <div className="font-['Press_Start_2P'] text-xs text-text">{children}</div>
    </div>
  )

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-background">
      {/* Background decoration with floating animation */}
      <motion.div
        className="absolute inset-0 z-[-1] opacity-10"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 12,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        }}
      >
        <div className="absolute top-0 right-40 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl" />
      </motion.div>

      <main className="relative flex-grow w-full max-w-[1800px] mx-auto py-4 sm:py-6 md:py-8 mt-[100px] sm:mt-[120px] md:mt-[140px] lg:mt-[180px] px-4 sm:px-6 md:px-8">
        {/* Header Section */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Press_Start_2P'] text-text">
              🎵 TYPO-SYNC
            </h1>
          </div>
          <p className="text-base sm:text-lg text-text max-w-3xl font-['Press_Start_2P'] mb-4">
            Rhythm Typing Game with Advanced Beat Detection & Enhanced Metrics
          </p>
          <p className="text-xs sm:text-sm text-text max-w-3xl font-['Press_Start_2P'] mb-6 opacity-80">
            Upload audio → Advanced algorithm analyzes beats & melody → Type to the rhythm with
            precision!
          </p>

          {/* Mobile Device Warning */}
          {isMobile && (
            <div className="mb-6 p-4 bg-warning/10 border-2 border-warning pixel-border shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2 text-warning">
                📱 Mobile Device Detected
              </h3>
              <p className="text-xs text-warning/80">
                This game is optimized for desktop with physical keyboards. Mobile experience may be
                limited due to virtual keyboard constraints and performance requirements.
              </p>
            </div>
          )}

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <InfoBox title="Advanced Analysis" icon={<FaCheckCircle />}>
              <p>
                Advanced audio analysis detects beats, melody, and hidden notes for dynamic
                gameplay.
              </p>
            </InfoBox>

            <InfoBox title="Real-time Metrics" icon={<FaInfoCircle />}>
              <p>
                Track WPM, accuracy, streak, reaction time, and timing distribution in real-time.
              </p>
            </InfoBox>

            <InfoBox title="3D Visualization" icon={<FaCog />}>
              <p>
                Immersive Three.js renderer with pixel art aesthetics and smooth 60 FPS performance.
              </p>
            </InfoBox>
          </div>
        </section>

        {/* Game Controls */}
        <div className="mb-8">
          <GameControls
            onFileUpload={handleFileUpload}
            onRegenerateKeystrokeMap={handleRegenerateKeystrokeMap}
            onStartGame={handleStartGame}
            onPauseGame={handlePauseGame}
            onResumeGame={handleResumeGame}
            onStopGame={handleStopGame}
            isAnalyzing={audioState.isAnalyzing}
            hasKeystrokeMap={hasKeystrokeMap}
            canPlay={canPlay}
            gameState={{
              isActive: gameState.isActive,
              isPaused: gameState.isPaused,
            }}
            uploadedFileName={uploadedFileName}
          />
        </div>

        {/* Main Game Area - Show only after keystroke map is generated */}
        {hasKeystrokeMap && (
          <div className="space-y-8">
            {/* Three.js Game Renderer */}
            <div className="bg-card border-4 border-border shadow-[8px_8px_0_#000] pixel-border">
              <div className="h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
                <GameRenderer
                  gameConfig={{
                    NOTE_SPEED_PPS: GAME_CONFIG.NOTE_SPEED_PPS,
                    HIT_ZONE_X: GAME_CONFIG.HIT_ZONE_X,
                    NOTE_FONT: GAME_CONFIG.NOTE_FONT,
                    COLORS: GAME_CONFIG.COLORS,
                    TIMING_WINDOWS: GAME_CONFIG.TIMING_WINDOWS,
                    SCORING: GAME_CONFIG.SCORING,
                  }}
                />
              </div>
            </div>

            {/* Game Statistics are now overlaid on the game UI */}

            {/* Keyboard Layout - Below the game canvas */}
            <div className="mt-8">
              <KeyboardLayout
                keystrokeMap={audioState.keystrokeMap}
                gameState={{
                  isActive: gameState.isActive,
                  isPaused: gameState.isPaused,
                  sessionEndTime: gameState.sessionEndTime,
                }}
                className="w-full max-w-4xl mx-auto"
              />
            </div>
          </div>
        )}

        {/* How to Play Section */}
        <section className="mt-12 mb-8" aria-labelledby="how-to-play">
          <h2 id="how-to-play" className="text-2xl font-['Press_Start_2P'] mb-6 text-text">
            How to Play
          </h2>
          <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_#000] pixel-border">
            <ol className="font-['Press_Start_2P'] text-xs space-y-3 list-decimal pl-5 text-text">
              <li>
                <strong>Upload Audio:</strong> Choose an MP3, WAV, or other audio file
              </li>
              <li>
                <strong>Analysis:</strong> Wait for the advanced algorithm to analyze beats and
                melody patterns
              </li>
              <li>
                <strong>Play:</strong> Type the appearing letters in perfect rhythm with the music
              </li>
              <li>
                <strong>Score:</strong> Earn points for perfect timing, lose points for mistakes
              </li>
              <li>
                <strong>Hidden Notes:</strong> Watch for special tambourine notes for bonus points
              </li>
            </ol>
          </div>
        </section>
      </main>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md z-50">
          <div className="bg-error border-2 border-error text-white p-4 shadow-[4px_4px_0px_#000] pixel-border">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-['Press_Start_2P'] text-sm mb-2">ERROR</h4>
                <p className="text-xs mb-3 leading-relaxed">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white text-error px-3 py-1 font-['Press_Start_2P'] text-xs border border-white hover:bg-error hover:text-white transition-all duration-200"
                >
                  🔄 RELOAD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
