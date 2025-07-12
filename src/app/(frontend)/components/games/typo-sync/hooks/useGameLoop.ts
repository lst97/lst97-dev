import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameLoopHook, GameState, Keystroke, HiddenNote, HitResult } from '../types'
import { audioAnalysisService } from '../services/audioAnalysisService'
import { GAME_CONFIG } from '../config'

/**
 * Hook for managing game loop and player interactions
 */
export function useGameLoop(): GameLoopHook {
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    isLoading: false,
    gameStartTime: null,
    score: 0,
    feedback: '',
    feedbackColor: '#FFFFFF',
    gameLoopActive: false,
    isPaused: false,
    pauseStartTime: null,
    totalPauseTime: 0,

    // Enhanced metrics
    wpm: 0,
    accuracy: 0,
    streak: 0,
    combo: 0,
    maxStreak: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,

    // Timing data
    averageReactionTime: 0,
    hitTimings: [],

    // Session data
    sessionStartTime: null,
    sessionEndTime: null,
    sessionDuration: 0,
  })

  // Game data - using state instead of refs for reactivity
  const [currentKeystrokeMap, setCurrentKeystrokeMap] = useState<Keystroke[]>([])
  const [currentHiddenNotes, setCurrentHiddenNotes] = useState<HiddenNote[]>([])

  // Audio refs (these don't need to be reactive)
  const audioSourcesRef = useRef<AudioBufferSourceNode[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundEffectsRef = useRef<{
    base: AudioBuffer | null
    hiHat: AudioBuffer | null
    tambourine: AudioBuffer | null
  }>({
    base: null,
    hiHat: null,
    tambourine: null,
  })

  // State for forcing re-renders when keystrokes change
  const [keystrokeUpdateTrigger, setKeystrokeUpdateTrigger] = useState(0)

  // Feedback timeout ref
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Play sound effect
   */
  const playSoundEffect = useCallback((buffer: AudioBuffer | null) => {
    if (!buffer || !audioContextRef.current) return

    try {
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffer
      source.connect(audioContextRef.current.destination)
      source.start(0)

      // Keep reference for cleanup
      audioSourcesRef.current.push(source)

      // Clean up completed sources
      source.onended = () => {
        const index = audioSourcesRef.current.indexOf(source)
        if (index > -1) {
          audioSourcesRef.current.splice(index, 1)
        }
      }
    } catch (error) {
      console.warn('Error playing sound effect:', error)
    }
  }, [])

  /**
   * Update feedback with automatic timeout
   */
  const updateFeedback = useCallback(
    (result: HitResult, keystroke: Keystroke) => {
      // Clear existing timeout
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }

      // Update keystroke state and trigger re-render
      setCurrentKeystrokeMap((prevMap) => {
        const updatedMap = prevMap.map((k) => {
          if (k === keystroke) {
            const newState: 'hit' | 'missed' | 'upcoming' | 'typo' =
              result === 'SYNC' || result === 'LATE' || result === 'EARLY' ? 'hit' : 'missed'
            return { ...k, state: newState }
          }
          return k
        })
        return updatedMap
      })

      // Play sound effect based on result and note type
      if (result === 'SYNC' || result === 'LATE' || result === 'EARLY') {
        if (keystroke.type === 'beat') {
          playSoundEffect(soundEffectsRef.current.base)
        } else if (keystroke.type === 'melody') {
          playSoundEffect(soundEffectsRef.current.hiHat)
        }
      }

      // Trigger re-render to update visual components
      setKeystrokeUpdateTrigger((prev) => prev + 1)

      // Update score
      let scoreChange = 0
      switch (result) {
        case 'SYNC':
          scoreChange = GAME_CONFIG.SCORING.SYNC
          break
        case 'LATE':
        case 'EARLY':
          scoreChange = GAME_CONFIG.SCORING.LATE_EARLY
          break
        case 'TYPO':
          scoreChange = GAME_CONFIG.SCORING.TYPO
          break
        case 'OFF':
          scoreChange = GAME_CONFIG.SCORING.OFF
          break
      }

      // Feedback messages and colors
      const feedbackData = {
        SYNC: { message: 'Sync! ✨', color: '#00FF00' },
        LATE: { message: 'Late ⏰', color: '#FFFF00' },
        EARLY: { message: 'Early ⚡', color: '#FFFF00' },
        TYPO: { message: 'Typo! ❌', color: '#FF0000' },
        OFF: { message: 'Missed! 💔', color: '#FF0000' },
      }

      const feedback = feedbackData[result]

      setGameState((prev) => ({
        ...prev,
        score: prev.score + scoreChange,
        feedback: feedback.message,
        feedbackColor: feedback.color,
      }))

      // Clear feedback after 1 second
      feedbackTimeoutRef.current = setTimeout(() => {
        setGameState((prev) => ({ ...prev, feedback: '', feedbackColor: '#FFFFFF' }))
      }, 1000)
    },
    [playSoundEffect],
  )

  /**
   * Find matching hidden note for bonus points
   */
  const findMatchingHiddenNote = useCallback(
    (gameTime: number): HiddenNote | null => {
      const updatedHiddenNotes = [...currentHiddenNotes]
      for (const note of updatedHiddenNotes) {
        if (note.state === 'upcoming') {
          const timeDiff = gameTime - note.startTime
          // Use generous timing window for bonus notes
          if (Math.abs(timeDiff) <= GAME_CONFIG.TIMING_WINDOWS.LATE_EARLY) {
            note.state = 'hit'
            setCurrentHiddenNotes(updatedHiddenNotes)
            // Push a copy into keystroke map so renderer can detect and show burst
            setCurrentKeystrokeMap((prev) => [...prev, { ...note }])
            return note
          }
        }
      }
      return null
    },
    [currentHiddenNotes],
  )

  /**
   * Process hit for main game logic
   */
  const processHit = useCallback(
    (pressedKey: string, pressTime: number) => {
      if (!gameState.gameStartTime) return

      // Find the first upcoming keystroke
      const target = currentKeystrokeMap.find((k) => k.state === 'upcoming')

      if (!target) {
        return
      }

      // Calculate timing
      const gameTime = pressTime - gameState.gameStartTime
      const timeDiff = gameTime - target.startTime

      // Ignore inputs that are far too early
      if (timeDiff < -GAME_CONFIG.TIMING_WINDOWS.LATE_EARLY) {
        return
      }

      // Check for typo first
      if (pressedKey !== target.key) {
        updateFeedback('TYPO', target)
        return
      }

      // Key was correct, check timing accuracy
      if (Math.abs(timeDiff) <= GAME_CONFIG.TIMING_WINDOWS.SYNC) {
        updateFeedback('SYNC', target)
      } else if (Math.abs(timeDiff) <= GAME_CONFIG.TIMING_WINDOWS.LATE_EARLY) {
        if (timeDiff > 0) {
          updateFeedback('LATE', target)
        } else {
          updateFeedback('EARLY', target)
        }
      } else {
        updateFeedback('OFF', target)
      }
    },
    [gameState.gameStartTime, currentKeystrokeMap, updateFeedback],
  )

  /**
   * Handle keyboard input from player
   */
  const handleKeyPress = useCallback(
    (key: string) => {
      if (!gameState.isActive) return

      const pressTime = Date.now() / 1000

      // Check for hidden note hits
      if (key === '[Space]') {
        const gameTime = pressTime - (gameState.gameStartTime || 0)
        const hiddenNote = findMatchingHiddenNote(gameTime)
        if (hiddenNote) {
          playSoundEffect(soundEffectsRef.current.tambourine)
          // Bonus points for finding hidden notes
          setGameState((prev) => ({ ...prev, score: prev.score + 25 }))
          return
        }
      }

      // Process regular hit
      processHit(key, pressTime)
    },
    [
      gameState.isActive,
      gameState.gameStartTime,
      findMatchingHiddenNote,
      playSoundEffect,
      processHit,
    ],
  )

  /**
   * Check for missed notes in game loop
   */
  const checkMissedNotes = useCallback(() => {
    if (!gameState.isActive || !gameState.gameStartTime) return

    const gameTime = Date.now() / 1000 - gameState.gameStartTime

    const newlyMissedNotes: Keystroke[] = []
    const updatedKeystrokeMap = currentKeystrokeMap.map((keystroke) => {
      if (
        keystroke.state === 'upcoming' &&
        gameTime > keystroke.startTime + GAME_CONFIG.TIMING_WINDOWS.LATE_EARLY
      ) {
        const missedKeystroke = { ...keystroke, state: 'missed' as const }
        newlyMissedNotes.push(missedKeystroke)
        return missedKeystroke
      }
      return keystroke
    })

    if (newlyMissedNotes.length > 0) {
      newlyMissedNotes.forEach((keystroke) => {
        updateFeedback('OFF', keystroke)
      })

      setCurrentKeystrokeMap(updatedKeystrokeMap)
      setKeystrokeUpdateTrigger((prev) => prev + 1)
    }
  }, [gameState.isActive, gameState.gameStartTime, currentKeystrokeMap, updateFeedback])

  /**
   * Start the game with audio and keystroke data
   */
  const startGame = useCallback(
    async (audioBuffer: AudioBuffer, keystrokeMap: Keystroke[], hiddenNotes: HiddenNote[]) => {
      if (!audioBuffer || keystrokeMap.length === 0) {
        console.error('Invalid game data provided')
        return
      }

      setGameState((prev) => ({ ...prev, isLoading: true }))

      try {
        // Create audio context if needed
        if (!audioContextRef.current) {
          audioContextRef.current = await audioAnalysisService.createAudioContext()
        }

        // Load sound effects if not already loaded
        if (!soundEffectsRef.current.base) {
          soundEffectsRef.current = await audioAnalysisService.loadSoundEffects(
            audioContextRef.current,
          )
        }

        // Reset game data
        setCurrentKeystrokeMap(keystrokeMap.map((k) => ({ ...k, state: 'upcoming' })))
        setCurrentHiddenNotes(hiddenNotes.map((h) => ({ ...h, state: 'upcoming' })))

        // Schedule audio playback
        const startTime = audioContextRef.current.currentTime + 0.1
        const audioSource = audioAnalysisService.playAudioBuffer(
          audioBuffer,
          audioContextRef.current,
          startTime,
        )

        audioSourcesRef.current.push(audioSource)

        // Set up game end handler
        audioSource.onended = () => {
          stopGame()
        }

        // Start game state
        setGameState((prev) => ({
          ...prev,
          isActive: true,
          isLoading: false,
          gameStartTime: Date.now() / 1000 + 0.1, // Match audio start time
          score: 0,
          feedback: '',
          feedbackColor: '#FFFFFF',
          gameLoopActive: true,
        }))
      } catch (error) {
        console.error('Error starting game:', error)
        setGameState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [],
  )

  /**
   * Stop the game
   */
  const stopGame = useCallback(() => {
    // Stop all audio sources
    audioSourcesRef.current.forEach((source) => {
      try {
        source.stop()
      } catch (error) {
        // Source may already be stopped
      }
    })
    audioSourcesRef.current = []

    // Clear feedback timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }

    // Reset game state
    setGameState((prev) => ({
      ...prev,
      isActive: false,
      isLoading: false,
      gameStartTime: null,
      score: 0,
      feedback: '',
      feedbackColor: '#FFFFFF',
      gameLoopActive: false,
    }))
  }, [])

  /**
   * Game loop for checking missed notes
   */
  useEffect(() => {
    if (!gameState.gameLoopActive) return

    const interval = setInterval(checkMissedNotes, 50) // Check every 50ms

    return () => clearInterval(interval)
  }, [gameState.gameLoopActive, checkMissedNotes])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopGame()
    }
  }, [stopGame])

  return {
    startGame,
    stopGame,
    gameState,
    handleKeyPress,
    currentKeystrokeMap,
    currentHiddenNotes,
    keystrokeUpdateTrigger,
  }
}
