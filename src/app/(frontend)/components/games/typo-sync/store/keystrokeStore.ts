import { GAME_CONFIG } from '../config'
import type { Keystroke } from '../types'

export interface KeystrokeActions {
  handleKeyPress: (key: string, currentTime: number) => void
  updateKeystrokeState: (keystroke: Keystroke, newState: Keystroke['state']) => void
  updateKeystrokeStateWithTiming: (
    keystroke: Keystroke,
    newState: Keystroke['state'],
    timingAccuracy: 'sync' | 'early' | 'late' | 'miss',
    hitTiming: number,
  ) => void
  startMissDetection: () => void
  stopMissDetection: () => void
  checkForMissedKeystrokes: () => void
}

let missDetectionInterval: NodeJS.Timeout | null = null

export const createKeystrokeActions = (set: any, get: any): KeystrokeActions => ({
  handleKeyPress: (key: string, currentTime: number) => {
    const { gameState, audioState } = get()
    if (!gameState.isActive || gameState.isPaused) return

    // Calculate current game time (excluding pause time)
    const totalGameTime = gameState.gameStartTime ? currentTime - gameState.gameStartTime / 1000 : 0
    const gameTime = totalGameTime - gameState.totalPauseTime / 1000

    // Find upcoming keystrokes that match the pressed key
    const matchingKeystrokes = audioState.keystrokeMap.filter(
      (k: any) => k.state === 'upcoming' && k.key === key,
    )

    // Debug info for [Enter] key specifically
    if (key === '[Enter]') {
      const allEnterKeystrokes = audioState.keystrokeMap.filter((k: any) => k.key === '[Enter]')
      const upcomingEnterKeystrokes = allEnterKeystrokes.filter((k: any) => k.state === 'upcoming')
    }

    // Check for hidden notes FIRST (space key pressed on pre-generated hidden notes in keystrokeMap)
    // Hidden notes have priority over regular keystrokes
    let hiddenNoteHit = false
    if (key === '[Space]') {
      // Find upcoming hidden notes in the unified keystrokeMap
      const upcomingHiddenNotes = audioState.keystrokeMap.filter(
        (k: any) => k.type === 'hidden' && k.state === 'upcoming' && k.key === '[Space]',
      )

      if (upcomingHiddenNotes.length > 0) {
        const closestHiddenNote = upcomingHiddenNotes.reduce((closest: any, current: any) => {
          const closestTiming = Math.abs(gameTime - closest.startTime)
          const currentTiming = Math.abs(gameTime - current.startTime)
          return currentTiming < closestTiming ? current : closest
        })

        const hiddenNoteTiming = Math.abs(gameTime - closestHiddenNote.startTime)

        // Hidden note hit window: 150ms
        if (hiddenNoteTiming <= 0.15) {
          hiddenNoteHit = true

          // Play hidden note sound effect
          get().playHiddenNoteSound()

          // Update hidden note state to hit in keystrokeMap
          get().updateKeystrokeState(closestHiddenNote, 'hit')

          // Update score for hidden note
          set((state: any) => ({
            gameState: {
              ...state.gameState,
              score: state.gameState.score + 25,
            },
          }))

          return
        }
      }
    }

    // If hidden note was hit, don't process regular keystrokes
    if (hiddenNoteHit) {
      return
    }

    // Define timing windows
    const HIT_WINDOW = GAME_CONFIG.TIMING_WINDOWS.HIT
    const TYPO_WINDOW = GAME_CONFIG.TIMING_WINDOWS.TYPO
    const IGNORE_WINDOW = GAME_CONFIG.TIMING_WINDOWS.IGNORE

    // Check for any upcoming keystrokes near the hit zone (regardless of key)
    const nearbyKeystrokes = audioState.keystrokeMap.filter(
      (k: any) => k.state === 'upcoming' && k.type !== 'hidden',
    )

    if (nearbyKeystrokes.length === 0) {
      return
    }

    // Find the closest upcoming keystroke in time (regardless of key)
    const closestKeystroke = nearbyKeystrokes.reduce((closest: any, current: any) => {
      const closestTiming = Math.abs(gameTime - closest.startTime)
      const currentTiming = Math.abs(gameTime - current.startTime)
      return currentTiming < closestTiming ? current : closest
    })

    // Calculate timing difference
    const timing = gameTime - closestKeystroke.startTime
    const timingAbs = Math.abs(timing)

    // If the key is pressed too far from any keystroke, ignore it
    if (timingAbs > IGNORE_WINDOW) {
      return
    }

    // Check if the pressed key matches the closest keystroke
    const isCorrectKey = closestKeystroke.key === key

    // Determine hit result
    let isCorrect = false
    let feedback = 'MISS'
    let feedbackColor = GAME_CONFIG.COLORS.MISSED
    let points = -25
    let timingAccuracy: 'sync' | 'early' | 'late' | 'miss' = 'miss'
    let newState: 'hit' | 'missed' | 'typo' = 'missed'

    if (timingAbs <= TYPO_WINDOW) {
      if (isCorrectKey && timingAbs <= HIT_WINDOW) {
        // Correct key within hit window
        isCorrect = true
        newState = 'hit'
        if (timingAbs <= 0.08) {
          // Perfect hit - expanded window from 50ms to 80ms for better sync detection
          feedback = 'PERFECT!'
          feedbackColor = GAME_CONFIG.COLORS.HIT
          points = 100
          timingAccuracy = 'sync'
        } else {
          // Good hit
          feedback = timing < 0 ? 'EARLY' : 'LATE'
          feedbackColor = timing < 0 ? GAME_CONFIG.COLORS.EARLY : GAME_CONFIG.COLORS.LATE
          points = 50
          timingAccuracy = timing < 0 ? 'early' : 'late'
        }

        // Play appropriate sound effect
        get().playKeystrokeSound(closestKeystroke.key)
      } else if (!isCorrectKey) {
        // Wrong key within typo window
        isCorrect = false
        newState = 'typo'
        feedback = 'TYPO!'
        feedbackColor = GAME_CONFIG.COLORS.TYPO
        points = -50
        timingAccuracy = 'miss'
      } else {
        // Correct key but outside hit window (late miss)
        isCorrect = false
        newState = 'missed'
        feedback = 'MISS'
        feedbackColor = GAME_CONFIG.COLORS.MISSED
        points = -25
        timingAccuracy = 'miss'
      }
    } else {
      // Too far from any keystroke
      isCorrect = false
      newState = 'missed'
      feedback = 'MISS'
      feedbackColor = GAME_CONFIG.COLORS.MISSED
      points = -25
      timingAccuracy = 'miss'
    }

    // Update keystroke state with timing information
    get().updateKeystrokeStateWithTiming(closestKeystroke, newState, timingAccuracy, timing)

    // Update metrics
    get().updateStreak(isCorrect)
    get().addHitTiming(timing)
    get().calculateWPM()
    get().calculateAccuracy()

    // Update score and metrics
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        score: state.gameState.score + points,
        totalKeystrokes: state.gameState.totalKeystrokes + 1,
        correctKeystrokes: isCorrect
          ? state.gameState.correctKeystrokes + 1
          : state.gameState.correctKeystrokes,
        incorrectKeystrokes: isCorrect
          ? state.gameState.incorrectKeystrokes
          : state.gameState.incorrectKeystrokes + 1,
      },
    }))
  },

  updateKeystrokeState: (keystroke: Keystroke, newState: Keystroke['state']) => {
    set((state: any) => ({
      audioState: {
        ...state.audioState,
        keystrokeMap: state.audioState.keystrokeMap.map((k: any) =>
          k.startTime === keystroke.startTime && k.key === keystroke.key
            ? { ...k, state: newState }
            : k,
        ),
      },
    }))
  },

  updateKeystrokeStateWithTiming: (
    keystroke: Keystroke,
    newState: Keystroke['state'],
    timingAccuracy: 'sync' | 'early' | 'late' | 'miss',
    hitTiming: number,
  ) => {
    set((state: any) => ({
      audioState: {
        ...state.audioState,
        keystrokeMap: state.audioState.keystrokeMap.map((k: any) =>
          k.startTime === keystroke.startTime && k.key === keystroke.key
            ? { ...k, state: newState, timingAccuracy, hitTiming }
            : k,
        ),
      },
    }))
  },

  startMissDetection: () => {
    get().stopMissDetection()

    missDetectionInterval = setInterval(() => {
      const { gameState } = get()
      if (gameState.isActive) {
        get().checkForMissedKeystrokes()
        // Also update WPM regularly
        get().calculateWPM()
      }
    }, 100)
  },

  stopMissDetection: () => {
    if (missDetectionInterval) {
      clearInterval(missDetectionInterval)
      missDetectionInterval = null
    }
  },

  checkForMissedKeystrokes: () => {
    const { gameState, audioState } = get()
    if (!gameState.isActive || !gameState.gameStartTime || gameState.isPaused) return

    const currentTime = performance.now() / 1000
    const totalGameTime = currentTime - gameState.gameStartTime / 1000
    const gameTime = totalGameTime - gameState.totalPauseTime / 1000
    const MISS_WINDOW = GAME_CONFIG.TIMING_WINDOWS.IGNORE

    // Find regular keystrokes that have passed the miss window and should be marked as missed
    const regularKeystrokesToMiss = audioState.keystrokeMap.filter((keystroke: any) => {
      if (keystroke.state !== 'upcoming') return false
      if (keystroke.type === 'hidden') return false // Hidden notes handled separately

      const timeDifference = gameTime - keystroke.startTime
      // If game time has passed keystroke time by more than MISS_WINDOW, mark as missed
      return timeDifference > MISS_WINDOW
    })

    // Find hidden notes that have passed the window (for cleanup only, no penalty)
    const expiredHiddenNotes = audioState.keystrokeMap.filter((keystroke: any) => {
      if (keystroke.state !== 'upcoming') return false
      if (keystroke.type !== 'hidden') return false

      const timeDifference = gameTime - keystroke.startTime
      return timeDifference > MISS_WINDOW * 2 // Give hidden notes more time before cleanup
    })

    // Process regular keystroke misses (with penalty)
    if (regularKeystrokesToMiss.length > 0) {
      regularKeystrokesToMiss.forEach((keystroke: any) => {
        // Update keystroke state to missed with timing info
        get().updateKeystrokeStateWithTiming(keystroke, 'missed', 'miss', 0)

        // Update streak (breaks streak)
        get().updateStreak(false)

        // Update metrics
        set((state: any) => ({
          gameState: {
            ...state.gameState,
            totalKeystrokes: state.gameState.totalKeystrokes + 1,
            incorrectKeystrokes: state.gameState.incorrectKeystrokes + 1,
            score: state.gameState.score - 25, // Penalty for missing
          },
        }))
      })

      // Recalculate accuracy after missing keystrokes
      get().calculateAccuracy()
    }

    // Process expired hidden notes (cleanup only, no penalty)
    if (expiredHiddenNotes.length > 0) {
      expiredHiddenNotes.forEach((hiddenNote: any) => {
        // Just mark as missed for cleanup, no score penalty
        get().updateKeystrokeState(hiddenNote, 'missed')
      })
    }
  },
})
