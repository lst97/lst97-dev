'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTypoSyncStore } from '../store/typoSyncStore'
import ThreeGameRenderer from './GameRenderer'
import KeyboardLayout from './KeyboardLayout'
import { motion } from 'framer-motion'
import {
  FaInfoCircle,
  FaCheckCircle,
  FaCog,
  FaPlay,
  FaRedo,
  FaUpload,
  FaStop,
  FaPause,
} from 'react-icons/fa'
import { MdAnalytics } from 'react-icons/md'

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
    console.log('⏸️ Pausing game')
    pauseGame()
  }, [pauseGame])

  /**
   * Resume game handler
   */
  const handleResumeGame = useCallback(() => {
    console.log('▶️ Resuming game')
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
      console.log('🎵 Starting audio analysis for:', file.name)
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
    console.log('🔄 Regenerating keystroke map from analysis results')
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

    console.log('🎵 Starting/restarting game with existing keystroke map')

    // Activate keyboard listener
    keyboardListenerActiveRef.current = true

    // Start the game through Zustand - it will handle resetting keystroke states
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
   * File input handler
   */
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload],
  )

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

        {/* Unified Game Controls */}
        <div className="mb-8">
          <div className="bg-card border-2 border-border shadow-[4px_4px_0px_#000] pixel-border p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Control Buttons Row */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* File Upload Button */}
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="audio-file-input"
                    disabled={audioState.isAnalyzing}
                  />
                  <label
                    htmlFor="audio-file-input"
                    className={`
                      bg-primary text-white font-['Press_Start_2P'] text-sm border-2 border-primary 
                      px-6 py-3 shadow-[4px_4px_0px_#000] pixel-border cursor-pointer
                      flex items-center gap-2 min-w-[200px] justify-center
                      ${
                        audioState.isAnalyzing
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200'
                      }
                    `}
                  >
                    {audioState.isAnalyzing ? (
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
                  </label>

                  {/* File name display during analysis */}
                  {audioState.isAnalyzing && uploadedFileName && (
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
                      onClick={handleRegenerateKeystrokeMap}
                      disabled={audioState.isAnalyzing}
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
                          onClick={gameState.isPaused ? handleResumeGame : handlePauseGame}
                          className="bg-warning text-white font-['Press_Start_2P'] text-sm border-2 border-warning p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 flex items-center justify-center w-12 h-12"
                          title={gameState.isPaused ? 'Resume game' : 'Pause game'}
                        >
                          {gameState.isPaused ? <FaPlay /> : <FaPause />}
                        </button>

                        {/* Stop Button */}
                        <button
                          onClick={handleStopGame}
                          className="bg-error text-white font-['Press_Start_2P'] text-sm border-2 border-error p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 flex items-center justify-center w-12 h-12"
                          title="Stop game"
                        >
                          <FaStop />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartGame}
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
        </div>

        {/* Main Game Area - Show only after keystroke map is generated */}
        {hasKeystrokeMap && (
          <div className="space-y-8">
            {/* Three.js Game Renderer */}
            <div className="bg-card border-4 border-border shadow-[8px_8px_0_#000] pixel-border">
              <div className="h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
                <ThreeGameRenderer
                  gameConfig={{
                    NOTE_SPEED_PPS: 200,
                    HIT_ZONE_X: 100,
                    NOTE_FONT: '32px Consolas',
                    COLORS: {
                      UPCOMING: '#2c2c2c',
                      HIT: '#4caf50',
                      MISSED: '#d7263d',
                      TYPO: '#ffb300',
                      HIT_ZONE: '#b58900',
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
