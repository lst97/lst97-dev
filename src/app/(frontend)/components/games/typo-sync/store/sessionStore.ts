import type {
  SessionStats,
  TypoSyncStore,
  ZustandGetter,
  ZustandSetter,
} from '../types'
// TODO: Add session history to local storage and make use of it
export interface SessionActions {
  startSession: () => void
  endSession: () => void
  saveSession: () => void
  loadSessionHistory: () => void
}

export const createSessionActions = (
  set: ZustandSetter<TypoSyncStore>,
  get: ZustandGetter<TypoSyncStore>,
): SessionActions => ({
  startSession: () => {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    const newSession: SessionStats = {
      id: sessionId,
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      score: 0,
      wpm: 0,
      accuracy: 0,
      streak: 0,
      maxStreak: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      incorrectKeystrokes: 0,
      hitTimings: [],
      averageReactionTime: 0,
    }

    set(() => ({
      currentSession: newSession,
    }))
  },

  endSession: () => {
    const { gameState, currentSession } = get()

    if (!currentSession) return

    const updatedSession: SessionStats = {
      ...currentSession,
      endTime: Date.now(),
      duration: gameState.sessionDuration,
      score: gameState.score,
      wpm: gameState.wpm,
      accuracy: gameState.accuracy,
      streak: gameState.streak,
      maxStreak: gameState.maxStreak,
      totalKeystrokes: gameState.totalKeystrokes,
      correctKeystrokes: gameState.correctKeystrokes,
      incorrectKeystrokes: gameState.incorrectKeystrokes,
      hitTimings: [...gameState.hitTimings],
      averageReactionTime: gameState.averageReactionTime,
    }

    set(() => ({
      currentSession: updatedSession,
    }))
  },

  saveSession: () => {
    const { currentSession } = get()

    if (!currentSession || !currentSession.endTime) return

    set((state: TypoSyncStore) => ({
      sessionHistory: [...state.sessionHistory, currentSession],
      currentSession: null,
    }))

    get().updatePerformanceMetrics()
  },

  loadSessionHistory: () => {
    // Handled by persist middleware
  },
})
