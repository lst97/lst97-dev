import type { TypoSyncStore, ZustandGetter, ZustandSetter } from '../types'

export interface MetricsActions {
  updateScore: (change: number, feedback?: string, color?: string) => void
  calculateWPM: () => void
  calculateAccuracy: () => void
  updateStreak: (wasCorrect: boolean) => void
  addHitTiming: (timing: number) => void
}

export const createMetricsActions = (
  set: ZustandSetter<TypoSyncStore>,
  get: ZustandGetter<TypoSyncStore>,
): MetricsActions => ({
  updateScore: (change: number, feedback = '', color = '#ffffff') => {
    set((state: TypoSyncStore) => ({
      gameState: {
        ...state.gameState,
        score: state.gameState.score + change, // Allow negative scores
        feedback,
        feedbackColor: color,
      },
    }))
  },

  calculateWPM: () => {
    const { gameState } = get()
    if (!gameState.gameStartTime) return

    // Calculate effective game time (excluding pause time)
    const currentTime = performance.now()
    const totalGameTime = currentTime - gameState.gameStartTime
    const pauseTime =
      gameState.isPaused && gameState.pauseStartTime
        ? currentTime - gameState.pauseStartTime
        : 0
    const effectiveGameTime =
      totalGameTime - gameState.totalPauseTime - pauseTime

    const timeElapsed = effectiveGameTime / 1000 / 60 // minutes
    const wordsTyped = gameState.correctKeystrokes / 5 // Standard: 5 characters = 1 word

    // Only calculate WPM if we have at least 3 seconds of game time and some keystrokes
    let wpm = 0
    if (timeElapsed > 3 / 60 && gameState.correctKeystrokes > 0) {
      // At least 3 seconds
      wpm = Math.round(wordsTyped / timeElapsed)
    }

    set((state: TypoSyncStore) => ({
      gameState: {
        ...state.gameState,
        wpm,
      },
    }))
  },

  calculateAccuracy: () => {
    const { gameState } = get()

    if (gameState.totalKeystrokes === 0) {
      set((state: TypoSyncStore) => ({
        gameState: {
          ...state.gameState,
          accuracy: 0,
        },
      }))
      return
    }

    const accuracy = Math.round(
      (gameState.correctKeystrokes / gameState.totalKeystrokes) * 100,
    )

    set((state: TypoSyncStore) => ({
      gameState: {
        ...state.gameState,
        accuracy: Math.max(0, Math.min(100, accuracy)),
      },
    }))
  },

  updateStreak: (wasCorrect: boolean) => {
    set((state: TypoSyncStore) => {
      const newStreak = wasCorrect ? state.gameState.streak + 1 : 0
      const newMaxStreak = Math.max(state.gameState.maxStreak, newStreak)
      const newCorrectKeystrokes = wasCorrect
        ? state.gameState.correctKeystrokes + 1
        : state.gameState.correctKeystrokes
      const newIncorrectKeystrokes = wasCorrect
        ? state.gameState.incorrectKeystrokes
        : state.gameState.incorrectKeystrokes + 1

      return {
        gameState: {
          ...state.gameState,
          streak: newStreak,
          maxStreak: newMaxStreak,
          correctKeystrokes: newCorrectKeystrokes,
          incorrectKeystrokes: newIncorrectKeystrokes,
          totalKeystrokes: state.gameState.totalKeystrokes + 1,
        },
      }
    })
  },

  addHitTiming: (timing: number) => {
    set((state: TypoSyncStore) => {
      const newHitTimings = [...state.gameState.hitTimings, timing]
      const averageReactionTime =
        newHitTimings.reduce((a, b) => a + Math.abs(b), 0) /
        newHitTimings.length

      return {
        gameState: {
          ...state.gameState,
          hitTimings: newHitTimings,
          averageReactionTime,
        },
      }
    })
  },
})
